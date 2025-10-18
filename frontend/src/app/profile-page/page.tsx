'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000/api/v1';

const cleanMessage = (s?: string | null) => (s ?? '').replace(/^"|"$/g, '').trim();
type OptionItem = { id: string | number; label: string };

export default function ProfileDataPage() {
    // Állapotok: betöltés/mentés és üzenetek
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    
    // Auth token kiolvasása (localStorage)
    const token = useMemo(() => {
        try {
            return localStorage.getItem('token') || '';
        } catch {
            return '';
        }
    }, []);

    // Profil adatok (megjelenítéshez és szerkesztéshez)
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        full_name: '',
        phone: '',
    });
    const [baselineEmail, setBaselineEmail] = useState('');
    const [currentPasswordForProfile, setCurrentPasswordForProfile] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Választható opciók listák (ID + címke)
    const [dietOptions, setDietOptions] = useState<OptionItem[]>([]);
    const [sensitivityOptions, setSensitivityOptions] = useState<OptionItem[]>([]);
    
    const [prefs, setPrefs] = useState<{ diets: Array<string | number>; sensitivities: Array<string | number> }>({
        diets: [],
        sensitivities: [],
    });

    const [userId, setUserId] = useState<string | number | null>(null);

    const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    // fetch wrapper: hibakezelés + JSON parse
    const safeFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const res = await fetch(input, init);
        if (!res.ok) {
            let text = '';
            try {
                const j = await res.json();
                text = j?.detail ? JSON.stringify(j.detail) : JSON.stringify(j);
            } catch {
                text = await res.text();
            }
            throw new Error(text || `HTTP ${res.status}`);
        }
        try {
            return await res.json();
        } catch {
            return {} as any;
        }
    };

    // Opciók egységesítése [{id,label}] formára
    const normalizeOptions = (input: any): OptionItem[] => {
        if (!input) return [];
        const fromArray = (arr: any[]) =>
            arr
                .map((x) => {
                    if (x == null) return null;
                    if (typeof x === 'string') return { id: x, label: x } as OptionItem;
                    if (typeof x === 'number') return { id: x, label: String(x) } as OptionItem;
                    const id = x.id ?? x.value ?? x.key ?? x.slug ?? x.code ?? x.name;
                    const label = x.label ?? x.name ?? x.title ?? x.value ?? x.slug ?? x.code ?? x.id;
                    if (id == null || label == null) return null;
                    return { id, label: String(label) } as OptionItem;
                })
                .filter(Boolean) as OptionItem[];

        if (Array.isArray(input)) return fromArray(input);
        const arr = input.items || input.data || input.results || input.values || input.options || input;
        if (Array.isArray(arr)) return fromArray(arr);
        return [];
    };

    // Adatok betöltése oldalmegnyitáskor
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                // Saját profil lekérése
                const me = await safeFetch(`${API_BASE}/auth/me`, {
                    headers: { ...authHeaders },
                    cache: 'no-store',
                });
                if (!cancelled) {
                    setProfile({
                        username: me?.username ?? me?.user_name ?? me?.name ?? '',
                        email: me?.email ?? '',
                        full_name: me?.full_name ?? me?.fullName ?? me?.name_full ?? '',
                        phone: me?.phone ?? me?.phone_number ?? me?.phoneNumber ?? me?.tel ?? me?.telephone ?? '',
                    });
                    setBaselineEmail(me?.email ?? '');
                    setUserId(me?.id ?? me?.user_id ?? null);
                }

                // Preferenciák/érzékenységek listáinak lekérése
                try {
                    // According to your logs, trailing slash on /preferences/ returns 200
                    const dietsResp = await safeFetch(`${API_BASE}/preferences/`, { headers: { ...authHeaders }, cache: 'no-store' });
                    const sensResp = await safeFetch(`${API_BASE}/sensitivities/`, { headers: { ...authHeaders }, cache: 'no-store' });
                    
                    const diets = normalizeOptions(dietsResp);
                    const sens = normalizeOptions(sensResp);

                    // 2/a) Saját kiválasztások lekérése és név->ID illesztés (előválasztás)
                    let prefIds: string[] = [];
                    let sensIds: string[] = [];
                    try {
                        const uprefs = await safeFetch(`${API_BASE}/auth/me/preferences`, { headers: { ...authHeaders }, cache: 'no-store' });
                        const usens  = await safeFetch(`${API_BASE}/auth/me/sensitivities`, { headers: { ...authHeaders }, cache: 'no-store' });
                        const nameToId = (arr: OptionItem[], name: string) => {
                            const m = arr.find(o => String(o.label).toLowerCase() === String(name).toLowerCase() || String(o.id) === String(name));
                            return m ? String(m.id) : String(name);
                        };
                        prefIds = Array.isArray(uprefs) ? uprefs.map((n: any) => nameToId(diets, String(n))) : [];
                        sensIds = Array.isArray(usens)  ? usens.map((n: any) => nameToId(sens,  String(n))) : [];
                    } catch {}

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

            } catch (e: any) {
                if (!cancelled) toast.error(cleanMessage(e?.message) || 'Failed to load user data');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [API_BASE]);

    // Profil mentése (név/telefon + email) – jelszó kötelező
    const saveProfile = async () => {
        setSavingProfile(true);
        try {
            if (!currentPasswordForProfile) throw new Error('Current password is required to update personal data.');
            // Név/telefon frissítése
            await safeFetch(`${API_BASE}/auth/me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                    current_password: currentPasswordForProfile,
                    full_name: profile.full_name,
                    phone: profile.phone,
                }),
            });
            // Email frissítése (ha változott)
            if (profile.email && profile.email !== baselineEmail) {
                await safeFetch(`${API_BASE}/auth/email-change`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...authHeaders },
                    body: JSON.stringify({
                        current_password: currentPasswordForProfile,
                        new_email: profile.email,
                    }),
                });
                setBaselineEmail(profile.email);
            }
            // Friss lekérés a /auth/me-ről, hogy a UI naprakész legyen
            try {
                const me = await safeFetch(`${API_BASE}/auth/me`, { headers: { ...authHeaders }, cache: 'no-store' });
                setProfile({
                    username: me?.username ?? me?.user_name ?? me?.name ?? '',
                    email: me?.email ?? '',
                    full_name: me?.full_name ?? me?.fullName ?? me?.name_full ?? '',
                    phone: me?.phone ?? me?.phone_number ?? me?.phoneNumber ?? me?.tel ?? me?.telephone ?? '',
                });
                setBaselineEmail(me?.email ?? '');
            } catch {}
            toast.success('Profile saved successfully.');
            setCurrentPasswordForProfile('');
        } catch (e: any) {
            toast.error(cleanMessage(e?.message) || 'Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    // Jelszó megváltoztatása (min. 8 karakter, egyező megerősítés)
    const changePassword = async () => {
        setSavingPassword(true);
        try {
            if (!currentPassword) throw new Error('Current password is required.');
            if (newPassword.length < 8) throw new Error('New password must be at least 8 characters.');
            if (newPassword !== confirmPassword) throw new Error('New passwords do not match.');
            await safeFetch(`${API_BASE}/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
            });
            toast.success('Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (e: any) {
            toast.error(cleanMessage(e?.message) || 'Failed to change password');
        } finally {
            setSavingPassword(false);
        }
    };

    // Preferencia be/ki kapcsolása (POST/DELETE)
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
            toast.success(isActive ? `Removed preference: ${option.label}` : `Added preference: ${option.label}`);
        } catch (e: any) {
            toast.error(cleanMessage(e?.message) || 'Failed to update preference');
        }
    };

    // Érzékenység be/ki kapcsolása (POST/DELETE)
    const activateSensitivity = async (option: OptionItem) => {
        if (!userId) return toast.error('Missing user id to update sensitivity.');
        const isActive = prefs.sensitivities.map(String).includes(String(option.id));
        try {
            await safeFetch(`${API_BASE}/users/${userId}/sensitivities/${option.id}`, { method: isActive ? 'DELETE' : 'POST', headers: { ...authHeaders } });

            setPrefs((p) => {
                const idStr = String(option.id);
                const next = p.sensitivities.map(String);
                return {
                    ...p,
                    sensitivities: isActive ? next.filter((id) => id !== idStr) : [...new Set([...next, idStr])],
                };
            });
            toast.success(isActive ? `Removed sensitivity: ${option.label}` : `Added sensitivity: ${option.label}`);
        } catch (e: any) {
            toast.error(cleanMessage(e?.message) || 'Failed to update sensitivity');
        }
    };

    // UI render: profil, jelszó, és többválasztós kapcsolók
    return (
        <main className="max-w-3xl mx-auto p-6 space-y-6">
            <header className="space-y-1 anim-fade-in">
                <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">Manage your profile, password and dietary preferences.</p>
            </header>



            {/* PROFILE */}
            <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 backdrop-blur shadow anim-pop">
                <div className="p-5 md:p-6 space-y-4">
                    <h2 className="text-lg font-medium">Personal information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Username</label>
                            <input value={profile.username} readOnly className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100/70 dark:bg-neutral-800/60 px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Email</label>
                            <input
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 text-sm"
                                value={profile.email}
                                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                                type="email"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Full name</label>
                            <input
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 text-sm"
                                value={profile.full_name}
                                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                                placeholder="Jane Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Phone</label>
                            <input
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 text-sm"
                                value={profile.phone}
                                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                                placeholder="+36 30 123 4567"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Current password (required to save personal info)</label>
                            <input
                                type="password"
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 text-sm"
                                value={currentPasswordForProfile}
                                onChange={(e) => setCurrentPasswordForProfile(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            disabled={savingProfile || loading}
                            onClick={saveProfile}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700 disabled:opacity-60 btn-shimmer"
                        >
                            {savingProfile ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </div>
            </section>

            {/* PASSWORD */}
            <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 backdrop-blur shadow anim-pop">
                <div className="p-5 md:p-6 space-y-4">
                    <h2 className="text-lg font-medium">Change password</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Current password</label>
                            <input
                                type="password"
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 text-sm"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">New password</label>
                            <input
                                type="password"
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 text-sm"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 8 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Confirm new password</label>
                            <input
                                type="password"
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 text-sm"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat new password"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            disabled={savingPassword || loading}
                            onClick={changePassword}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700 disabled:opacity-60 btn-shimmer"
                        >
                            {savingPassword ? 'Changing…' : 'Change password'}
                        </button>
                    </div>
                </div>
            </section>

            {/* PREFERENCES (Multi-select lists) */}
            <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 backdrop-blur shadow anim-pop">
                <div className="p-5 md:p-6 space-y-4">
                    <h2 className="text-lg font-medium">Preferences & sensitivities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-2">All preferences</label>
                            <div className="flex flex-wrap gap-2">
                                {dietOptions.map((opt) => {
                                    const idStr = String(opt.id);
                                    const active = prefs.diets.map(String).includes(idStr);
                                    return (
                                        <button
                                            key={idStr}
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() => activateDiet(opt)}
                                            className={`px-3 py-1.5 rounded-full border text-sm transition inline-flex items-center gap-1.5 ${
                                                active
                                                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-100 shadow-sm'
                                                    : 'border-neutral-300 bg-white/70 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200'
                                            }`}
                                        >
                                            {active && (
                                                <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            )}
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm mb-2">All sensitivities</label>
                            <div className="flex flex-wrap gap-2">
                                {sensitivityOptions.map((opt) => {
                                    const idStr = String(opt.id);
                                    const active = prefs.sensitivities.map(String).includes(idStr);
                                    return (
                                        <button
                                            key={idStr}
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() => activateSensitivity(opt)}
                                            className={`px-3 py-1.5 rounded-full border text-sm transition inline-flex items-center gap-1.5 ${
                                                active
                                                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-100 shadow-sm'
                                                    : 'border-neutral-300 bg-white/70 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200'
                                            }`}
                                        >
                                            {active && (
                                                <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            )}
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {loading && <p className="text-sm text-neutral-500">Loading your data…</p>}
        </main>
    );
}