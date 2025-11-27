'use client';

import {
    profilePageLogic,
} from './components/logic';

export default function ProfileDataPage() {
    const {
        loading,
        savingProfile,
        savingPassword,
        profile,
        setProfile,
        currentPasswordForProfile,
        setCurrentPasswordForProfile,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        dietOptions,
        sensitivityOptions,
        prefs,
        saveProfile,
        changePassword,
        activateDiet,
        activateSensitivity,
    } = profilePageLogic();

    return (
        <main className="max-w-3xl mx-auto p-6 space-y-6">
            <header className="space-y-1 anim-fade-in">
                <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Manage your profile, password and dietary preferences.
                </p>
            </header>

            {/* PROFILE */}
            <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 backdrop-blur shadow anim-pop">
                <div className="p-5 md:p-6 space-y-4">
                    <h2 className="text-lg font-medium">Personal information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Username</label>
                            <input
                                value={profile.username}
                                readOnly
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100/70 dark:bg-neutral-800/60 px-3 py-2 text-sm"
                            />
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
                            <label className="block text-sm mb-1">
                                Current password (required to save personal info)
                            </label>
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

            {/* PREFERENCES */}
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