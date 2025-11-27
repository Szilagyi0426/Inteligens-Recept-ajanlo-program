'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    API_BASE,
    cleanMessage,
    normalizeOptions,
    OptionItem,
    safeFetch,
} from './profileApi';

type PrefState = {
    diets: Array<string | number>;
    sensitivities: Array<string | number>;
};

export function profilePreferences(token: string, userId: string | number | null) {
    const [dietOptions, setDietOptions] = useState<OptionItem[]>([]);
    const [sensitivityOptions, setSensitivityOptions] = useState<OptionItem[]>([]);
    const [prefs, setPrefs] = useState<PrefState>({ diets: [], sensitivities: [] });

    const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    // betöltés
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!userId) return;
            try {
                const dietsResp = await safeFetch(`${API_BASE}/preferences/`, {
                    headers: { ...authHeaders },
                    cache: 'no-store',
                });
                const sensResp = await safeFetch(`${API_BASE}/sensitivities/`, {
                    headers: { ...authHeaders },
                    cache: 'no-store',
                });

                const diets = normalizeOptions(dietsResp);
                const sens = normalizeOptions(sensResp);

                // user aktuális
                let prefIds: string[] = [];
                let sensIds: string[] = [];
                try {
                    const uprefs = await safeFetch(`${API_BASE}/users/${userId}/preferences/`, {
                        headers: { ...authHeaders },
                        cache: 'no-store',
                    });
                    const usens = await safeFetch(`${API_BASE}/users/${userId}/sensitivities/`, {
                        headers: { ...authHeaders },
                        cache: 'no-store',
                    });

                    const nameToId = (arr: OptionItem[], name: string) => {
                        const m = arr.find(
                            (o) =>
                                String(o.label).toLowerCase() === String(name).toLowerCase() ||
                                String(o.id) === String(name)
                        );
                        return m ? String(m.id) : String(name);
                    };

                    prefIds = Array.isArray(uprefs)
                        ? uprefs.map((n: any) => nameToId(diets, String(n)))
                        : [];
                    sensIds = Array.isArray(usens)
                        ? usens.map((n: any) => nameToId(sens, String(n)))
                        : [];
                } catch {
                    // ha nem sikerül, marad üres
                }

                if (!cancelled) {
                    setDietOptions(diets.length ? diets : [{ id: 'none', label: 'none' }]);
                    setSensitivityOptions(sens);
                    setPrefs({ diets: prefIds, sensitivities: sensIds });
                }
            } catch (e) {
                if (!cancelled) {
                    setDietOptions((prev) => (prev.length ? prev : [{ id: 'none', label: 'none' }]));
                    setSensitivityOptions((prev) => (prev.length ? prev : []));
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [userId]);

    const activateDiet = async (option: OptionItem) => {
        if (!userId) return toast.error('Missing user id to update preference.');
        const isActive = prefs.diets.map(String).includes(String(option.id));
        try {
            const url = `${API_BASE}/users/${userId}/preferences/${option.id}`;
            await safeFetch(url, {
                method: isActive ? 'DELETE' : 'POST',
                headers: { ...authHeaders },
            });
            setPrefs((p) => {
                const idStr = String(option.id);
                const next = p.diets.map(String);
                return {
                    ...p,
                    diets: isActive ? next.filter((id) => id !== idStr) : [...new Set([...next, idStr])],
                };
            });
            toast.success(
                isActive ? `Removed preference: ${option.label}` : `Added preference: ${option.label}`
            );
        } catch (e: any) {
            toast.error(cleanMessage(e?.message) || 'Failed to update preference');
        }
    };

    const activateSensitivity = async (option: OptionItem) => {
        if (!userId) return toast.error('Missing user id to update sensitivity.');
        const isActive = prefs.sensitivities.map(String).includes(String(option.id));
        try {
            await safeFetch(`${API_BASE}/users/${userId}/sensitivities/${option.id}`, {
                method: isActive ? 'DELETE' : 'POST',
                headers: { ...authHeaders },
            });
            setPrefs((p) => {
                const idStr = String(option.id);
                const next = p.sensitivities.map(String);
                return {
                    ...p,
                    sensitivities: isActive
                        ? next.filter((id) => id !== idStr)
                        : [...new Set([...next, idStr])],
                };
            });
            toast.success(
                isActive ? `Removed sensitivity: ${option.label}` : `Added sensitivity: ${option.label}`
            );
        } catch (e: any) {
            toast.error(cleanMessage(e?.message) || 'Failed to update sensitivity');
        }
    };

    return {
        dietOptions,
        sensitivityOptions,
        prefs,
        activateDiet,
        activateSensitivity,
    };
}