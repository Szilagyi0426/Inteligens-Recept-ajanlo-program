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

    useEffect(() => {
        if (!checked) return;

        // ha bejelentkezett, de nincs beállítva a profilnév
        if (authed) {
            try {
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                const fullName = userData?.full_name;
                console.log(fullName);

                // ha üres vagy hiányzik → redirect, de csak ha nem pont ott van
                const onSetupPage = pathname === '/register-profile-setup';
                /*
                if ((!fullName || fullName.trim() === '') && !onSetupPage) {
                    router.replace('/register-profile-setup');
                }

                // ha van név, de mégis a setup oldalon van, visszadobjuk főoldalra
                if (fullName && pathname === '/register-profile-setup') {
                    router.replace('/');
                }
                
                 */
            } catch (e) {
                console.error('Failed to parse user data from localStorage', e);
            }
        }
    }, [authed, checked, pathname, router]);

    // Navbar mindig megjelenik
    const showNavbar = true;

    return (
        <QueryClientProvider client={client}>
            {showNavbar && <Navbar />}
            {children}
        </QueryClientProvider>
    );
}