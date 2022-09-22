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
                        return client.commands.getSlashCommand(commandName)?.run(interaction);
                    case ApplicationCommandType.User:
                        return client.commands.getUserContextMenu(commandName)?.run(interaction);
                    case ApplicationCommandType.Message:
                        return client.commands.getMessageContextMenu(commandName)?.run(interaction);
                    default:
                        client.logger.warn(`Received unknown application command type: ${commandType}`);
                        return client.components.get(commandName)?.run(interaction);
                }
            }
            case InteractionType.MessageComponent: {
                const { componentType, customId } = interaction;

                switch (componentType) {
                    case ComponentType.Button:
                        return client.components.getButton(customId)?.run(interaction);
                    case ComponentType.SelectMenu:
                        return client.components.getSelectMenu(customId)?.run(interaction);
                    default:
                        client.logger.warn(`Received unknown component type: ${componentType}`);
                        return client.components.get(customId)?.run(interaction);
                }
            }
            case InteractionType.ApplicationCommandAutocomplete: {
                const { commandType, commandName } = interaction;

                if (commandType !== ApplicationCommandType.ChatInput)
                    client.logger.warn(`Received unknown application command type on autocomplete: ${commandType}`);

                return client.autocompletes.get(commandName)?.run(interaction);
            }
            case InteractionType.ModalSubmit:
                return client.modals.get(interaction.customId)?.run(interaction);
        }
    },
});
