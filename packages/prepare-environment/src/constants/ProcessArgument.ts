enum ProcessArgument {
    // region required
    CONFIG_PATH = 'CONFIG_PATH'
}

export const optionalArguments = [ProcessArgument.CONFIG_PATH] as const;
export const allowedArguments = [...optionalArguments];

export type ExtractedArguments = Record<typeof optionalArguments[number], unknown>;

export default ProcessArgument;
