'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                style: {
                    background: '#333',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '0.9rem',
                },
                success: {
                    iconTheme: {
                        primary: '#10b981', // emerald
                        secondary: 'white',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444', // red
                        secondary: 'white',
                    },
                },
            }}
        />
    );
}