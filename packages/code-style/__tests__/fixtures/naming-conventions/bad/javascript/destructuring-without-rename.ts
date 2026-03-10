interface ApiResponse {
    user_id: string;
    created_at: string;
    total_count: number;
    is_active: boolean;
}

function processResponse(response: ApiResponse) {
    const { user_id, created_at, total_count, is_active } = response;

    return {
        userId: user_id,
        createdAt: created_at,
        totalCount: total_count,
        isActive: is_active
    };
}

export { processResponse };
