'use client';

export const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000/api/v1';

export type OptionItem = { id: string | number; label: string };

export const cleanMessage = (s?: string | null) =>
    (s ?? '').replace(/^"|"$/g, '').trim();

export async function safeFetch<T = any>(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<T> {
    const res = await fetch(input, init);
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
    try {
        return (await res.json()) as T;
    } catch {
        return {} as T;
    }
}

export function normalizeOptions(input: any): OptionItem[] {
    if (!input) return [];
    const fromArray = (arr: any[]) =>
        arr
            .map((x) => {
                if (x == null) return null;
                if (typeof x === 'string') return { id: x, label: x } as OptionItem;
                if (typeof x === 'number') return { id: x, label: String(x) } as OptionItem;
                const id = x.id ?? x.value ?? x.key ?? x.slug ?? x.code ?? x.name;
                const label =
                    x.label ?? x.name ?? x.title ?? x.value ?? x.slug ?? x.code ?? x.id;
                if (id == null || label == null) return null;
                return { id, label: String(label) } as OptionItem;
            })
            .filter(Boolean) as OptionItem[];

    if (Array.isArray(input)) return fromArray(input);
    const arr =
        input.items ||
        input.data ||
        input.results ||
        input.values ||
        input.options ||
        input;
    if (Array.isArray(arr)) return fromArray(arr);
    return [];
}