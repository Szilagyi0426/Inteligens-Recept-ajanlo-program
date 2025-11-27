export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

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

// Axios-szerű API kliens token kezeléssel
export const apiClient = {
    get: async (url: string, config?: any) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: any = { 'Content-Type': 'application/json', ...config?.headers };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(url, {
            method: 'GET',
            headers,
            ...config,
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `HTTP ${res.status}`);
        }
        return { data: await res.json() };
    },
    
    post: async (url: string, data?: any, config?: any) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: any = { 'Content-Type': 'application/json', ...config?.headers };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
            ...config,
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `HTTP ${res.status}`);
        }
        return { data: await res.json() };
    },
    
    patch: async (url: string, data?: any, config?: any) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: any = { 'Content-Type': 'application/json', ...config?.headers };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(url, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
            ...config,
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `HTTP ${res.status}`);
        }
        return { data: await res.json().catch(() => ({})) };
    },
    
    delete: async (url: string, config?: any) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: any = { 'Content-Type': 'application/json', ...config?.headers };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(url, {
            method: 'DELETE',
            headers,
            ...config,
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `HTTP ${res.status}`);
        }
        return { data: res.status === 204 ? null : await res.json().catch(() => ({})) };
    },
};