// Az API alap URL-je környezeti változóból vagy alapértelmezett helyi címről
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000/api/v1'; 


// Bejelentkezési függvény, amely POST kérést küld a /auth/login végpontra
export async function login(data: { username: string; password: string }) {
    const form = new URLSearchParams();
    form.set('username', data.username);
    form.set('password', data.password);

    const res = await fetch(`${API_BASE}/auth/login`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
    });
    if (!res.ok) { // Hibakezelés, ha a válasz nem sikeres
        let errText = '';
        try { // Próbálja meg JSON-ként értelmezni a választ
            const j = await res.json();
            errText = j?.detail ? JSON.stringify(j.detail) : JSON.stringify(j);
        } catch { // Ha JSON értelmezés sikertelen, olvassa szövegként
            errText = await res.text();
        }
        throw new Error(errText || `HTTP ${res.status}`); // Dobjon hibát a részletekkel vagy státuszkóddal
    }
    // Visszaadja a JSON választ, vagy egy üres objektumot, ha a válasz nem JSON
    return res.json().catch(() => ({}));
}


// Regisztrációs függvény, amely POST kérést küld a /auth/register végpontra
export async function register(data: { username: string; email: string; password: string }) {
    // A regisztrációs adatokat JSON formátumban küldi el
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    // Hibakezelés, ha a válasz nem sikeres
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json().catch(() => ({})); // Visszaadja a JSON választ, vagy egy üres objektumot, ha a válasz nem JSON
}