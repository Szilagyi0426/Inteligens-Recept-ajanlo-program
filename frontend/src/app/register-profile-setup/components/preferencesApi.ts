'use client';

export type OptionItem = {
    id: string | number;
    label: string;
};

// biztonságos fetch – pont mint az eredetiben
export const safeFetch = async (
    url: string,
    init: RequestInit = {},
    authHeaders: HeadersInit = {}
) => {
    const res = await fetch(url, {
        ...init,
        headers: { ...(init?.headers || {}), ...authHeaders },
        credentials: 'include',
    });
    if (!res.ok) {
        let text = '';
        try {
            const j = await res.json();
            text = j?.detail ? JSON.stringify(j.detail) : JSON.stringify(j);
        } catch {
            text = await res.text();
        }
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
};

// az eredeti normalizeOptions
export const normalizeOptions = (input: any): OptionItem[] => {
    if (!input) return [];
    if (Array.isArray(input) && typeof input[0] === 'string') {
        return input.map((x) => ({ id: x, label: x }));
    }
    const arr =
        Array.isArray(input) ? input : input.results ?? input.data ?? input.items ?? [];
    return arr
        .map((x: any) => {
            if (!x) return null;
            const id = x.id ?? x.value ?? x.key ?? x.slug ?? x.code ?? x.name;
            const label =
                x.label ?? x.name ?? x.title ?? x.value ?? x.slug ?? x.code ?? x.id;
            if (id == null || label == null) return null;
            return { id, label: String(label) };
        })
        .filter(Boolean) as OptionItem[];
};