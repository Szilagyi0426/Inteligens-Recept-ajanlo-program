// src/app/recipe-page/useRecipePage.ts
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { recipeList } from "./recipeList";
import { recipeDetail } from "./recipeDetail";
import { normalizeRecipe } from "./recipeNormalize";
import { recipeImages } from "./recipeImages";


const PAGE_SIZE = process.env.RECIPE_PAGE_SIZE || 9

export function recipePage() {
    const router = useRouter();
    const params = useSearchParams();

    const page = Math.max(1, Number(params.get("page") || 1));
    const selectedId = params.get("id");

    // lista + detail
    const { list, listLoading, listError, hasNext } = recipeList(page);
    const { detail, detailLoading, detailError } = recipeDetail(selectedId);

    const normalizedList = useMemo(
        () => list.map(normalizeRecipe).filter(Boolean) as any[],
        [list]
    );
    const normalizedDetail = useMemo(
        () => (detail ? normalizeRecipe(detail) : null),
        [detail]
    );

    const { imageMap } = recipeImages(normalizedList, normalizedDetail);

    const goToPage = (p: number) => {
        const sp = new URLSearchParams(params.toString());
        sp.set("page", String(p));
        sp.delete("id");
        router.push(`/recipe-page?${sp.toString()}`);
    };

    const openRecipe = (id: string | number) => {
        const sp = new URLSearchParams(params.toString());
        sp.set("id", String(id));
        router.push(`/recipe-page?${sp.toString()}`);
    };

    return {
        PAGE_SIZE,
        page,
        selectedId,
        listLoading,
        listError,
        hasNext,
        normalizedList,
        detail,
        detailLoading,
        detailError,
        normalizedDetail,
        imageMap,
        goToPage,
        openRecipe,
    };
}