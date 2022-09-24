export function throwError(error: Error): never;
export function throwError(message?: string, options?: ErrorOptions): never;
export function throwError(errorOrMessage?: Error | string, options?: ErrorOptions) {
    if (errorOrMessage instanceof Error) {
        throw errorOrMessage;
    }

    throw new Error(errorOrMessage, options);
}

export const throwDailyQuestionsChannelNotFoundError = () => throwError('Daily questions channel not found.');
export const throwDailyDilemmasChannelNotFoundError = () => throwError('Daily dilemmas channel not found.');
export const throwVerifyLogsChannelNotFoundError = () => throwError('Verify logs channel not found.');
export const throwWelcomeChannelNotFoundError = () => throwError('Welcome channel not found.');
