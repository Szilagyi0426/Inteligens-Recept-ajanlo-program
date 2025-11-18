'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {normalizeOptions, safeFetch, type OptionItem } from './preferencesApi';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000/api/v1';

export function preferencesLogic() {
    const router = useRouter();

    const [sensitivities, setSensitivities] = useState<OptionItem[]>([]);
    const [preferences, setPreferences] = useState<OptionItem[]>([]);
    const [selectedSensitivities, setSelectedSensitivities] = useState<
        Array<string | number>
    >([]);
    const [selectedPreferences, setSelectedPreferences] = useState<
        Array<string | number>
    >([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // token + userId
    let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const storedUserId =
        typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

    let authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    // betöltés
    useEffect(() => {
        const fetchData = async () => {
            try {
                // ha nincs token, de van user_id → próbálkozunk autologinnal
                if (!token && storedUserId) {
                    try {
                        const loginResponse = await fetch(`${API_BASE}/auth/login/`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: storedUserId }),
                        }).then((res) => res.json());

                        if (loginResponse.access_token) {
                            localStorage.setItem('token', loginResponse.access_token);
                            token = loginResponse.access_token;
                            authHeaders = { Authorization: `Bearer ${token}` };
                        } else {
                            console.warn('Automatic login failed: no access_token returned');
                        }
                    } catch (err) {
                        console.warn('Automatic login failed', err);
                    }
                }

                // opciók
                let sensDataRaw;
                try {
                    sensDataRaw = await safeFetch(`${API_BASE}/sensitivities/`, {}, authHeaders);
                } catch {
                    sensDataRaw = await safeFetch(`${API_BASE}/sensivity`, {}, authHeaders);
                }
                const prefDataRaw = await safeFetch(`${API_BASE}/preferences/`, {}, authHeaders);

                setSensitivities(normalizeOptions(sensDataRaw));
                setPreferences(normalizeOptions(prefDataRaw));

                // user kiválasztásai
                let userId: string | number | null = storedUserId;
                if (!userId && token) {
                    const me = await safeFetch(`${API_BASE}/auth/me`, {}, authHeaders);
                    userId = me?.id ?? me?.user_id;
                    if (userId) localStorage.setItem('user_id', String(userId));
                }

                if (userId) {
                    try {
                        const userPrefs = await safeFetch(
                            `${API_BASE}/users/${userId}/preferences/`,
                            {},
                            authHeaders
                        );
                        const userSens = await safeFetch(
                            `${API_BASE}/users/${userId}/sensitivities/`,
                            {},
                            authHeaders
                        );
                        setSelectedPreferences(userPrefs ?? []);
                        setSelectedSensitivities(userSens ?? []);
                    } catch (err) {
                        console.warn('Could not load user-specific selections');
                    }
                } else {
                    console.warn('No user info available, preferences cannot be loaded.');
                }
            } catch (err) {
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const toggleSelection = (id: string | number, type: 'sensitivity' | 'preference') => {
        if (type === 'sensitivity') {
            setSelectedSensitivities((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            );
        } else {
            setSelectedPreferences((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            );
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            let userId: string | number | null = storedUserId;
            if (!userId) {
                const me = await safeFetch(`${API_BASE}/auth/me`, {}, authHeaders);
                userId = me?.id ?? me?.user_id;
                if (userId) localStorage.setItem('user_id', String(userId));
            }
            if (!userId) throw new Error('User not found.');

            for (const prefId of selectedPreferences) {
                try {
                    await safeFetch(
                        `${API_BASE}/users/${userId}/preferences/${prefId}`,
                        { method: 'POST' },
                        authHeaders
                    );
                } catch (err) {
                    console.warn(`Preference ${prefId} mentése sikertelen:`, err);
                }
            }

            for (const sensId of selectedSensitivities) {
                try {
                    await safeFetch(
                        `${API_BASE}/users/${userId}/sensitivities/${sensId}`,
                        { method: 'POST' },
                        authHeaders
                    );
                } catch (err) {
                    console.warn(`Sensitivity ${sensId} mentése sikertelen:`, err);
                }
            }

            setMessage('Preferences and sensitivities saved successfully!');
            setTimeout(() => {
                router.push('/');
            }, 800);
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    return {
        loading,
        saving,
        message,
        sensitivities,
        preferences,
        selectedSensitivities,
        selectedPreferences,
        toggleSelection,
        handleSave,
    };
}