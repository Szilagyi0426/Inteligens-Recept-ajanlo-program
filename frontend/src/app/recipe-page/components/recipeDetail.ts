"use client";

import { useCallback, useEffect, useState } from "react";


const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api/v1";

export function recipeDetail(selectedId: string | null) {
    const [detail, setDetail] = useState<any | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    const loadDetail = useCallback(async (id: string) => {
        setDetail(null);
        setDetailLoading(true);
        setDetailError(null);
        try {
            const r = await fetch(`${API_BASE}/recipe/${id}`, { cache: "no-store" });
            if (!r.ok) throw new Error("Recipe not found");
            const data = await r.json();
            setDetail(data);
        } catch (e: any) {
            setDetailError(e?.message || "Failed to load recipe");
        } finally {
            setDetailLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedId) loadDetail(selectedId);
    }, [selectedId, loadDetail]);

    return { detail, detailLoading, detailError, loadDetail };
}