import { type APIEmbedField, EmbedBuilder, type GuildTextBasedChannel, inlineCode, userMention } from 'discord.js';
import { MessageActionRow, SlashCommand } from '../Structures';
import { embedPages, getServerConfig, getVerifyUser, getVerifyUsers } from '../Util';

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
        const { config } = client;

        const guild = await client.guilds.fetch(config.guildId);

        const group = options.getSubcommandGroup(true);
        const subcommand = options.getSubcommand(true);

        const { verifiedRoleId } = await getServerConfig(client);
        const verifyUsers = await getVerifyUsers(client);

        switch (group) {
            case 'users': {
                switch (subcommand) {
                    case 'list': {
                        const members = (await guild.members.fetch()).toJSON();
                        const fields: APIEmbedField[] = [];

                        for (const member of members) {
                            const verifyUser = await getVerifyUser(client, { userId: member.id });

                            const mention = userMention(verifyUser?.userId ?? member.id);
                            const studentNumber = inlineCode(verifyUser?.leerlingnummer ?? '-');

                            fields.push({
                                name: `${studentNumber} ${verifyUser ? '✅' : '❌'}`,
                                value: `User: ${mention}`,
                            });
                        }

                        const embed = new EmbedBuilder().setTitle('Verified users').setTimestamp();

                        return embedPages(
                            interaction,
                            embed,
                            fields.sort((a, b) => Number(b.name.endsWith('✅')) - Number(a.name.endsWith('✅')))
                        );
                    }
                    case 'add': {
                        const user = options.getUser('user', true);
                        const studentNumber = options.getString('student-number', true);

                        const member = await guild.members.fetch(user.id);

                        if (verifyUsers.some(u => u.userId === user.id))
                            await client.verificationCollection.deleteOne({ userId: user.id });

                        await client.verificationCollection.insertOne({
                            userId: user.id,
                            leerlingnummer: studentNumber,
                        });

                        await member.roles.add(verifiedRoleId);

                        const embed = new EmbedBuilder()
                            .setTitle('This user has been verified')
                            .setDescription(member.user.username)
                            .setColor(config.color);

                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'remove': {
                        const user = options.getUser('user', true);

                        await client.verificationCollection.deleteOne({ userId: user.id });

                        const member = await guild.members.fetch(user.id).catch(() => null);

                        if (member) await member.roles.remove(verifiedRoleId);

                        const embed = new EmbedBuilder()
                            .setTitle('This user has been unverified')
                            .setDescription(user.username)
                            .setColor(config.color);

                        return interaction.editReply({ embeds: [embed] });
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

                        const row = new MessageActionRow().setComponents(verifyButton, helpButton);

                        await interaction.deleteReply();

                        return channel.send({ embeds: [embed], components: [row] });
                    }
                    default:
                        return;
                }
            }
        }
    });
