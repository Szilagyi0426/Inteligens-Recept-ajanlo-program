// src/app/profile-page/profileData.ts
'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { API_BASE, cleanMessage, safeFetch } from './profileApi';

type ProfileState = {
    username: string;
    email: string;
    full_name: string;
    phone: string;
};

export function profileData(token: string) {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileState>({
        username: '',
        email: '',
        full_name: '',
        phone: '',
    });
    const [baselineEmail, setBaselineEmail] = useState('');
    const [currentPasswordForProfile, setCurrentPasswordForProfile] = useState('');
    const [userId, setUserId] = useState<string | number | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);

    const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const me = await safeFetch<any>(`${API_BASE}/auth/me`, {
                    headers: { ...authHeaders },
                    cache: 'no-store',
                });
                if (!cancelled) {
                    setProfile({
                        username: me?.username ?? me?.user_name ?? me?.name ?? '',
                        email: me?.email ?? '',
                        full_name: me?.full_name ?? me?.fullName ?? me?.name_full ?? '',
                        phone:
                            me?.phone ??
                            me?.phone_number ??
                            me?.phoneNumber ??
                            me?.tel ??
                            me?.telephone ??
                            '',
                    });
                    setBaselineEmail(me?.email ?? '');
                    setUserId(me?.id ?? me?.user_id ?? null);
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
    }, []);

    const saveProfile = async () => {
        setSavingProfile(true);
        try {
            if (!currentPasswordForProfile)
                throw new Error('Current password is required to update personal data.');
            await safeFetch(`${API_BASE}/auth/me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                    current_password: currentPasswordForProfile,
                    full_name: profile.full_name,
                    phone: profile.phone,
                }),
            });
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
            const me = await safeFetch<any>(`${API_BASE}/auth/me`, {
                headers: { ...authHeaders },
                cache: 'no-store',
            });
            setProfile({
                username: me?.username ?? me?.user_name ?? me?.name ?? '',
                email: me?.email ?? '',
                full_name: me?.full_name ?? me?.fullName ?? me?.name_full ?? '',
                phone:
                    me?.phone ??
                    me?.phone_number ??
                    me?.phoneNumber ??
                    me?.tel ??
                    me?.telephone ??
                    '',
            });
            setBaselineEmail(me?.email ?? '');
            toast.success('Profile saved successfully.');
            setCurrentPasswordForProfile('');
        } catch (e: any) {
            toast.error(cleanMessage(e?.message) || 'Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    return {
        loading,
        profile,
        setProfile,
        currentPasswordForProfile,
        setCurrentPasswordForProfile,
        userId,
        saveProfile,
        savingProfile,
    };
}