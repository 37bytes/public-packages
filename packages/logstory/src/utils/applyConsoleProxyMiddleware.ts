export interface MiddlewareFunctionParams<Message, Extras> {
    message: Message | Message[];
    extras: Extras;
}

export type MiddlewareFunction<Message, Extras> = (params: MiddlewareFunctionParams<Message, Extras>) => void;
export const applyConsoleProxyMiddleware =
    <Message, Extras, M extends MiddlewareFunction<Message, Extras>>(middlewares: M[]) =>
    (middlewareParams: MiddlewareFunctionParams<Message, Extras>) =>
        middlewares.forEach((middleware) => middleware(middlewareParams));
