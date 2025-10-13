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

    // auth állapot figyelése localStorage alapján
    useEffect(() => {
        const check = () => setAuthed(!!localStorage.getItem('token'));
        check();
        window.addEventListener('storage', check);
        return () => window.removeEventListener('storage', check);
    }, []);

    // ha nincs token és nem az engedélyezett route-on vagyunk -> redirect a loginra
    useEffect(() => {
        const allowlist = new Set<string>(['/', '/register-profile-setup']); // ← csak a kombinált auth oldal és setup oldal publikus
        if (!authed && pathname && !allowlist.has(pathname)) {
            router.push('/');
        }
    }, [authed, pathname, router]);

    // Navbar csak auth mellett és nem a login oldalon
    const hideOnRoutes = new Set<string>(['/', '/register-profile-setup']);
    const showNavbar = authed && !hideOnRoutes.has(pathname || '');

    return (
        <QueryClientProvider client={client}>
            {showNavbar && <Navbar />}
            {children}
        </QueryClientProvider>
    );
}