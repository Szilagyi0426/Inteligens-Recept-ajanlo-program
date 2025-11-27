'use client';

import { useMemo } from 'react';
import { profileData } from './profileData';
import { profilePassword } from './profilePassword';
import { profilePreferences } from './profilePreferences';

export function profilePageLogic() {
    // token kinyerés egy helyen
    const token = useMemo(() => {
        try {
            return localStorage.getItem('token') || '';
        } catch {
            return '';
        }
    }, []);

    // 1) alapadatok
    const {
        loading,
        profile,
        setProfile,
        currentPasswordForProfile,
        setCurrentPasswordForProfile,
        userId,
        saveProfile,
        savingProfile,
    } = profileData(token);

    // 2) jelszó
    const {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        changePassword,
        savingPassword,
    } = profilePassword(token);

    // 3) preferenciák
    const {
        dietOptions,
        sensitivityOptions,
        prefs,
        activateDiet,
        activateSensitivity,
    } = profilePreferences(token, userId);

    return {
        // load state
        loading,

        // profile
        profile,
        setProfile,
        currentPasswordForProfile,
        setCurrentPasswordForProfile,
        saveProfile,
        savingProfile,

        // password
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        changePassword,
        savingPassword,

        // prefs
        dietOptions,
        sensitivityOptions,
        prefs,
        activateDiet,
        activateSensitivity,
    };
}