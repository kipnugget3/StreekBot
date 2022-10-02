import { MessageActionRow, SlashCommand } from '../Structures';

export default new SlashCommand()
    .setName('reminder')
    .setDescription('Manage reminders.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(0n)
    .addSubcommand(subcommand =>
        subcommand.setName('send').setDescription('Send reminders to users who are not yet verified.')
    )
    .setCallback(async interaction => {
        const { client } = interaction;

        const { verifiedRoleId } = await client.getServerConfigSchema();

        const guild = await client.guilds.fetch(client.config.guildId);

        const notVerified = guild.members.cache.filter(m => !m.user.bot && !m.roles.cache.has(verifiedRoleId));

        const verifyButton = client.components.getButton('verify', true);
        const helpButton = client.components.getButton('help', true);
        const row = new MessageActionRow().setComponents(verifyButton, helpButton);

        let usersSent = 0;

        for (const member of notVerified.values()) {
            await member
                .send({
                    content: 'Je bent nog niet geverifieerd, doe dit zo snel mogelijk met de knop hieronder!',
                    components: [row],
                })
                .then(() => usersSent++)
                .catch(() => null);
        }
    });
