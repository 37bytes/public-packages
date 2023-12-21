enum ProcessArgument {
    TARGET_DIRECTORY = 'TARGET_DIRECTORY',
    ENVIRONMENT_CONFIG = 'ENVIRONMENT_CONFIG'
}

export const requiredArguments = [ProcessArgument.TARGET_DIRECTORY, ProcessArgument.ENVIRONMENT_CONFIG] as const;
export const optionalArguments = [] as const;
export const allowedArguments = [...requiredArguments, ...optionalArguments];

export type ExtractedArguments = Record<(typeof requiredArguments)[number], string> &
    Record<(typeof optionalArguments)[number], unknown>;

export default ProcessArgument;
