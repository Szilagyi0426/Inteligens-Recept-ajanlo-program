'use client';

import { preferencesLogic } from './components/preferencesLogic';

export default function ProfilePreferences() {
    const {
        loading,
        saving,
        message,
        sensitivities,
        preferences,
        selectedSensitivities,
        selectedPreferences,
        toggleSelection,
        handleSave,
    } = preferencesLogic();

    if (loading) {
        return (
            <main className="max-w-3xl mx-auto p-6">
                <p className="text-sm text-neutral-500">Loading preferences…</p>
            </main>
        );
    }

    return (
        <main className="max-w-3xl mx-auto p-6 space-y-6">
            {/* header */}
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Food profile</h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Select which foods to avoid (sensitivities) and what kind of meals you would like to avoid (preferences).
                </p>
            </header>

            {/* personal information section */}
            <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 backdrop-blur shadow p-5 md:p-6 space-y-4">
                <h2 className="text-lg font-medium">Personal information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="firstName"
                            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                        >
                            First name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            placeholder="John"
                            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                        >
                            Last name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            placeholder="Doe"
                            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label
                            htmlFor="phoneNumber"
                            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                        >
                            Phone number
                        </label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            placeholder="+36 30 123 4567"
                            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                        />
                    </div>
                </div>
            </section>

            {/* sensitivities card */}
            <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 backdrop-blur shadow">
                <div className="p-5 md:p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <h2 className="text-lg font-medium">Food sensitivities</h2>
                            <p className="text-sm text-neutral-500">
                                Mark the sensitives tht you have, so we can recommend recipes based on it.
                            </p>
                        </div>
                    </div>

                    {sensitivities.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {sensitivities.map((opt) => {
                                const active = selectedSensitivities.includes(opt.id);
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => toggleSelection(opt.id, 'sensitivity')}
                                        className={`px-3 py-1.5 rounded-full border text-sm transition inline-flex items-center gap-1.5 ${
                                            active
                                                ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-50 shadow-sm'
                                                : 'border-neutral-200 bg-white/40 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/30 dark:text-neutral-200'
                                        }`}
                                    >
                                        {active && (
                                            <span
                                                aria-hidden
                                                className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"
                                            />
                                        )}
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-400">No sensitivities found.</p>
                    )}
                </div>
            </section>

            {/* preferences card */}
            <section className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 backdrop-blur shadow">
                <div className="p-5 md:p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <h2 className="text-lg font-medium">Meal preferences</h2>
                            <p className="text-sm text-neutral-500">
                                Here you can select your preferred dietary.
                            </p>
                        </div>
                    </div>

                    {preferences.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {preferences.map((opt) => {
                                const active = selectedPreferences.includes(opt.id);
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => toggleSelection(opt.id, 'preference')}
                                        className={`px-3 py-1.5 rounded-full border text-sm transition inline-flex items-center gap-1.5 ${
                                            active
                                                ? 'border-sky-400 bg-sky-50 text-sky-800 dark:border-sky-900/50 dark:bg-sky-900/30 dark:text-sky-50 shadow-sm'
                                                : 'border-neutral-200 bg-white/40 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/30 dark:text-neutral-200'
                                        }`}
                                    >
                                        {active && (
                                            <span
                                                aria-hidden
                                                className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500"
                                            />
                                        )}
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-400">No preferences found.</p>
                    )}
                </div>
            </section>

            {/* actions */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700 disabled:opacity-60"
                >
                    {saving ? 'Saving…' : 'Save preferences'}
                </button>
                {message && <p className="text-sm text-neutral-500">{message}</p>}
            </div>
        </main>
    );
}