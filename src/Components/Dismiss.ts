import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Colors,
    EmbedBuilder,
    MessageActionRowComponentBuilder,
} from 'discord.js';
import { Button } from '../Structures';

export default new Button()
    .setCustomId('dismiss')
    .setLabel('Remove User')
    .setStyle(ButtonStyle.Danger)
    .setCallback(async interaction => {
        await interaction.deferReply({ ephemeral: true });

        const { client, guild, message } = interaction;

        const leerlingnummer = message.embeds[0].fields[0].value;

        const verifyUser = await client.verificationCollection.findOne({ leerlingnummer });

        if (!verifyUser) return interaction.editReply('That user was already removed or could not be found.');

        const { verifiedRoleId } = await client.getServerConfigSchema();

        const user = await guild.members.fetch(`${verifyUser.userId}`);

        await user.roles.remove(verifiedRoleId);

        await client.verificationCollection.deleteOne({ leerlingnummer });

        await interaction.editReply('Succesfully unverified that user.');

        const embed = new EmbedBuilder()
            .setDescription(`~~${user} is geverifieërd!~~\nVerificatie verwijderd door ${interaction.user}`)
            .addFields(
                { name: 'Leerlingnummer', value: verifyUser.leerlingnummer },
                { name: 'Naam', value: verifyUser.naam }
            )
            .setColor(Colors.Red);

        const rawDismiss = client.components.getButton('dismiss', true).toJSON();

        const dismissButton = new ButtonBuilder({ ...rawDismiss, disabled: true });

        const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(dismissButton);

        await message.edit({ embeds: [embed], components: [row] });
    });
