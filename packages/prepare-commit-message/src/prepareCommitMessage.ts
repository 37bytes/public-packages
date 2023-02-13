import { ExtractedArguments } from './constants/ProcessArgument';

const fs = require('fs');

import { ConfigData } from './types';

interface PrepareCommitMessageParams {
    configData: ConfigData;
    cliArguments: ExtractedArguments;
}

export const prepareCommitMessage = ({ configData, cliArguments }: PrepareCommitMessageParams) => {
    const { specialBranches, branchesPrefixes } = configData;
    const { BRANCH_NAME, PATH_TO_MESSAGE_FILE } = cliArguments;
    // const SPECIAL_BRANCHES = ["master", "develop"];
    // const BRANCH_PREFIXES = ["MARALL-"];

    console.log('==========================');
    console.log('prepareCommitMessage called!');
    try {
        // const [, , PATH_TO_MESSAGE_FILE, BRANCH_NAME] = process.argv;
        console.log(`File with commit message: "${PATH_TO_MESSAGE_FILE}"`);
        console.log(`Branch: "${BRANCH_NAME}"`);
        if (!PATH_TO_MESSAGE_FILE || !BRANCH_NAME) {
            throw new Error('Some of required arguments are empty');
        }

        if (specialBranches.includes(BRANCH_NAME)) {
            console.log(`skip ${BRANCH_NAME} appending, ${BRANCH_NAME} in special list (${specialBranches})`);
            return;
        }

        const commitMessage = fs.readFileSync(PATH_TO_MESSAGE_FILE, 'utf-8');
        console.log(`Commit message:
    ---
    ${commitMessage}
    ---
        `);
        if (!commitMessage) {
            throw new Error('Commit message is empty');
        }

        const isCommitMessageStartWithPrefix = branchesPrefixes.some((prefix) => commitMessage.startsWith(prefix));
        if (isCommitMessageStartWithPrefix && !commitMessage.startsWith(BRANCH_NAME)) {
            console.log(
                `skip ${BRANCH_NAME} appending, commit message already starts with one of special prefixes (${branchesPrefixes})`
            );
            return;
        }

        if (commitMessage.startsWith(BRANCH_NAME)) {
            console.log(`skip ${BRANCH_NAME} appending, already appended`);
            return;
        }

        if (!isCommitMessageStartWithPrefix) {
            console.log(`appending "${BRANCH_NAME}" to commit message...`);
            fs.writeFileSync(PATH_TO_MESSAGE_FILE, `${BRANCH_NAME} ${commitMessage}`);
            return;
        }
    } finally {
        console.log('prepareCommitMessage finished!');
        console.log('==========================');
    }

    console.log('---');
    console.log(process.argv);
    console.log('---');
};
