export function throwError(error: Error): never;
export function throwError(message?: string, options?: ErrorOptions): never;
export function throwError(errorOrMessage?: Error | string, options?: ErrorOptions) {
    if (errorOrMessage instanceof Error) {
        throw errorOrMessage;
    }

    throw new Error(errorOrMessage, options);
}

export const throwStaffRoleNotFoundError = () => throwError('Staff role not found.');

export const throwVerifiedRoleNotFoundError = () => throwError('Verified role not found.');

export const throwVerificationSupportRoleNotFoundError = () => throwError('Verification support role not found.');

export const throwLogChannelNotFoundError = () => throwError('Log channel not found.');

export const throwVerifyLogsChannelNotFoundError = () => throwError('Verify logs channel not found.');

export const throwWelcomeChannelNotFoundError = () => throwError('Welcome channel not found.');
