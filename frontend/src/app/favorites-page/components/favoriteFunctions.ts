"use client";

import { useCallback, useEffect, useState } from "react";

export type Recipe = {
    id: number;
    title: string;
    description?: string | null;
    image?: string | null;
    author?: string | null;
    rating?: number | null;
    time?: number | null;
    calories?: number | null;
    is_favorite?: boolean;
    is_selected?: boolean;
};

export const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem("token");
    } catch {
        return null;
    }
}

export function useFavoritesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
    const [selectedRecipeIds, setSelectedRecipeIds] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const syncFavorite = useCallback(async (recipeId: number, isFavorite: boolean) => {
        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_BASE}/recipes/${recipeId}/favorite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ is_favorite: isFavorite }),
            });
        } catch (err) {
            console.error("Failed to sync favorite state", err);
        }
    }, []);

    const syncSelectedRecipe = useCallback(async (recipeId: number, selected: boolean) => {
        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_BASE}/recipe/${recipeId}/selected`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ selected }),
            });
        } catch (err) {
            console.error("Failed to sync selected recipe state", err);
        }
    }, []);

    const loadFavorites = useCallback(async () => {
        const token = getToken();
        const hasToken = !!token;
        setIsAuthenticated(hasToken);

        if (!token) {
            setError("You need to sign in to view your favorites.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const userId =
                typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

            const res = await fetch(
                `${API_BASE}/recipe/list?limit=100&offset=0${
                    userId ? `&user_id=${encodeURIComponent(userId)}` : ""
                }`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                }
            );

            if (!res.ok) {
                throw new Error("Failed to load recipes.");
            }

            const data = await res.json();

            const allRecipes: Recipe[] = Array.isArray(data)
                ? data
                : Array.isArray(data.items)
                    ? data.items
                    : [];

            const favs = allRecipes.filter((r) => r.is_favorite);

            setRecipes(favs);

            const initialFavoriteIds = favs
                .filter((r) => r.is_favorite)
                .map((r) => r.id);
            const initialSelectedIds = favs
                .filter((r) => r.is_selected)
                .map((r) => r.id);

            setFavoriteIds(initialFavoriteIds);
            setSelectedRecipeIds(initialSelectedIds);
        } catch (err: any) {
            console.error(err);
            setError(
                err?.message ?? "An unknown error occurred while loading favorites."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const toggleFavorite = (id: number) => {
        setFavoriteIds((prev) => {
            const willBeFavorite = !prev.includes(id);
            syncFavorite(id, willBeFavorite);

            if (!willBeFavorite) {
                setRecipes((current) => current.filter((r) => r.id !== id));
            }

            return willBeFavorite
                ? [...prev, id]
                : prev.filter((rid) => rid !== id);
        });
    };

    const toggleSelectedRecipe = (id: number) => {
        setSelectedRecipeIds((prev) => {
            const willBeSelected = !prev.includes(id);
            syncSelectedRecipe(id, willBeSelected);
            return willBeSelected
                ? [...prev, id]
                : prev.filter((rid) => rid !== id);
        });
    };

    return {
        recipes,
        favoriteIds,
        selectedRecipeIds,
        loading,
        error,
        isAuthenticated,
        toggleFavorite,
        toggleSelectedRecipe,
    };
}