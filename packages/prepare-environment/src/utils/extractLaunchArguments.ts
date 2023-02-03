import { allowedArguments, ExtractedArguments } from '../constants/ProcessArgument';

const extractLaunchArguments = (): ExtractedArguments =>
    process.argv.reduce((result, argument) => {
        if (!allowedArguments.some((argumentName) => argument.startsWith(argumentName))) {
            return result;
        }

        const [name, value] = argument.split('=');
        if (typeof value === 'string' && value !== '') {
            result[name] = value;
        }

        return result;
    }, {}) as ExtractedArguments;

export default extractLaunchArguments;
