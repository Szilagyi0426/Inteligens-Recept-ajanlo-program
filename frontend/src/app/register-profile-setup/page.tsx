'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type OptionItem = {
  id: string | number;
  label: string;
};

export default function ProfilePreferences() {
  const router = useRouter();
  const [sensitivities, setSensitivities] = useState<OptionItem[]>([]);
  const [preferences, setPreferences] = useState<OptionItem[]>([]);
  const [selectedSensitivities, setSelectedSensitivities] = useState<Array<string | number>>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<Array<string | number>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);		
  const [message, setMessage] = useState('');

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000/api/v1';

  // Token és user_id
  let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

  let authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Biztonságos fetch
  const safeFetch = async (url: string, init?: RequestInit) => {
    const res = await fetch(url, {
      ...init,
      headers: { ...(init?.headers || {}), ...authHeaders },
      credentials: 'include',
    });
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
    return res.json();
  };

  const normalizeOptions = (input: any): OptionItem[] => {
    if (!input) return [];
    if (Array.isArray(input) && typeof input[0] === 'string') {
      return input.map(x => ({ id: x, label: x }));
    }
    const arr = Array.isArray(input) ? input : input.results ?? input.data ?? input.items ?? [];
    return arr
      .map((x: any) => {
        if (!x) return null;
        const id = x.id ?? x.value ?? x.key ?? x.slug ?? x.code ?? x.name;
        const label = x.label ?? x.name ?? x.title ?? x.value ?? x.slug ?? x.code ?? x.id;
        if (id == null || label == null) return null;
        return { id, label: String(label) };
      })
      .filter(Boolean) as OptionItem[];
  };

  // Betöltés
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ha nincs token, de van storedUserId, próbáljunk automatikus login-t
        if (!token && storedUserId) {
          try {
            const loginResponse = await fetch(`${API_BASE}/auth/login/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: storedUserId }), // Backendhez igazítani
            }).then(res => res.json());

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

        // Opciók betöltése
        let sensDataRaw;
        try {
          sensDataRaw = await safeFetch(`${API_BASE}/sensitivities/`);
        } catch {
          sensDataRaw = await safeFetch(`${API_BASE}/sensivity`);
        }
        const prefDataRaw = await safeFetch(`${API_BASE}/preferences/`);
        setSensitivities(normalizeOptions(sensDataRaw));
        setPreferences(normalizeOptions(prefDataRaw));

        // Felhasználó kiválasztásai
        let userId: string | number | null = storedUserId;
        if (!userId && token) {
          const me = await safeFetch(`${API_BASE}/auth/me`);
          userId = me?.id ?? me?.user_id;
          if (userId) localStorage.setItem('user_id', String(userId));
        }

        if (!userId) {
          console.warn('No user info available, preferences cannot be loaded.');
        } else {
          try {
            const userPrefs = await safeFetch(`${API_BASE}/users/${userId}/preferences/`);
            const userSens = await safeFetch(`${API_BASE}/users/${userId}/sensitivities/`);
            setSelectedPreferences(userPrefs ?? []);
            setSelectedSensitivities(userSens ?? []);
          } catch (err) {
            console.warn('Could not load user-specific selections');
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) console.error('Error loading data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE, storedUserId, router]);

  const toggleSelection = (id: string | number, type: 'sensitivity' | 'preference') => {
    if (type === 'sensitivity') {
      setSelectedSensitivities(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } else {
      setSelectedPreferences(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      let userId: string | number | null = storedUserId;
      if (!userId) {
        const me = await safeFetch(`${API_BASE}/auth/me`);
        userId = me?.id ?? me?.user_id;
        if (userId) localStorage.setItem('user_id', String(userId));
      }
      if (!userId) throw new Error('User not found.');

      for (const prefId of selectedPreferences) {
        try {
          await safeFetch(`${API_BASE}/users/${userId}/preferences/${prefId}`, {
            method: 'POST',
          });
        } catch (err) {
          console.warn(`Preference ${prefId} mentése sikertelen:`, err);
        }
      }

      for (const sensId of selectedSensitivities) {
        try {
          await safeFetch(`${API_BASE}/users/${userId}/sensitivities/${sensId}`, {
            method: 'POST',
          });
        } catch (err) {
          console.warn(`Sensitivity ${sensId} mentése sikertelen:`, err);
        }
      }

      setMessage('✅ Preferences and sensitivities saved successfully!');

      setTimeout(() => {
        router.push('/');
      }, 800);
    } catch (err: unknown) {
      if (err instanceof Error) setMessage(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading preferences...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
      <p className="text-center text-gray-600 mb-4">
        Here you can select your food sensitivities and meal preferences.
      </p>

      <section className="w-full max-w-md rounded border p-4">
        <h2 className="text-lg font-medium mb-2 text-center">Food Sensitivities</h2>
        {sensitivities.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {sensitivities.map(opt => {
              const active = selectedSensitivities.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleSelection(opt.id, 'sensitivity')}
                  className={`px-3 py-1.5 rounded-full border text-sm transition inline-flex items-center gap-1.5 ${
                    active
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                      : 'border-neutral-300 bg-white text-neutral-700'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">No sensitivities found.</p>
        )}
      </section>

      <section className="w-full max-w-md rounded border p-4">
        <h2 className="text-lg font-medium mb-2 text-center">Meal Preferences</h2>
        {preferences.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {preferences.map(opt => {
              const active = selectedPreferences.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleSelection(opt.id, 'preference')}
                  className={`px-3 py-1.5 rounded-full border text-sm transition inline-flex items-center gap-1.5 ${
                    active
                      ? 'border-blue-400 bg-blue-50 text-blue-800'
                      : 'border-neutral-300 bg-white text-neutral-700'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">No preferences found.</p>
        )}
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
      {message && <p className="text-center mt-2">{message}</p>}
    </div>
  );
}
