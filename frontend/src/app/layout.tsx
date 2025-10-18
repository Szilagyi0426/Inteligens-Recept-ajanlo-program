import './globals.css';
import type { Metadata } from 'next';
import QueryProvider from '@/lib/query/QueryProvider';
import ToastProvider from '@/components/layout/ToastProvider';


export const metadata: Metadata = {
    title: 'Recept Ajánló', // Oldal címe
    description: 'Személyre szabott receptek és hozzávaló ajánló', // Oldal leírása
    manifest: '/manifest.json', // Web App Manifest elérési útja
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="hu">
        <body>
        <QueryProvider>{children}</QueryProvider>
        <ToastProvider /> {/* <-- Globális toast minden oldalhoz */}
        </body>
        </html>
    );
}