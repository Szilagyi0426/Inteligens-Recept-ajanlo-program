'use client';
import { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';


export default function AuthPage() { // Authentikációs oldal | Bejelentkezés és regisztráció
    const [mode, setMode] = useState<'login' | 'register'>('login'); // Állapot a bejelentkezési és regisztrációs mód között
    const [msg, setMsg] = useState<string | null>(null); // Állapot az üzenetekhez (sikeres vagy hibás műveletek)

    return (
        <main className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white dark:from-neutral-900 dark:to-neutral-950 anim-fade-in">
            <div className="mx-auto w-full max-w-xl px-6">
                <header className="mb-8 text-center"> 
                    <h1 className="text-3xl font-semibold tracking-tight">Recipe Recommender</h1>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                        Personalized recipes and ingredient suggestions
                    </p>
                </header>
                <div className="flex justify-center items-center">
                    <div className="w-full mx-4 md:mx-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 backdrop-blur shadow-lg anim-pop">
                        {/* Tabs */}
                        <div className="flex p-2">
                            <button
                                className={`flex-1 px-4 py-2 text-sm rounded-lg transition ${
                                    mode === 'login'
                                        ? 'bg-emerald-600 text-white shadow'
                                        : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50'
                                }`}
                                onClick={() => setMode('login')}
                                type="button"
                            >
                                Login
                            </button>
                            <button
                                className={`flex-1 px-4 py-2 text-sm rounded-lg transition ${
                                    mode === 'register'
                                        ? 'bg-emerald-600 text-white shadow'
                                        : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50'
                                }`}
                                onClick={() => setMode('register')}
                                type="button"
                            >
                                Register
                            </button>
                        </div>

                        {msg && (
                            <div className="mx-4 mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
                                {msg}
                            </div>
                        )}

                        <div className="p-4">
                            {mode === 'login' ? (
                                <LoginForm onSuccess={setMsg} onError={setMsg} />
                            ) : (
                                <RegisterForm onSuccess={setMsg} onError={setMsg} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}