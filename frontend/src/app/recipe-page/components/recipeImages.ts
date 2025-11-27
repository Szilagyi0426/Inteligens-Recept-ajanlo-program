"use client";

import { useEffect, useState } from "react";
import { RecipeLike } from "./recipeNormalize";

/**
 * Külső webes képfelhozó – ugyanaz, mint az eredetiben
 */
async function fetchImageFromWeb(query: string): Promise<string | null> {
    const candidates = [
        (q: string) =>
            `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&prop=pageimages&pithumbsize=512&generator=search&gsrsearch=${encodeURIComponent(
                q + " food dish"
            )}&gsrlimit=1`,
        (q: string) =>
            `https://commons.wikimedia.org/w/api.php?action=query&origin=*&format=json&prop=pageimages&pithumbsize=512&generator=search&gsrsearch=${encodeURIComponent(
                q + " food"
            )}&gsrlimit=1`,
    ];
    for (const makeUrl of candidates) {
        try {
            const res = await fetch(makeUrl(query));
            if (!res.ok) continue;
            const data = await res.json();
            const pages = data?.query?.pages;
            if (!pages) continue;
            const first = Object.values(pages)[0] as any;
            const thumb =
                first?.thumbnail?.source || first?.pageimage?.source || null;
            if (thumb) return thumb as string;
        } catch (_) {
            // ignore
        }
    }
    return null;
}

export function recipeImages(
    normalizedList: RecipeLike[],
    normalizedDetail: RecipeLike | null
) {
    const [imageMap, setImageMap] = useState<Record<string | number, string>>({});

    // load from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem("recipeImageMap");
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === "object") setImageMap(parsed);
            }
        } catch {}
    }, []);

    // list images
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const updates: Record<string | number, string> = {};
            for (const r of normalizedList) {
                if (!r?.image && r?.title && !imageMap[r.id]) {
                    const img = await fetchImageFromWeb(r.title);
                    if (img) updates[r.id] = img;
                }
            }
            if (!cancelled && Object.keys(updates).length) {
                setImageMap((prev) => ({ ...prev, ...updates }));
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [normalizedList]);

    // detail image
    useEffect(() => {
        let run = true;
        (async () => {
            if (
                normalizedDetail &&
                !normalizedDetail.image &&
                normalizedDetail.title &&
                !imageMap[normalizedDetail.id]
            ) {
                const img = await fetchImageFromWeb(normalizedDetail.title);
                if (run && img)
                    setImageMap((prev) => ({ ...prev, [normalizedDetail.id]: img }));
            }
        })();
        return () => {
            run = false;
        };
    }, [normalizedDetail]);

    // persist
    useEffect(() => {
        try {
            localStorage.setItem("recipeImageMap", JSON.stringify(imageMap));
        } catch {}
    }, [imageMap]);

    return { imageMap, setImageMap };
}