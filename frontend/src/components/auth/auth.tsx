export function getTokenFromStorage(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token"); // vagy amit használsz
}

export function getRoleFromToken(token: string | null): number {
    if (!token) return 0;
    try {
        // JWT: header.payload.signature
        const [, payload] = token.split(".");
        const decoded = JSON.parse(atob(payload));
        return typeof decoded.role_id === "number" ? decoded.role_id : 0;
    } catch (e) {
        return 0;
    }
}