'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginForm as LoginFormType } from '@/lib/validation/auth';
import { login as loginApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

function IconUser() { // User icon
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
            <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"/>
        </svg>
    );
}
function IconLock() { // Lock icon
    return ( 
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
            <path fill="currentColor" d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-6 0V6a2 2 0 0 1 4 0v2Z"/>
        </svg>
    );
}
function IconEye({ off }: { off?: boolean }) { // Eye icon (off state when 'off' is true)
    if (off) {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                <path fill="currentColor" d="M3 3 21 21l-1.41 1.41L16.73 23l-2.2-2.2A10.91 10.91 0 0 1 12 21C6 21 1.73 16.5 1 12c.21-1.21.77-2.43 1.56-3.56L1.59 5.59 3 4.17 5.59 6.76 12 13.17l6.41 6.41Z"/>
            </svg>
        );
    }
    return ( // Eye icon (on state)
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
            <path fill="currentColor" d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7Zm0 11a4 4 0 1 1 4-4 4 4 0 0 1-4 4Z"/>
        </svg>
    );
}

// Bejelentkezés űrlap
export default function LoginForm({
                                      onSuccess,
                                      onError,
                                  }: {
    onSuccess?: (msg: string) => void;
    onError?: (msg: string) => void;
}) {
    const router = useRouter(); // Next.js router
    const [loading, setLoading] = useState(false); // Betöltés állapot
    const [showPw, setShowPw] = useState(false); // Jelszó mutatása/elrejtése
    const { register, handleSubmit, formState: { errors } } = 
        useForm<LoginFormType>({ resolver: zodResolver(LoginSchema) });

    // Űrlap beküldése
    const onSubmit = async (data: LoginFormType) => {
        setLoading(true);
        try {
            const result = await loginApi(data);
            const token = (result as any)?.access_token || '';
            // Sikeres bejelentkezés esetén tároljuk a tokent és a felhasználónevet
            try {
                localStorage.setItem('token', token);
                localStorage.setItem('username', data.username);
                const user_id = (result as any)?.user_id;
                if (user_id !== undefined && user_id !== null) {
                    localStorage.setItem('user_id', String(user_id));
                }
                console.log("userID:" + user_id)

                const roleId = (result as any)?.role_id;
                if (roleId !== undefined && roleId !== null) {
                    localStorage.setItem('role_id', String(roleId));
                }
                
                window.dispatchEvent(new StorageEvent('storage', { key: 'token' }));
            } catch (e) {
                console.error('Failed to store login data:', e);
            }
            onSuccess?.('Successful login');
            // Átirányítás a főoldalra
            router.push('/');
        } catch (e: any) { // Hibakezelés
            onError?.(e?.message || 'Error during login');
        } finally {
            setLoading(false);
        }
    };

    return ( // Login űrlap
      <form onSubmit={handleSubmit(onSubmit)} className="anim-stagger">
        <div className="space-y-4">
          <div className="space-y-1 anim-slide-in-left">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Username</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <IconUser />
              </span>
              <input
                className="w-full rounded-xl border border-neutral-300 bg-white/80 pl-10 pr-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-neutral-700 dark:bg-neutral-900/60"
                placeholder="user123"
                autoComplete="username"
                {...register('username')}
              />
            </div>
            {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div className="space-y-1 anim-slide-in-right">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Password</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <IconLock />
              </span>
              <input
                type={showPw ? 'text' : 'password'}
                className="w-full rounded-xl border border-neutral-300 bg-white/80 pl-10 pr-10 py-2 text-sm shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-neutral-700 dark:bg-neutral-900/60"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
              />
              <button
                type="button"
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                onClick={() => setShowPw((s) => !s)}
              >
                <IconEye off={!showPw} />
              </button>
            </div>
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl bg-emerald-600 px-4 py-2 text-white shadow ring-emerald-400 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 btn-shimmer transition-transform active:scale-[.98]"
          >
            <span className="inline-flex items-center justify-center gap-2 text-sm">
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                </svg>
              )}
              {loading ? 'Logging in…' : 'Login'}
            </span>
          </button>
        </div>
      </form>
    );
}