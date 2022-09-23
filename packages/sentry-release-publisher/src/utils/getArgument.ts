import ProcessArgument, { ExtractedArguments } from '../constants/ProcessArgument';

const getArgument = <T extends string | undefined>(
    args: Partial<ExtractedArguments>,
    argument: keyof ExtractedArguments,
    defaultValue?: T
): T => {
    return typeof args[argument] === 'string' ? (args[argument] as T) : defaultValue;
};

export default getArgument;
