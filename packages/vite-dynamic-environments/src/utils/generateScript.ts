// Генерирует js-строку, содержащую замороженный объект с переменными окружения
const generateScript = (environment: object) => `
  window.dynamicEnvironment = Object.freeze(${JSON.stringify(environment)});
`;

export default generateScript;
