'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
    LuClipboardList,
    LuStarHalf
} from 'react-icons/lu';
import { LuChefHat } from 'react-icons/lu';
import { LuShield } from 'react-icons/lu';

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path fill="currentColor" d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3Z"/>
    </svg>
  );
}
function IconUserCircle() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 5a3 3 0 1 1-3 3 3 3 0 0 1 3-3Zm0 13a7.94 7.94 0 0 1-6.4-3.2 6 6 0 0 1 12.8 0A7.94 7.94 0 0 1 12 20Z"/>
    </svg>
  );
}

import { usePathname } from 'next/navigation';
import {StarIcon} from "lucide-react";
import {FaUserShield} from "react-icons/fa";

export default function Navbar() { // Navigációs sáv a tetején
    const router = useRouter();
    const pathname = usePathname();
    if (pathname === '/login-page') return null;
    const [username, setUsername] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<number>(0); // 0: user, 1: moderator, 2: admin

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    
    useEffect(() => {
      function onDocClick(e: MouseEvent) { // Hamburger menü bezárása kattintásra
        if (!menuRef.current) return;
        if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      }
      function onEsc(e: KeyboardEvent) { // Hamburger menü bezárása Esc gombra
        if (e.key === 'Escape') setMenuOpen(false);
      }
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onEsc);
      return () => {
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('keydown', onEsc);
      };
    }, []);

    useEffect(() => { // Felhasználónév és szerepkör lekérése
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('username');
        const role = localStorage.getItem('user_role');
        if (token && user) {
            setUsername(user);
            setUserRole(role ? parseInt(role) : 0);
        }
    }, []);

    function logout() { // Kijelentkezés
        try { // localStorage törlése
            localStorage.clear();
        } catch {}
        setUsername(null);
        setUserRole(0);
        
        try { // Esemény küldése a localStorage változásáról (más ablakoknak)
            window.dispatchEvent(new StorageEvent('storage', { key: 'token' }));
            window.dispatchEvent(new StorageEvent('storage', { key: 'username' }));
        } catch {}
        // Felhasználó átirányítása a login oldalra
        router.replace('/');
    }

    return (
      <nav className="sticky top-0 z-50 w-full border-b border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 backdrop-blur anim-fade-in">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex h-14 items-center justify-between gap-3">
            {/* Brand */}
            <button
              type="button"
              onClick={() => router.push('')}
              className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 transition active:scale-[.98]"
              aria-label="Go to main page"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow">
                🍳
              </span>
              <span className="text-m md:text-base font-semibold tracking-tight">Recipe Recommender</span>
            </button>

            {/* Right side */}
            <div className="flex items-center gap-2 md:gap-3 ml-auto">
              {/* Home button (optional middle action) */}
              <button
                type="button"
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-m text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 transition active:scale-[.98]"
              >
                <IconHome />
                <span className="hidden sm:inline">Home</span>
              </button>
                <button
                    type="button"
                    onClick={() => router.push('/recipe-page')}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-m text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 transition active:scale-[.98]"
                >
                    <LuChefHat />
                    <span className="hidden sm:inline ">Recipes</span>
                </button>
                <button
                    type="button"
                    onClick={() => router.push('/shopping-list-page')}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-m text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 transition active:scale-[.98]"
                >
                    
                    <LuClipboardList  />
                    <span className="hidden sm:inline">Shopping List</span>
                </button>
                 

              {username && (
                  <button
                      type="button"
                      onClick={() => router.push('/favorites-page')}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-m text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 transition active:scale-[.98]"
                  >
                      <StarIcon />
                      <span className="hidden sm:inline">Favorties</span>
                  </button>
              )}

              {/* User avatar at the far right with dropdown */}
              {username ? (
                <div ref={menuRef} className="relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 px-2.5 py-1.5 text-m text-neutral-800 dark:text-neutral-100 shadow-sm hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 transition active:scale-[.98]"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
                      {username.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden lg:block max-w-[14ch] truncate">{username}</span>
                    <svg
                      viewBox="0 0 20 20"
                      className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    >
                      <path fill="currentColor" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.38a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"/>
                    </svg>
                  </button>

                  {menuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/90 dark:bg-neutral-900/80 backdrop-blur shadow-lg anim-pop"
                    >
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); router.push('/profile-page'); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-m text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 transition"
                        role="menuitem"
                      >
                        <IconUserCircle />
                        <span>Profile</span>
                      </button>
                      {userRole === 1 && (
                        <button
                          type="button"
                          onClick={() => { setMenuOpen(false); router.push('/moderator-dashboard'); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-m text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 transition"
                          role="menuitem"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                            <path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z" />
                          </svg>
                          <span>Moderator</span>
                        </button>
                      )}
                      {userRole === 2 && (
                        <>
                          <button
                            type="button"
                            onClick={() => { setMenuOpen(false); router.push('/admin-page'); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-m text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 transition"
                            role="menuitem"
                          >
                            <FaUserShield className="h-5 w-5" />
                            <span>Admin</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setMenuOpen(false); router.push('/moderator-dashboard'); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-m text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 transition"
                            role="menuitem"
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                              <path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z" />
                            </svg>
                            <span>Moderator</span>
                          </button>
                        </>
                      )}
                      <div className="h-px bg-neutral-200/60 dark:bg-neutral-800/60" />
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); logout(); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-m text-red-600 hover:bg-red-50/80 dark:hover:bg-red-900/30 transition"
                        role="menuitem"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                          <path fill="currentColor" d="M10 17v2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5v2H5v10ZM14 16l5-4-5-4v3H9v2h5Z"/>
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/login-page')}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-m hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/login-page?mode=register')}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white font-medium hover:bg-emerald-700 transition"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
}