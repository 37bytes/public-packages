enum ProcessArgument {
    PORT = 'PORT',
    PROXY_MODE = 'PROXY_MODE',
    PATH_TO_CONFIG = 'PATH_TO_CONFIG'
}

export const requiredArguments = [] as const;
export const optionalArguments = [
    ProcessArgument.PORT,
    ProcessArgument.PROXY_MODE,
    ProcessArgument.PATH_TO_CONFIG
] as const;
export const allowedArguments = [...requiredArguments, ...optionalArguments];

export type ExtractedArguments = Record<typeof requiredArguments[number], string> &
    Record<typeof optionalArguments[number], unknown>;

export default ProcessArgument;
