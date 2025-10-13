import './globals.css';
import type { Metadata } from 'next';
import QueryProvider from '@/lib/query/QueryProvider';

export const metadata: Metadata = {
    title: 'Recept Ajánló', // Oldal címe
    description: 'Személyre szabott receptek és hozzávaló ajánló', // Oldal leírása
    manifest: '/manifest.json', // Web App Manifest elérési útja
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return ( // HTML tartalom
        <html lang="hu">
        <body>
        <QueryProvider>{children}</QueryProvider>
        </body>
        </html>
    );
}