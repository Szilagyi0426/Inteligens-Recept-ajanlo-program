"use client";

import { useEffect, useState } from "react";

export type User = {
    id: number;
    username: string;
    email: string;
    role_id: number; 
};

export const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

// Modul szintű debug: token a modul betöltésekor (csak kliens oldalon)
if (typeof window !== "undefined") {
    console.log("Token at module load:", localStorage.getItem("token"));
}

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem("token");
    } catch {
        return null;
    }
}

export function useAdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Teszt célú currentUser, később backendből jön
    const currentUser = { role_id: 2 }; 

    useEffect(() => {
        const fetchUsers = async () => {
            const token = getToken();
            console.log("Token fetched from localStorage (hook):", token); 

            if (!token) {
                setError("Not authenticated");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`${API_BASE}/users/users/`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) {
                    throw new Error(`Failed to load users. Status: ${res.status}`);
                }

                const data: User[] = await res.json();
                setUsers(data);
            } catch (err: any) {
                console.error(err);
                setError(err?.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Role dropdown kezelése
    const handleRoleChange = async (userId: number, newRole: number) => {
        try {
            const token = getToken();
            if (!token) return;

            const res = await fetch(`${API_BASE}/users/${userId}/role/`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role_id: newRole }),
            });

            if (!res.ok) throw new Error("Failed to update role");

            // Lokálisan frissítjük
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role_id: newRole } : u))
            );
        } catch (err) {
            console.error(err);
            alert("Role módosítás sikertelen");
        }
    };

    return { users, setUsers, loading, error, currentUser, handleRoleChange };
}
