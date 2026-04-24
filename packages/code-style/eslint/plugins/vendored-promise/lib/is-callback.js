import isNamedCallback from './is-named-callback.js';

function isCallback(node, exceptions) {
    const isCallExpression = node.type === 'CallExpression';
    // istanbul ignore next -- always invoked on `CallExpression`
    const callee = node.callee || {};
    const nameIsCallback = isNamedCallback(callee.name, exceptions);
    const isCB = isCallExpression && nameIsCallback;
    return isCB;
}

export default isCallback;
