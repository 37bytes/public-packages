const extractJson = <T = unknown>(response: Response): Promise<T> => response.json();
const extractBlob = (response: Response): Promise<Blob> => response.blob();
const extractText = (response: Response): Promise<string> => response.text();
const extractVoid = (_response: Response): Promise<void> => Promise.resolve();

export interface BaseRequestOptions {
    url: string;
    headers?: Record<string, string>;
    timeout?: number;
    signal?: AbortSignal;
    allowedErrors?: number[];
    redirect?: RequestRedirect;
}

export interface MutateRequestOptions extends BaseRequestOptions {
    jsonBody?: object;
    body?: BodyInit | null;
}

export interface BuildHeadersParams {
    baseHeaders?: Record<string, string>;
    hasJsonBody: boolean;
}

export interface HandleErrorParams {
    error: unknown;
    url: string;
    method: string;
    timeout: number;
}

export interface ValidateResponseParams {
    response: Response;
    url: string;
    method: string;
    allowedErrors?: number[];
}

export interface RequesterConstructorParams {
    apiHost: string;
    timeout?: number;
}

export abstract class AbstractRequester<
    GetOptions extends BaseRequestOptions = BaseRequestOptions,
    MutateOptions extends MutateRequestOptions = MutateRequestOptions
> {
    protected defaultTimeout: number;
    protected readonly apiHost: string;

    public json: {
        get: <T = unknown>(options: GetOptions) => Promise<T>;
        post: <T = unknown>(options: MutateOptions) => Promise<T>;
        put: <T = unknown>(options: MutateOptions) => Promise<T>;
        remove: <T = unknown>(options: MutateOptions) => Promise<T>;
    };

    public blob: {
        get: (options: GetOptions) => Promise<Blob>;
        post: (options: MutateOptions) => Promise<Blob>;
        put: (options: MutateOptions) => Promise<Blob>;
        remove: (options: MutateOptions) => Promise<Blob>;
    };

    public text: {
        get: (options: GetOptions) => Promise<string>;
        post: (options: MutateOptions) => Promise<string>;
        put: (options: MutateOptions) => Promise<string>;
        remove: (options: MutateOptions) => Promise<string>;
    };

    public void: {
        post: (options: MutateOptions) => Promise<void>;
        put: (options: MutateOptions) => Promise<void>;
        remove: (options: MutateOptions) => Promise<void>;
    };

    abstract fetch(options: GetOptions | MutateOptions): Promise<Response>;

    get = (options: GetOptions): Promise<Response> => this.fetch(options);
    post = (options: MutateOptions): Promise<Response> => this.fetch(options);
    put = (options: MutateOptions): Promise<Response> => this.fetch(options);
    remove = (options: MutateOptions): Promise<Response> => this.fetch(options);

    protected constructor(config: RequesterConstructorParams) {
        this.apiHost = config.apiHost;
        this.defaultTimeout = config.timeout || 30_000;

        this.json = {
            get: <T = unknown>(options: GetOptions) => this.get(options).then(extractJson<T>),
            post: <T = unknown>(options: MutateOptions) => this.post(options).then(extractJson<T>),
            put: <T = unknown>(options: MutateOptions) => this.put(options).then(extractJson<T>),
            remove: <T = unknown>(options: MutateOptions) => this.remove(options).then(extractJson<T>)
        };

        this.blob = {
            get: (options: GetOptions) => this.get(options).then(extractBlob),
            post: (options: MutateOptions) => this.post(options).then(extractBlob),
            put: (options: MutateOptions) => this.put(options).then(extractBlob),
            remove: (options: MutateOptions) => this.remove(options).then(extractBlob)
        };

        this.text = {
            get: (options: GetOptions) => this.get(options).then(extractText),
            post: (options: MutateOptions) => this.post(options).then(extractText),
            put: (options: MutateOptions) => this.put(options).then(extractText),
            remove: (options: MutateOptions) => this.remove(options).then(extractText)
        };

        this.void = {
            post: (options: MutateOptions) => this.post(options).then(extractVoid),
            put: (options: MutateOptions) => this.put(options).then(extractVoid),
            remove: (options: MutateOptions) => this.remove(options).then(extractVoid)
        };
    }

    protected buildUrl(url: string): string {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            throw new Error('Absolute URLs are not allowed');
        }

        const normalizedApiHost = this.apiHost.endsWith('/') ? this.apiHost.slice(0, -1) : this.apiHost;
        const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

        return normalizedApiHost + normalizedUrl;
    }

    protected getPathname(url: string): string {
        const isAbsolute = url.startsWith('http://') || url.startsWith('https://');
        const parsedUrl = isAbsolute ? new URL(url) : new URL(url, this.apiHost);

        return parsedUrl.pathname;
    }

    protected prepareRequestBody(options: GetOptions | MutateOptions): {
        body: BodyInit | null | undefined;
        hasJsonBody: boolean;
    } {
        const jsonBody = 'jsonBody' in options ? options.jsonBody : undefined;
        const rawBody = 'body' in options ? options.body : undefined;

        return {
            body: jsonBody ? JSON.stringify(jsonBody) : rawBody,
            hasJsonBody: Boolean(jsonBody)
        };
    }

    protected buildRequestHeaders({ baseHeaders, hasJsonBody }: BuildHeadersParams): Record<string, string> {
        return {
            ...(hasJsonBody && { 'Content-Type': 'application/json' }),
            ...baseHeaders
        };
    }

    protected setupTimeout(
        timeoutMs: number,
        externalSignal?: AbortSignal
    ): {
        controller: AbortController;
        timeoutId: ReturnType<typeof setTimeout>;
    } {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        if (externalSignal) {
            if (externalSignal.aborted) {
                controller.abort();
            } else {
                externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
            }
        }
        return { controller, timeoutId };
    }

    protected handleRequestError({ error, url, method, timeout }: HandleErrorParams): never {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Timeout: ${method} ${url} after ${timeout}ms`);
        }

        throw error instanceof Error ? error : new Error(String(error));
    }

    protected validateResponse({ response, url, method, allowedErrors }: ValidateResponseParams): void {
        if (!response.ok) {
            const isAllowed = allowedErrors?.includes(response.status);

            if (!isAllowed) {
                throw new Error(`HTTP ${response.status}: ${method} ${url}`);
            }
        }
    }
}
