'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';

// QueryClientProvider beállítása és auth állapot kezelése
export default function QueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60_000,
                        gcTime: 30 * 60_000,
                        retry: 1,
                    },
                },
            })
    );

    const pathname = usePathname();
    const router = useRouter();
    const [authed, setAuthed] = useState(false);
    const [checked, setChecked] = useState(false);

    // auth állapot figyelése localStorage alapján
    useEffect(() => {
        const check = () => {
            try {
                const has = typeof window !== 'undefined' && !!localStorage.getItem('token');
                setAuthed(has);
            } catch {
                setAuthed(false);
            } finally {
                setChecked(true);
            }
        };
        check();
        window.addEventListener('storage', check);
        return () => window.removeEventListener('storage', check);
    }, []);

    // ha nincs token és nem az engedélyezett route-on vagyunk -> redirect a loginra
    useEffect(() => {
        if (!checked) return; // avoid redirect before we know auth state
        const allowlist = new Set<string>(['/', '/register-profile-setup']);
        if (!authed && pathname && !allowlist.has(pathname)) {
            router.replace('/');
        }
    }, [checked, authed, pathname, router]);

    // Navbar csak auth mellett és nem a login oldalon
    const hideOnRoutes = new Set<string>(['/', '/register-profile-setup']);
    const showNavbar = checked && authed && !hideOnRoutes.has(pathname || '');

    return (
        <QueryClientProvider client={client}>
            {showNavbar && <Navbar />}
            {children}
        </QueryClientProvider>
    );
}