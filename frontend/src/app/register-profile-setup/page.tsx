import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function QueryProvider({ children }: { children: ReactNode }) {
    const [authed, setAuthed] = useState(false);
    const [checked, setChecked] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

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
        if (!checked) return; // avoid redirect before we know auth state
        const allowlist = new Set<string>(['/', '/register-profile-setup']);
        if (!authed && pathname && !allowlist.has(pathname)) {
            router.replace('/');
        }
    }, [checked, authed, pathname, router]);

    const hideOnRoutes = new Set<string>(['/', '/register-profile-setup']);
    const showNavbar = checked && authed && !hideOnRoutes.has(pathname || '');

    return (
        <>
            {showNavbar && <nav>Navbar content here</nav>}
            {children}
        </>
    );
}