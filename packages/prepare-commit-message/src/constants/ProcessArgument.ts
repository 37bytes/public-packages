enum ProcessArgument {
    // region required
    PATH_TO_MESSAGE_FILE = 'PATH_TO_MESSAGE_FILE',
    BRANCH_NAME = 'BRANCH_NAME',
    //endregion
    CONFIG_PATH = 'CONFIG_PATH'
}

export const requiredArguments = [ProcessArgument.PATH_TO_MESSAGE_FILE, ProcessArgument.BRANCH_NAME] as const;
export const optionalArguments = [ProcessArgument.CONFIG_PATH] as const;
export const allowedArguments = [...optionalArguments];

export type ExtractedArguments = Record<typeof requiredArguments[number], string> &
    Record<typeof optionalArguments[number], unknown>;

export default ProcessArgument;
