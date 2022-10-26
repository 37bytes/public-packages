enum ProcessArgument {
    // where .html files looking for?
    HTML_DIRECTORY = 'HTML_DIRECTORY',
    // which content we need to append to every html files?
    TEMPLATE = 'TEMPLATE',

    // which files we should ignore?
    EXCLUDED_FILES = 'EXCLUDED_FILES'
}

export const requiredArguments = [ProcessArgument.HTML_DIRECTORY, ProcessArgument.TEMPLATE] as const;
export const optionalArguments = [ProcessArgument.EXCLUDED_FILES] as const;
export const allowedArguments = [...requiredArguments, ...optionalArguments];

export type ExtractedArguments = Record<typeof requiredArguments[number], string> &
    Record<typeof optionalArguments[number], unknown>;

export default ProcessArgument;
