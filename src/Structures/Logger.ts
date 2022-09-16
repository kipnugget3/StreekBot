import { type Client, codeBlock, Colors, EmbedBuilder, WebhookClient } from 'discord.js';
import { formatDate } from '../Util';

enum LogType {
    Info = 'Info',
    Warn = 'Warn',
    Error = 'Error',
}

interface Log {
    type: LogType;
    content: string;
    timestamp: number;
}

const EmbedColors: Record<LogType, number> = {
    [LogType.Info]: Colors.Green,
    [LogType.Warn]: Colors.Yellow,
    [LogType.Error]: Colors.Red,
};

function formatConsoleLog(log: Log) {
    const { type, content, timestamp } = log;

    const date = formatDate('MM/DD/YYYY hh:mm:ss', timestamp);

    return `[${date}] ${type}: ${content}`;
}

function formatDiscordLog(log: Log) {
    const { type, content, timestamp } = log;

    const embed = new EmbedBuilder()
        .setTitle(type)
        .setColor(EmbedColors[type])
        .setDescription(codeBlock(content))
        .setTimestamp(timestamp);

    return embed;
}

export class Logger {
    webhookClient: WebhookClient;

    constructor(public readonly client: Client) {
        this.webhookClient = new WebhookClient({ url: client.config.webhookURL });
    }

    private _log(type: LogType, content: string | Error) {
        const log: Log = {
            type,
            content: content instanceof Error ? content.stack ?? content.toString() : content,
            timestamp: Date.now(),
        };

        // eslint-disable-next-line no-console
        console.log(formatConsoleLog(log));

        if (!this.client.isReady()) return;

        const embed = formatDiscordLog(log);

        this.webhookClient.send({
            username: 'StreekBot Logs',
            avatarURL: this.client.user.displayAvatarURL(),
            embeds: [embed],
        });
    }

    info(content: string) {
        return this._log(LogType.Info, content);
    }

    warn(content: string) {
        return this._log(LogType.Warn, content);
    }

    error(content: Error) {
        return this._log(LogType.Error, content);
    }
}
