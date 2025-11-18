"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api/v1";

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const tokenRef = useRef<string | null>(null);

  const [randomRecipe, setRandomRecipe] = useState<any | null>(null);
  const [randomLoading, setRandomLoading] = useState(false);
  const [randomError, setRandomError] = useState<string | null>(null);

  const router = useRouter();

  const normalizeRecipe = (r: any) => {
    if (!r) return null;
    const title = r.title || r.name || r.recipe_title || r.RecipeName || "Untitled recipe";
    const description = r.description || r.summary || r.details || "No description available.";
    const time = r.total_minutes || r.ready_in_minutes || r.readyInMinutes || r.total_time || r.cook_time || r.prep_time || r.time || null;
    const calories = r.calories || r.kcal || r.energy || r?.nutrition?.calories || null;
    const tags = r.diets || r.tags || r.labels || r.categories || [];
    const id = r.id || r.recipe_id || r.RecipeID || r._id || null;
    return { id, title, description, time, calories, tags };
  };

  const loadRandomRecipe = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setRandomLoading(true);
    setRandomError(null);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      let data: any = null;
        const res = await fetch(`${API_BASE}/recipe/list?random=true&limit=1`,{ headers, cache: 'no-store' });
        if (res.ok) {
          const body = await res.json();
          // Body could be an array or an object
          data = Array.isArray(body) ? (body[0] ?? null) : (body?.recipe ?? body);
      }
      if (!data) throw new Error('No random recipe found');
      setRandomRecipe(normalizeRecipe(data));
    } catch (e: any) {
      setRandomError(e?.message || 'Failed to load random recipe');
      setRandomRecipe(null);
    } finally {
      setRandomLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const refresh = () => {
      const t = localStorage.getItem('token');
      if (tokenRef.current !== t) {
        tokenRef.current = t;
        setIsLoggedIn(!!t);
      }
    };

    // Initial check
    refresh();
    loadRandomRecipe();

    // React to token changes across tabs/windows
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') refresh();
    };

    // Update on focus/visibility change (same-tab navigation or return)
    const onFocus = () => refresh();
    const onVisibility = () => refresh();

    // Optional: react to a custom event your logout/login code can dispatch
    const onAuthChanged = () => { refresh(); loadRandomRecipe(); };

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('auth:changed', onAuthChanged as EventListener);

    // Lightweight polling fallback to catch same-tab programmatic changes
    const interval = window.setInterval(refresh, 2000);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('auth:changed', onAuthChanged as EventListener);
      window.clearInterval(interval);
    };
  }, [loadRandomRecipe]);

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "radial-gradient(1200px 600px at 10% 10%, rgba(0,0,0,0.06), transparent),radial-gradient(800px 400px at 90% 20%, rgba(0,0,0,0.04), transparent)"
    }}>
      <div style={{
        width: "min(1100px, 92vw)",
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: "42px",
        alignItems: "center"
      }}>
        {/* HERO LEFT */}
        <section>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 52px)",
            lineHeight: 1.05,
            margin: 0,
            letterSpacing: "-0.02em"
          }}>
            Smart Recipe Recommender
          </h1>
          <p style={{
            marginTop: 12,
            fontSize: "clamp(16px, 2.2vw, 20px)",
            lineHeight: 1.5,
            opacity: 0.9
          }}>
            Find recipes that fit you in seconds — filtered by preferences, sensitivities, and nutrition. Simple, fast, personalized.
          </p>

          {!isLoggedIn && (
            <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
              <Link
                href="/login-page?mode=register"
                style={{
                  padding: "12px 18px",
                  borderRadius: 10,
                  background: "black",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 600
                }}
              >
                Get started — Sign up
              </Link>
              <Link
                href="/login-page?mode=login"
                style={{
                  padding: "12px 18px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.12)",
                  textDecoration: "none",
                  fontWeight: 600
                }}
              >
                Sign in
              </Link>
            </div>
          )}

          {/* TRUST/STAT */}
          <div style={{ display: "flex", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
            <Badge text="Fast search" />
            <Badge text="Allergen filtering" />
            <Badge text="Nutrition data" />
          </div>
        </section>

        {/* HERO RIGHT – CARD */}
        <section>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700 }}>Sample recommendation</div>
              <span style={pill}>Editor’s pick </span>
            </div>
            {randomLoading && (
              <div style={{ marginTop: 12, opacity: 0.8 }}>Loading recipe…</div>
            )}
            {!randomLoading && randomError && (
              <div style={{ marginTop: 12, color: '#b00020' }}>{randomError}</div>
            )}
            {!randomLoading && !randomError && randomRecipe && (
              <ul style={{ margin: '14px 0 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
                <li style={row}><b> {randomRecipe.title}</b></li>
                {randomRecipe.description && (
                  <li style={{ ...row, flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.4 }}>
                    <span style={{ opacity: 0.9 }}>{randomRecipe.description}</span>
                  </li>
                )}
                {randomRecipe.time && <li style={row}><b>Time:</b> {String(randomRecipe.time)} min</li>}
                {randomRecipe.calories && <li style={row}><b>Calories:</b> ~{String(randomRecipe.calories)} kcal</li>}
                {Array.isArray(randomRecipe.tags) && randomRecipe.tags.length > 0 && (
                  <li style={row}><b>Fits:</b> {randomRecipe.tags.join(', ')}</li>
                )}
              </ul>
            )}
            {!randomLoading && !randomError && !randomRecipe && (
              <div style={{ marginTop: 12, opacity: 0.8 }}>No recipe available right now.</div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <Link href="/recipe-page" style={{ ...button, background: "black", color: "white" }}>Browse recipes</Link>
              {randomRecipe?.id && (
                <button
                  onClick={() => router.push(`/recipe-page?id=${randomRecipe.id}`)}
                  style={{ ...button, border: "1px solid rgba(0,0,0,0.12)", background: "white", cursor: "pointer" }}
                >
                  Open this recipe
                </button>
              )}
            </div>
          </div>
        </section>

        {/* FEATURES – FULL WIDTH */}
        <section style={{ gridColumn: "1 / -1", marginTop: 10 }}>
          <h2 style={{ fontSize: 20, margin: "32px 0 14px" }}>Why it's great</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16
          }}>
            <Feature title="Smart filtering" desc="By ingredients, allergens, cuisine, and nutrition." />
            <Feature title="Easy shopping" desc="Generate a shopping list in one click." />
            <Feature title="Quick start" desc="Import your favorites or pick the daily recommendation." />
          </div>
        </section>
      </div>
    </main>
  );
}

const card: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 16,
  padding: 18,
  background: "white",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)"
};

const pill: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,0.1)",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 12,
  background: "#fafafa"
};

const button: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 600
};

const row: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center"
};

function Badge({ text }: { text: string }) {
  return (
    <span style={{
      border: "1px solid rgba(0,0,0,0.1)",
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: 13,
      background: "#fff"
    }}>{text}</span>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: 14,
      padding: 16,
      background: "#fff"
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ opacity: 0.9, lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}