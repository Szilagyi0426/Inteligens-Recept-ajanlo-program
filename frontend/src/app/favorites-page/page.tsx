"use client";

import Link from "next/link";
import { ListIcon, StarIcon } from "lucide-react";
import {API_BASE, useFavoritesPage,} from "./components/favoriteFunctions";

export default function FavoritesPage() {
    const {
        recipes,
        favoriteIds,
        selectedRecipeIds,
        loading,
        error,
        isAuthenticated,
        toggleFavorite,
        toggleSelectedRecipe,
    } = useFavoritesPage();

    return (
        <main className="recipes-shell">
            <header className="page-header">
                <h1>Favorite Recipes</h1>
                <p>Here you can see all the recipes you have marked as favorite.</p>
            </header>

            {loading && (
                <section className="list">
                    <div className="grid">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="card skeleton">
                                <div className="sk-title" />
                                <div className="sk-img" />
                                <div className="sk-line" />
                                <div className="sk-line short" />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {!loading && error && (
                <section className="list">
                    <div className="error">{error}</div>
                </section>
            )}

            {!loading && !error && recipes.length === 0 && (
                <section className="list">
                    <div className="card" style={{ padding: "1.5rem" }}>
                        <p>You do not have any favorite recipes yet.</p>
                        <p className="mt-1 text-sm text-gray-500">
                            On the recipe list page, click the star icon to add recipes to your favorites.
                        </p>
                    </div>
                </section>
            )}

            {!loading && !error && recipes.length > 0 && (
                <section className="list">
                    <div className="grid">
                        {recipes.map((r) => {
                            const imageUrl =
                                r.image &&
                                (r.image.startsWith("http")
                                    ? r.image
                                    : `${API_BASE}/${(r.image as string).replace(/^\/+/, "")}`);

                            return (
                                <div key={r.id} className="card split">
                                    <div className="card-media">
                                        {imageUrl && (
                                            <img
                                                src={imageUrl}
                                                alt={r.title}
                                                className="thumb-media"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        )}
                                        <div className="title-overlay">
                                            <div className="title-row">
                                                <h3 title={r.title}>{r.title}</h3>
                                            </div>
                                            {r.author && (
                                                <div
                                                    className="author-badge"
                                                    title={`Creator: ${r.author}`}
                                                >
                                                    By {r.author}
                                                </div>
                                            )}
                                            {r.rating !== null && r.rating !== undefined && (
                                                <span
                                                    className="rating"
                                                    aria-label={`Rating ${Number(r.rating).toFixed(1)} out of 5`}
                                                >
                                                    ★ {Number(r.rating).toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="card-bottom">
                                        {r.description && (
                                            <p className="excerpt clamp-2">{r.description}</p>
                                        )}
                                        <div className="row meta-row">
                                            <div className="meta-left">
                                                {r.time && <span>⏱ {r.time} min</span>}
                                                {r.calories && <span>🔥 {r.calories} kcal</span>}
                                            </div>
                                            <div className="flex items-center gap-2 mr-2">
                                                {isAuthenticated && (
                                                    <>
                                                        <button
                                                            onClick={() => toggleFavorite(r.id)}
                                                            className={
                                                                "inline-flex items-center justify-center w-8 h-8 rounded-full transition " +
                                                                (favoriteIds.includes(r.id)
                                                                    ? "bg-yellow-400 text-black hover:bg-yellow-500/90"
                                                                    : "bg-black text-white hover:bg-black/80")
                                                            }
                                                            type="button"
                                                            title="Favorite"
                                                        >
                                                            <StarIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleSelectedRecipe(r.id)}
                                                            className={
                                                                "inline-flex items-center justify-center w-8 h-8 rounded-full transition " +
                                                                (selectedRecipeIds.includes(r.id)
                                                                    ? "bg-white text-black border border-black"
                                                                    : "bg-black text-white hover:bg-black/80")
                                                            }
                                                            type="button"
                                                            title="Add to list"
                                                        >
                                                            <ListIcon className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                            <div className="ml-auto">
                                                <Link
                                                    href={`/recipe-page?id=${r.id}`}
                                                    className="inline-flex items-center gap-1 rounded-full border border-black px-3 py-1 text-sm hover:bg-black hover:text-white transition"
                                                >
                                                    Open
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </main>
    );
}