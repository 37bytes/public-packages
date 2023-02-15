enum ProcessArgument {
    // region required
    ENV_NAME = 'ENV_NAME',
    // end region

    CAL_VER = 'CAL_VER',
    COMMIT_SHORT_SHA = 'COMMIT_SHORT_SHA',
    REF_NAME = 'REF_NAME',
    CONFIG_PATH = 'CONFIG_PATH'
}

export const requiredArguments = [ProcessArgument.ENV_NAME] as const;
export const optionalArguments = [
    ProcessArgument.CAL_VER,
    ProcessArgument.COMMIT_SHORT_SHA,
    ProcessArgument.REF_NAME,
    ProcessArgument.CONFIG_PATH
] as const;
export const allowedArguments = [...requiredArguments, ...optionalArguments];

export type ExtractedArguments = Record<typeof requiredArguments[number], string> &
    Record<typeof optionalArguments[number], unknown>;

export default ProcessArgument;
