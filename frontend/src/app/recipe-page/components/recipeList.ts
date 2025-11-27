// src/app/recipe-page/useRecipeList.ts
"use client";

import { useCallback, useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api/v1";
const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_RECIPE_PAGE_SIZE ?? 9);

export function recipeList(page: number) {
    const [list, setList] = useState<any[]>([]);
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState<string | null>(null);
    const [hasNext, setHasNext] = useState(false);

    const loadPage = useCallback(
        async (p: number) => {
            setListLoading(true);
            setListError(null);
            try {
                const offset = (p - 1) * PAGE_SIZE;
                const userId = localStorage.getItem("user_id") || null;

                let url = `${API_BASE}/recipe/list?limit=${PAGE_SIZE}&offset=${offset}`;
                if (userId != null) {
                    url += `&user_id=${encodeURIComponent(userId)}`;
                }

                const res = await fetch(url)
                if (!res.ok) throw new Error(`List HTTP ${res.status}`);
                const data = await res.json();
                const items = Array.isArray(data) ? data : data?.items || [];
                setList(items);
                setHasNext(items.length === PAGE_SIZE);
            } catch (e: any) {
                setListError(e?.message || "Failed to load recipes");
                setList([]);
                setHasNext(false);
            } finally {
                setListLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        loadPage(page);
    }, [page, loadPage]);

    return { list, listLoading, listError, hasNext, loadPage };
}