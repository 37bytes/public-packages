import { resolve } from 'path';
import { existsSync, readFileSync, statSync } from 'fs';

interface ExtractTemplateContent {
    template: string;
}

const extractTemplateContent = ({ template }: ExtractTemplateContent) => {
    const templatePath = resolve(process.cwd(), template);
    if (!existsSync(templatePath)) {
        throw new Error(`template (${templatePath}) does not exist`);
    }
    const targetDirectoryStat = statSync(templatePath);
    if (!targetDirectoryStat.isFile()) {
        throw new Error(`template (${templatePath}) is not a file`);
    }

    return readFileSync(templatePath, 'utf-8');
};

export default extractTemplateContent;
