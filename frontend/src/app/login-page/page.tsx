'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import toast from 'react-hot-toast';


//**********************************************************************//
// Bejelentkezésért, és Regisztrációs frontend felületért felelős fájl.
// 3 állapot lehez az oldalon, login, register, vagy forgot.
// Alapértelmezetten a login oldal jelenik meg az oldalra lépéskor.
//**********************************************************************//

export default function AuthPage() { // Authentikációs oldal | Bejelentkezés és regisztráció
    const searchParams = useSearchParams();
    const initialModeParam = searchParams.get('mode');
    const initialMode =
      initialModeParam === 'register'
        ? 'register'
        : initialModeParam === 'forgot'
          ? 'forgot'
          : 'login';
    const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode); // Állapot a bejelentkezési és regisztrációs mód között

    return (
        <main className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white dark:from-neutral-900 dark:to-neutral-950 anim-fade-in">
            <div className="mx-auto w-full max-w-xl px-6">
                
                
                {/* Az oldal header része, ahol az oldal neve, és rövid ismertető szövege kap helyet */}
                <header className="mb-8 text-center"> 
                    <h1 className="text-3xl font-semibold tracking-tight">Recipe Recommender</h1>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                        Personalized recipes and ingredient suggestions
                    </p>
                </header>
                
                {/* A Bejelentkezés / Regisztrációs / Elfelejtett jelszó szekció */}
                <div className="flex justify-center items-center">
                    <div className="w-full mx-4 md:mx-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 backdrop-blur shadow-lg anim-pop">
                       
                        {/* Választó felület a Bejelentkezés / Regisztrációs felület között */}
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
                        
                        
                        
                        <div className="p-4">

                            {/* Ha a Bejelentkezési felület aktív*/}
                            {mode === 'login' && (
                              <>
                                {/* Sikeres / Sikertelen bejelentkezés esetén milyen hibaüzenetet írjon ki */}
                                <LoginForm 
                                    onSuccess={(message?: string) => toast.success(message || 'Successful login!')}
                                    onError={(message?: string) =>
                                    toast.error(message?.replace(/^"|"$/g, '') || 'There was an error, while signing in!')
                                  }
                                />
                                  
                                  
                                {/* Elfelejtetted a jelszavadat gomb */}
                                <p className="mt-4 text-xs text-neutral-500 text-center">
                                  Have you forgot you're password?{' '}
                                  <button
                                    type="button"
                                    onClick={() => setMode('forgot')}
                                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                                  >
                                    Forgot Password
                                  </button>
                                </p>
                              </>
                            )}
                            {mode === 'register' && (
                              <RegisterForm
                                onSuccess={(message?: string) => toast.success(message || 'Successful registration!')}
                                onError={(message?: string) =>
                                  toast.error(message?.replace(/^"|"$/g, '') || 'There was an error while registering!')
                                }
                              />
                            )}
                            {mode === 'forgot' && (
                              <form
                                className="space-y-3"
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  const formData = new FormData(e.currentTarget);
                                  const email = formData.get('email') as string;
                                  if (!email) {
                                    toast.error('Please enter a valid email address!');
                                    return;
                                  }
                                  try {
                                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
                                    const res = await fetch(`${baseUrl}/auth/forgot-password`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({ email }),
                                    });
                                    const data = await res.json().catch(() => null);
                                    if (!res.ok) {
                                      const msg = (data && (data.detail || data.message)) || 'There was a problem while sending the password recovery email!.';
                                      toast.error(typeof msg === 'string' ? msg.replace(/^"|"$/g, '') : 'Hiba történt.');
                                      return;
                                    }
                                    toast.success(
                                      (data && (data.detail || data.message)) || 'Recovery email sent successfully!'
                                    );
                                    setMode('login');
                                  } catch (error) {
                                    toast.error('Internal Server Error.');
                                  }
                                }}
                              >
                                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Forgot password</h2>
                                <p className="text-xs text-neutral-500">
                                  Please enter you're e-mail addres, so we can send the recovery e-mail.
                                </p>
                                <div className="flex flex-col gap-1">
                                  <label htmlFor="email" className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                    E-mail cím
                                  </label>
                                  <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="rounded-lg border border-neutral-200/60 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="example@mail.com"
                                  />
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                                  >
                                    Send link
                                  </button>
                                </div>
                              </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}