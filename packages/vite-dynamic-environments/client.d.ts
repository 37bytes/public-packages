// vite-env.d.ts
declare global {
    interface Window {
        dynamicEnvironment?: Record<string, string>;
    }
}

// Это позволяет использовать файл как модуль в системах модулей ES.
export {};
