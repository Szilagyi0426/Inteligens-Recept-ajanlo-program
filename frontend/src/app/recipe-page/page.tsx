"use client";

import { useState, useEffect } from "react";
import { FaClock } from "react-icons/fa";
import { RiKnifeFill } from "react-icons/ri";
import { PiCookingPotFill } from "react-icons/pi";


import { recipePage } from "./components/recipePage";
import {
    List,
    ListIcon,
    StarIcon
} from "lucide-react";

export default function Page() {
    const {
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
    } = recipePage();

    const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
    const token = localStorage.getItem("token");

    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
    const [selectedRecipeIds, setSelectedRecipeIds] = useState<number[]>([]);

    useEffect(() => {
        if (!Array.isArray(normalizedList)) return;

        const initialFavoriteIds = normalizedList
            .filter((r: any) => r.is_favorite === true)
            .map((r: any) => r.id);
        const initialSelectedIds = normalizedList
            .filter((r: any) => r.is_selected === true)
            .map((r: any) => r.id);

        setFavoriteIds(initialFavoriteIds);
        setSelectedRecipeIds(initialSelectedIds);
    }, [normalizedList]);

    const syncFavorite = async (recipeId: number, isFavorite: boolean) => {
        try {
            await fetch(`${API_BASE}/recipe/${recipeId}/favorite`, {
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
    };

    const syncSelectedRecipe = async (
        recipeId: number,
        selected: boolean
    ) => {
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
    };

    const toggleFavorite = (id: number) => {
        setFavoriteIds((prev) => {
            const willBeFavorite = !prev.includes(id);
            // Optimistically update UI, then sync with backend
            syncFavorite(id, willBeFavorite);
            return willBeFavorite
                ? [...prev, id]
                : prev.filter((rid) => rid !== id);
        });
    };

    const toggleSelectedRecipe = (id: number) => {
        setSelectedRecipeIds((prev) => {
            const willBeSelected = !prev.includes(id);
            // Optimistic update + backend sync
            syncSelectedRecipe(id, willBeSelected);
            return willBeSelected
                ? [...prev, id]
                : prev.filter((rid) => rid !== id);
        });
    };

    return (
        <main className="recipes-shell">
            <header className="page-header">
              {!selectedId ? (
                <>
                  <h1>Recipes</h1>
                  <p>Browse recipes and open details.</p>
                </>
              ) : (
                <button
                  onClick={() => goToPage(page)}
                  className="btn secondary"
                  style={{ marginTop: "1rem", marginBottom: "1rem", marginLeft: "1rem" }}
                >
                  ← Back to recipes
                </button>
              )}
            </header>

            {/* DETAIL VIEW */}
            {selectedId && (
                
                <section className="detail detail-shell bg-gray-200" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: "1.5rem", alignItems: "stretch" }}>
                    {detailLoading && <div className="hint">Loading…</div>}
                    {!detailLoading && detailError && (
                        <div className="error" style={{ gridColumn: "1 / -1" }}>
                          {detailError === "RecipeNotFound" || detailError === "Recipe not found"
                            ? "This recipe is no longer available."
                            : detailError}
                          <div style={{ marginTop: "0.75rem" }}>
                            
                          </div>
                        </div>
                    )}
                    {/* LEFT SIDE: main content */}
                    <div className="detail-main" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        {!detailLoading && !detailError && normalizedDetail && (
                            <article className="detail-card" style={{ margin: "-10px 0 0 0", padding: 0 }}>
                                {
                                    (normalizedDetail.image || imageMap[normalizedDetail.id]) && (
                                    <div style={{ position: "relative", borderRadius: "0.75rem", overflow: "hidden" }}>
                                        <img
                                            src={(normalizedDetail.image || imageMap[normalizedDetail.id]) as string}
                                            alt={normalizedDetail.title}
                                            className="detail-img shadow-lg"
                                            style={{ width: "100%", height: "auto", display: "block" }}
                                            loading="eager"
                                            decoding="async"
                                            fetchPriority="high"
                                        />
                                        <div
                                            style={{
                                                position: "absolute",
                                                bottom: 0,
                                                left: 0,
                                                width: "100%",
                                                padding: "1rem",
                                                background:
                                                    "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0) 100%)",
                                                color: "white",
                                            }}
                                        >
                                            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                                                {normalizedDetail.title}
                                            </h2>
                                            {detail?.description && (
                                                <p
                                                    style={{
                                                        fontSize: "0.9rem",
                                                        opacity: 0.85,
                                                        maxHeight: "3.6em",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {detail.description}
                                                </p>
                                            )}
                                            {(() => {
                                                const authorName = detail.author_name
                                                return authorName ? (
                                                    <div
                                                        className="author-badge"
                                                        title={`Creator: ${authorName}`}
                                                        style={{ position: "absolute", right: "1rem", bottom: "1rem" }}
                                                    >
                                                        by {authorName}
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </article>
                        )}

                        {/* description, then steps directly under the image */}
                        {!detailLoading && !detailError && detail && (
                            <div className="detail-flow" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                                {Array.isArray((detail as any).steps) && (detail as any).steps.length > 0 && (
                                    <div className="detail-section bg-gray-50 shadow-lg rounded-xl p-4">
                                        <h3 className="section-title">Step-by-step instructions</h3>
                                        <ol className="steps-list">
                                            {(detail as any).steps.map((step: any, idx: number) => {
                                                const text = typeof step === "string" ? step : step.text || step.description || step.title;
                                                return (
                                                    <li key={idx}>
                                                        <span className="step-index">{idx + 1}.</span>
                                                        <span>{text}</span>
                                                    </li>
                                                );
                                            })}
                                        </ol>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE: ingredients panel */}
                    <aside className="detail-aside" style={{ height: "100%", alignSelf: "stretch" }}>
                        {!detailLoading && !detailError && Array.isArray((detail as any)?.ingredients) && (detail as any).ingredients.length > 0 && (
                            <div
                                className="detail-section bg-gray-50 shadow-lg"
                                style={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    border: "1px solid rgba(0,0,0,0.05)",
                                    borderRadius: "0.75rem",
                                    padding: "1rem",
                                    gap: "0.75rem",
                                }}
                            >
                                <h3 className="section-title" style={{ marginBottom: "0.75rem" }}>Ingredients</h3>
                                <ul className="pill-list">
                                    {(detail as any).ingredients.map((ing: any, idx: number) => {
                                        let name: any;
                                        if (typeof ing === "string") {
                                            name = ing;
                                        } else {
                                            const rawName = ing.name || ing.ingredient || ing.title;
                                            if (typeof rawName === "string") {
                                                name = rawName;
                                            } else if (rawName && typeof rawName === "object") {
                                                name = rawName.name || JSON.stringify(rawName);
                                            } else {
                                                name = `Ingredient ${idx + 1}`;
                                            }
                                        }

                                        let amount = ing?.amount || ing?.quantity || ing?.qty || null;
                                        if (amount && typeof amount === "object") {
                                            const value = amount.value || amount.val || amount.amount || amount.name;
                                            amount = typeof value === "number" || typeof value === "string" ? value : JSON.stringify(amount);
                                        }

                                        let unit = ing?.unit || ing?.unit_name || ing?.measurement || ing?.measure || ing?.measure_unit || null;
                                        if (unit && typeof unit === "object") {
                                            unit = unit.name || unit.label || unit.short || JSON.stringify(unit);
                                        }
                                        if (!unit && ing?.amount && typeof ing.amount === "object") {
                                            const u = ing.amount.unit || ing.amount.unit_name || ing.amount.measure;
                                            if (u) {
                                                unit = typeof u === "object" ? u.name || u.label || JSON.stringify(u) : u;
                                            }
                                        }

                                        return (
                                            <li key={idx} className="pill">
                                                <span>{name}</span>
                                                {(amount || unit) && (
                                                    <span className="pill-muted"> – {amount ? amount : ""}{amount && unit ? " " : ""}{unit ? unit : ""}</span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.4rem", fontWeight: 500 }}>
                                    {detail && typeof detail.total_minutes === "number" && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <FaClock />
                                        <span>Total time: {detail.total_minutes} min</span>
                                      </div>
                                    )}
                                    {detail && typeof detail.cook_minutes === "number" && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <PiCookingPotFill />
                                        <span>Cook time: {detail.cook_minutes} min</span>
                                      </div>
                                    )}
                                    {detail && typeof detail.prep_minutes === "number" && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <RiKnifeFill />
                                        <span>Preparation time: {detail.prep_minutes} min</span>
                                      </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </aside>
                </section>
            )}

            {/* LIST VIEW */}
            {!selectedId && (
                <section className="list" >
                    {listLoading && (
                        <div className="grid">
                            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                                <div key={i} className="card skeleton">
                                    <div className="sk-title" />
                                    <div className="sk-img" />
                                    <div className="sk-line" />
                                    <div className="sk-line short" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!listLoading && listError && (
                        <div className="error">{listError}</div>
                    )}

                    {!listLoading && !listError && (
                        <>
                            <div className="grid">
                                {normalizedList.map((r: any) => (
                                    <div key={r.id} className="card split">
                                        <div className="card-media">
                                            {(r.image || imageMap[r.id]) && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={(r.image || imageMap[r.id]) as string}
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
                                                        by {r.author}
                                                    </div>
                                                )}
                                                {r.rating !== null && (
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
                                                    {token && (
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
                                                <button
                                                    onClick={() => openRecipe(r.id)}
                                                    className="btn primary small"
                                                >
                                                    Open
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <nav className="pagination">
                                <button
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page <= 1}
                                    className="btn secondary"
                                >
                                    ← Previous
                                </button>
                                <span className="page-ind">Page {page}</span>
                                <button
                                    onClick={() => goToPage(page + 1)}
                                    disabled={!hasNext}
                                    className="btn secondary"
                                >
                                    Next →
                                </button>
                            </nav>
                        </>
                    )}
                </section>
            )}
            
    </main>
  );
}