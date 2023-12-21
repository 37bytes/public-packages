import { allowedArguments, ExtractedArguments, requiredArguments } from '../constans/ProcessArgument';

const extractLaunchArguments = (): ExtractedArguments => {
    const scriptArguments = process.argv.reduce((result, argument) => {
        if (!allowedArguments.some((argumentName) => argument.startsWith(argumentName))) {
            return result;
        }

        const [name, value] = argument.split('=');
        if (typeof value === 'string' && value !== '') {
            result[name] = value;
        }

        return result;
    }, {}) as ExtractedArguments;

    const missedArguments = requiredArguments.filter((argument) => !scriptArguments[argument]);
    if (missedArguments.length) {
        throw new Error(`Some required arguments missed! ${missedArguments.join(', ')}`);
    }

    return scriptArguments;
};

export default extractLaunchArguments;
