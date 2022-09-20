import {
    ActionRowBuilder,
    APIEmbedField,
    EmbedBuilder,
    GuildTextBasedChannel,
    inlineCode,
    MessageActionRowComponentBuilder,
    userMention,
} from 'discord.js';
import { SlashCommand } from '../Structures';
import { embedPages } from '../Util';

export default new SlashCommand()
    .setName('verify')
    .setDescription('Manage the verification system.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(0n)
    .addSubcommandGroup(group =>
        group
            .setName('users')
            .setDescription('Manage verified users.')
            .addSubcommand(subcommand => subcommand.setName('list').setDescription('List all verified users.'))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('add')
                    .setDescription('Manually verify a user.')
                    .addUserOption(option =>
                        option.setName('user').setDescription('The user to verify.').setRequired(true)
                    )
                    .addStringOption(option =>
                        option.setName('name').setDescription('The name of the user.').setRequired(true)
                    )
                    .addStringOption(option =>
                        option
                            .setName('student-number')
                            .setDescription('The student number of the user.')
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('remove')
                    .setDescription('Remove a verified user.')
                    .addUserOption(option =>
                        option.setName('user').setDescription('The user to remove.').setRequired(true)
                    )
            )
    )
    .addSubcommandGroup(group =>
        group
            .setName('message')
            .setDescription('Manage the verify message.')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('send')
                    .setDescription('Send the verify message.')
                    .addChannelOption(option =>
                        option.setName('channel').setDescription('The channel to send the message in.')
                    )
            )
    )
    .setCallback(async interaction => {
        await interaction.deferReply();

        const { client, options } = interaction;

        const group = options.getSubcommandGroup(true);
        const subcommand = options.getSubcommand(true);

        const { verifiedRoleId } = await client.getServerConfigSchema();

        const verifyUsers = await client.verificationCollection.find().toArray();

        switch (group) {
            case 'users': {
                switch (subcommand) {
                    case 'list': {
                        const fields: APIEmbedField[] = verifyUsers.map(user => ({
                            name: user.naam,
                            value:
                                `User: ${userMention(user.userId)}\n` +
                                `Leerlingnummer: ${inlineCode(user.leerlingnummer)}`,
                        }));

                        const embed = new EmbedBuilder().setTitle('Verified users').setTimestamp();

                        return embedPages(interaction, embed, fields);
                    }
                    case 'add': {
                        const user = options.getUser('user', true);
                        const name = options.getString('name', true);
                        const studentNumber = options.getString('student-number', true);

                        const member = await interaction.guild.members.fetch(user.id);

                        await client.verificationCollection.insertOne({
                            userId: user.id,
                            naam: name,
                            leerlingnummer: studentNumber,
                        });

                        await member.roles.add(verifiedRoleId);

                        return interaction.editReply('Succesfully verified that user.');
                    }
                    case 'remove': {
                        const user = options.getUser('user', true);

                        await client.verificationCollection.deleteOne({ userId: user.id });

                        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

                        if (member) await member.roles.remove(verifiedRoleId);

                        return interaction.editReply('Succesfully unverified that user.');
                    }
                    default:
                        return;
                }
            }
            case 'message': {
                switch (subcommand) {
                    case 'send': {
                        const channel = (options.getChannel('channel') as GuildTextBasedChannel) ?? interaction.channel;

                        const embed = new EmbedBuilder()
                            .setDescription('Om toegang tot de server te krijgen, klik op de knop onder dit bericht.')
                            .setImage('https://i.imgur.com/zulMmYv.gif')
                            .setColor(client.config.color);

                        const verifyButton = client.components.getButton('verify', true);
                        const helpButton = client.components.getButton('help', true);

                        const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                            verifyButton,
                            helpButton
                        );

                        await interaction.deleteReply();

                        return channel.send({ embeds: [embed], components: [row] });
                    }
                    default:
                        return;
                }
            }
        }
    });
