export const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        // PWA cache-friendly GET-ekhez érdemes no-store helyett implicitet hagyni
        headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
        next: { revalidate: 60 } // ISR jellegű revalidate
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<T>;
}