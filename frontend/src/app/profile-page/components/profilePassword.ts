// src/app/profile-page/profilePassword.ts
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { API_BASE, cleanMessage, safeFetch } from './profileApi';

export function profilePassword(token: string) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    const changePassword = async () => {
        setSavingPassword(true);
        try {
            if (!currentPassword) throw new Error('Current password is required.');
            if (newPassword.length < 8)
                throw new Error('New password must be at least 8 characters.');
            if (newPassword !== confirmPassword)
                throw new Error('New passwords do not match.');

            await safeFetch(`${API_BASE}/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
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

    return {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        changePassword,
        savingPassword,
    };
}