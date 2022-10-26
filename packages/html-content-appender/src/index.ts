#!/usr/bin/env node
import { JSDOM } from 'jsdom';
import { writeFileSync } from 'fs';
import extractLaunchArguments from './utils/extractLaunchArguments';
import getListOfHtmlFiles from './utils/getListOfHtmlFiles';
import extractTemplateContent from './utils/extractTemplateContent';

const { name: packageName, version: packageVersion } = require('../package.json');
console.log(`${packageName}@${packageVersion} called!`);

const { HTML_DIRECTORY, TEMPLATE, EXCLUDED_FILES } = extractLaunchArguments();
console.log('launch arguments processed!', { HTML_DIRECTORY, TEMPLATE, EXCLUDED_FILES });

console.log('looking for html files...');
let htmlFiles = getListOfHtmlFiles({ targetDirectory: HTML_DIRECTORY });
if (htmlFiles.length) {
    console.log(`found: ${htmlFiles.length}`);
} else {
    throw new Error(`targetDirectory (${HTML_DIRECTORY}) is empty`);
}
console.log(htmlFiles);

console.log('filtering by EXCLUDED_FILES...');
if (EXCLUDED_FILES && typeof EXCLUDED_FILES === 'string') {
    const excludedFiles = EXCLUDED_FILES.split(',');
    htmlFiles = htmlFiles.filter((htmlFile) => {
        const isFiltered = excludedFiles.some((excludedFile) => htmlFile.endsWith(excludedFile));
        if (isFiltered) {
            console.log(`filtering: ${htmlFile} excluded`);
        }
        return !isFiltered;
    });
    console.log(`filtered!`);
    console.log(htmlFiles);
} else {
    console.log('filtering by EXCLUDED_FILES: step skipped');
}

console.log('extracting TEMPLATE content...');
const templateContent = extractTemplateContent({ template: TEMPLATE });
console.log(`
---
${templateContent}
---
`);

console.log('appending TEMPLATE content for htmlFiles...');
let isErrorCaughtWhileProcessing = false;
Promise.all(
    htmlFiles.map(async (htmlFile) => {
        if (isErrorCaughtWhileProcessing) {
            return;
        }

        console.log(`processing ${htmlFile}...`);
        try {
            const dom = await JSDOM.fromFile(htmlFile);
            // noinspection SpellCheckingInspection
            dom.window.document.head.insertAdjacentHTML('afterbegin', templateContent);
            writeFileSync(htmlFile, dom.serialize());
        } catch (error) {
            console.error(error);
            isErrorCaughtWhileProcessing = true;
        }
    })
).finally(() => {
    if (isErrorCaughtWhileProcessing) {
        throw new Error(`${packageName}@${packageVersion} failed!`);
    }

    console.log(`${packageName}@${packageVersion} finished successfully`);
});
