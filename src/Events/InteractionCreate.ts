import { ApplicationCommandType, ComponentType, Events, InteractionType } from 'discord.js';
import { ClientEvent } from '../Structures';

export default new ClientEvent({
    name: Events.InteractionCreate,
    run: async interaction => {
        if (!interaction.inCachedGuild()) return;

        const { client } = interaction;

        switch (interaction.type) {
            case InteractionType.ApplicationCommand: {
                const { commandType, commandName } = interaction;

                switch (commandType) {
                    case ApplicationCommandType.ChatInput:
                        return client.commands.getSlashCommand(commandName, true).run(interaction);
                    case ApplicationCommandType.User:
                        return client.commands.getUserContextMenu(commandName, true).run(interaction);
                    case ApplicationCommandType.Message:
                        return client.commands.getMessageContextMenu(commandName, true).run(interaction);
                    default:
                        client.logger.warn(`Received unknown application command type: ${commandType}`);
                        return client.components.get(commandName, true).run(interaction);
                }
            }
            case InteractionType.MessageComponent: {
                const { componentType, customId } = interaction;

                switch (componentType) {
                    case ComponentType.Button:
                        return client.components.getButton(customId, true).run(interaction);
                    case ComponentType.SelectMenu:
                        return client.components.getSelectMenu(customId, true).run(interaction);
                    default:
                        client.logger.warn(`Received unknown component type: ${componentType}`);
                        return client.components.get(customId, true).run(interaction);
                }
            }
            case InteractionType.ApplicationCommandAutocomplete:
                return client.autocompletes.get(interaction.commandName, true).run(interaction);
            case InteractionType.ModalSubmit:
                return client.modals.get(interaction.customId, true).run(interaction);
        }
    },
});
