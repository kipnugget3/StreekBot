import { channelMention, roleMention } from 'discord.js';
import { SlashCommand } from '../Structures';

export default new SlashCommand()
    .setName('serverconfig')
    .setDescription('Manages the server configuration.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(0n)
    .addSubcommandGroup(group =>
        group
            .setName('staff-role')
            .setDescription('Manages the staff role.')
            .addSubcommand(subcommand => subcommand.setName('show').setDescription('Shows the current staff role.'))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('set')
                    .setDescription('Sets the staff role.')
                    .addRoleOption(option =>
                        option.setName('role').setDescription('The role to set.').setRequired(true)
                    )
            )
    )
    .addSubcommandGroup(group =>
        group
            .setName('verified-role')
            .setDescription('Manages the verified role.')
            .addSubcommand(subcommand => subcommand.setName('show').setDescription('Shows the current verified role.'))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('set')
                    .setDescription('Sets the verified role.')
                    .addRoleOption(option =>
                        option.setName('role').setDescription('The role to set.').setRequired(true)
                    )
            )
    )
    .addSubcommandGroup(group =>
        group
            .setName('verification-support-role')
            .setDescription('Manages the verification support role.')
            .addSubcommand(subcommand =>
                subcommand.setName('show').setDescription('Shows the current verification support role.')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('set')
                    .setDescription('Sets the verification support role.')
                    .addRoleOption(option =>
                        option.setName('role').setDescription('The role to set.').setRequired(true)
                    )
            )
    )
    .addSubcommandGroup(group =>
        group
            .setName('log-channel')
            .setDescription('Manages the log channel.')
            .addSubcommand(subcommand => subcommand.setName('show').setDescription('Shows the current log channel.'))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('set')
                    .setDescription('Sets the log channel.')
                    .addChannelOption(option =>
                        option.setName('channel').setDescription('The channel to set.').setRequired(true)
                    )
            )
    )
    .addSubcommandGroup(group =>
        group
            .setName('verify-errors-channel')
            .setDescription('Manages the verify-errors channel.')
            .addSubcommand(subcommand =>
                subcommand.setName('show').setDescription('Shows the current verify-errors channel.')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('set')
                    .setDescription('Sets the verify-errors channel.')
                    .addChannelOption(option =>
                        option.setName('channel').setDescription('The channel to set.').setRequired(true)
                    )
            )
    )
    .addSubcommandGroup(group =>
        group
            .setName('verify-logs-channel')
            .setDescription('Manages the verify-logs channel.')
            .addSubcommand(subcommand =>
                subcommand.setName('show').setDescription('Shows the current verify-logs channel.')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('set')
                    .setDescription('Sets the verify-logs channel.')
                    .addChannelOption(option =>
                        option.setName('channel').setDescription('The channel to set.').setRequired(true)
                    )
            )
    )
    .addSubcommandGroup(group =>
        group
            .setName('verify-support-channel')
            .setDescription('Manages the verify-support channel.')
            .addSubcommand(subcommand =>
                subcommand.setName('show').setDescription('Shows the current verify-support channel.')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('set')
                    .setDescription('Sets the verify-support channel.')
                    .addChannelOption(option =>
                        option.setName('channel').setDescription('The channel to set.').setRequired(true)
                    )
            )
    )
    .addSubcommandGroup(group =>
        group
            .setName('welcome-channel')
            .setDescription('Manages the welcome channel.')
            .addSubcommand(subcommand =>
                subcommand.setName('show').setDescription('Shows the current welcome channel.')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('set')
                    .setDescription('Sets the welcome channel.')
                    .addChannelOption(option =>
                        option.setName('channel').setDescription('The channel to set.').setRequired(true)
                    )
            )
    )
    .setCallback(async interaction => {
        await interaction.deferReply();

        const { serverConfigCollection } = interaction.client;

        const group = interaction.options.getSubcommandGroup(true);
        const subcommand = interaction.options.getSubcommand(true);

        const {
            _id,
            staffRoleId,
            verifiedRoleId,
            verificationSupportRoleId,
            logChannelId,
            verifyErrorsChannelId,
            verifyLogsChannelId,
            verifySupportChannelId,
            welcomeChannelId,
        } = await interaction.client.getServerConfigSchema();

        switch (group) {
            case 'staff-role':
                if (subcommand === 'show') {
                    if (!staffRoleId) return interaction.editReply('The staff role is not set.');

                    return interaction.editReply({
                        content: `The staff role is ${roleMention(staffRoleId)}.`,
                        allowedMentions: { roles: [] },
                    });
                } else if (subcommand === 'set') {
                    const { id } = interaction.options.getRole('role', true);

                    await serverConfigCollection.updateOne({ _id }, { $set: { staffRoleId: id } });

                    return interaction.editReply('Successfully set the staff role.');
                }
                break;
            case 'verified-role':
                if (subcommand === 'show') {
                    if (!verifiedRoleId) return interaction.editReply('The verified role is not set.');

                    return interaction.editReply({
                        content: `The verified role is ${roleMention(verifiedRoleId)}.`,
                        allowedMentions: { roles: [] },
                    });
                } else if (subcommand === 'set') {
                    const { id } = interaction.options.getRole('role', true);

                    await serverConfigCollection.updateOne({ _id }, { $set: { verifiedRoleId: id } });

                    return interaction.editReply('Successfully set the verified role.');
                }
                break;
            case 'verification-support-role':
                if (subcommand === 'show') {
                    if (!verificationSupportRoleId)
                        return interaction.editReply('The verification support role is not set.');

                    return interaction.editReply({
                        content: `The verification support role is ${roleMention(verificationSupportRoleId)}.`,
                        allowedMentions: { roles: [] },
                    });
                } else if (subcommand === 'set') {
                    const { id } = interaction.options.getRole('role', true);

                    await serverConfigCollection.updateOne({ _id }, { $set: { verificationSupportRoleId: id } });

                    return interaction.editReply('Successfully set the verification support role.');
                }
                break;
            case 'log-channel':
                if (subcommand === 'show') {
                    if (!logChannelId) return interaction.editReply('The log channel is not set.');

                    return interaction.editReply({
                        content: `The log channel is ${channelMention(logChannelId)}.`,
                        allowedMentions: { roles: [] },
                    });
                } else if (subcommand === 'set') {
                    const { id } = interaction.options.getChannel('channel', true);

                    await serverConfigCollection.updateOne({ _id }, { $set: { logChannelId: id } });

                    return interaction.editReply('Successfully set the log channel.');
                }
                break;
            case 'verify-errors-channel':
                if (subcommand === 'show') {
                    if (!verifyErrorsChannelId) return interaction.editReply('The verify errors channel is not set.');

                    return interaction.editReply({
                        content: `The verify errors channel is ${channelMention(verifyErrorsChannelId)}.`,
                        allowedMentions: { roles: [] },
                    });
                } else if (subcommand === 'set') {
                    const { id } = interaction.options.getChannel('channel', true);

                    await serverConfigCollection.updateOne({ _id }, { $set: { verifyErrorsChannelId: id } });

                    return interaction.editReply('Successfully set the verify errors channel.');
                }
                break;
            case 'verify-logs-channel':
                if (subcommand === 'show') {
                    if (!verifyLogsChannelId) return interaction.editReply('The verify logs channel is not set.');

                    return interaction.editReply({
                        content: `The verify logs channel is ${channelMention(verifyLogsChannelId)}.`,
                        allowedMentions: { roles: [] },
                    });
                } else if (subcommand === 'set') {
                    const { id } = interaction.options.getChannel('channel', true);

                    await serverConfigCollection.updateOne({ _id }, { $set: { verifyLogsChannelId: id } });

                    return interaction.editReply('Successfully set the verify logs channel.');
                }
                break;
            case 'verify-support-channel':
                if (subcommand === 'show') {
                    if (!verifySupportChannelId) return interaction.editReply('The verify support channel is not set.');

                    return interaction.editReply({
                        content: `The verify support channel is ${channelMention(verifySupportChannelId)}.`,
                        allowedMentions: { roles: [] },
                    });
                } else if (subcommand === 'set') {
                    const { id } = interaction.options.getChannel('channel', true);

                    await serverConfigCollection.updateOne({ _id }, { $set: { verifySupportChannelId: id } });

                    return interaction.editReply('Successfully set the verify support channel.');
                }
                break;
            case 'welcome-channel':
                if (subcommand === 'show') {
                    if (!welcomeChannelId) return interaction.editReply('The welcome channel is not set.');

                    return interaction.editReply({
                        content: `The welcome channel is ${channelMention(welcomeChannelId)}.`,
                        allowedMentions: { roles: [] },
                    });
                } else if (subcommand === 'set') {
                    const { id } = interaction.options.getChannel('channel', true);

                    await serverConfigCollection.updateOne({ _id }, { $set: { welcomeChannelId: id } });

                    return interaction.editReply('Successfully set the welcome channel.');
                }
                break;
        }
    });
