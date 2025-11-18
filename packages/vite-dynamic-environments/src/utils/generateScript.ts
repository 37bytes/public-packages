export const generateScript = (environment: object) =>
    `window.dynamicEnvironment = Object.freeze(${JSON.stringify(environment)});`;
