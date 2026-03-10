type TUserId = string | number;
type TResponse = { data: unknown; error: null } | { data: null; error: string };
type TConfig = { apiUrl: string; timeout: number };

function processId(id: TUserId): string {
    return String(id);
}

export type { TUserId, TResponse, TConfig };
export { processId };
