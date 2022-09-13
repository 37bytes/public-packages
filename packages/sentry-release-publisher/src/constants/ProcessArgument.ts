enum ProcessArgument {
    // region required
    SENTRY_TOKEN = 'SENTRY_TOKEN',
    SENTRY_URL = 'SENTRY_URL',
    SENTRY_ORG = 'SENTRY_ORG',
    SENTRY_PROJECT = 'SENTRY_PROJECT',
    // endregion
    RELEASE_DIRECTORY = 'RELEASE_DIRECTORY',
    RELEASE_NAME = 'RELEASE_NAME',
    RELEASE_CONFIG_NAME = 'RELEASE_CONFIG',
    CONFIG_RELEASE_VARIABLE = 'CONFIG_RELEASE_VARIABLE',
    KEEP_SOURCE_MAPS = 'KEEP_SOURCE_MAPS'
}

export const requiredArguments = [
    ProcessArgument.SENTRY_TOKEN,
    ProcessArgument.SENTRY_URL,
    ProcessArgument.SENTRY_ORG,
    ProcessArgument.SENTRY_PROJECT
] as const;
export const optionalArguments = [
    ProcessArgument.RELEASE_DIRECTORY,
    ProcessArgument.RELEASE_NAME,
    ProcessArgument.RELEASE_CONFIG_NAME,
    ProcessArgument.CONFIG_RELEASE_VARIABLE,
    ProcessArgument.KEEP_SOURCE_MAPS
] as const;
export const allowedArguments = [...requiredArguments, ...optionalArguments];

export type ExtractedArguments = Record<typeof requiredArguments[number], string> &
    Record<typeof optionalArguments[number], unknown>;

export default ProcessArgument;
