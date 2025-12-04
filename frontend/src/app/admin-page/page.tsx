'use client';
import { useState, useMemo } from "react";
import { useAdminUsers, User, getToken, API_BASE } from "./components/adminFunctions";
import { FaTrash } from "react-icons/fa";

export default function AdminPage() {
    const { users, setUsers, loading, error } = useAdminUsers();
    const [search, setSearch] = useState("");
    const [searchBy, setSearchBy] = useState<"id" | "username" | "role">("id");

    const currentUser = { role_id: 2 };


    const filteredUsers: User[] = useMemo(() => {
        if (!search) return users;
        const lower = search.toLowerCase();
        return users.filter((u) => {
            if (searchBy === "id") return u.id.toString().includes(lower);
            if (searchBy === "username") return u.username.toLowerCase().includes(lower);
            if (searchBy === "role") {
                const roleStr = u.role_id === 0 ? "user" : u.role_id === 1 ? "moderator" : "admin";
                return roleStr.includes(lower);
            }
            return false;
        });
    }, [search, searchBy, users]);

   
 

    const handleDeleteUser = async (userId: number) => {
        if (!confirm("Biztosan törölni szeretnéd a felhasználót?")) return;

        try {
            const token = getToken();
            if (!token) return;

            const res = await fetch(`${API_BASE}/users/users/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to delete user");

            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error(err);
            alert("Felhasználó törlése sikertelen");
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 py-10">
            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
                <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">Admin felület</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Felhasználók listázása, szerepkörök módosítása és törlés.
                        </p>
                    </div>
                </header>

                    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="w-full sm:max-w-md">
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Keresés
                                </label>
                                <input
                                    type="text"
                                    placeholder={
                                        searchBy === "id"
                                            ? "Keresés ID alapján..."
                                            : searchBy === "username"
                                                ? "Keresés felhasználónév alapján..."
                                                : "Keresés szerepkör alapján..."
                                    }
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
                                />
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                                {(["id", "username", "role"] as const).map((r) => (
                                    <label
                                        key={r}
                                        className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 shadow-sm"
                                    >
                                        <input
                                            type="radio"
                                            name="searchBy"
                                            value={r}
                                            checked={searchBy === r}
                                            onChange={() => setSearchBy(r)}
                                            className="accent-green-500"
                                        />
                                        <span className="capitalize">
                                            {r === "id"
                                                ? "ID"
                                                : r === "username"
                                                    ? "Felhasználónév"
                                                    : "Szerepkör"}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 text-sm">
                            {loading && (
                                <p className="text-gray-500">Felhasználók betöltése...</p>
                            )}
                            {error && <p className="font-medium text-red-600">{error}</p>}
                            {!loading && !error && filteredUsers.length === 0 && (
                                <p className="text-gray-500">Nem található felhasználó.</p>
                            )}
                        </div>

                        {!loading && !error && filteredUsers.length > 0 && (
                            <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
                                <div className="max-h-[32rem] overflow-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="sticky top-0 z-10 bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold text-gray-700">ID</th>
                                                <th className="px-4 py-2 font-semibold text-gray-700">
                                                    Felhasználónév
                                                </th>
                                                <th className="px-4 py-2 font-semibold text-gray-700">Email</th>
                                                <th className="px-4 py-2 font-semibold text-gray-700">
                                                    Szerepkör
                                                </th>
                                                <th className="px-4 py-2 text-center font-semibold text-gray-700">
                                                    Törlés
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredUsers.map((user) => (
                                                <tr
                                                    key={user.id}
                                                    className="bg-white transition hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-2 text-gray-800">{user.id}</td>
                                                    <td className="px-4 py-2 text-gray-800">
                                                        {user.username}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-700">{user.email}</td>
                                                    <td className="px-4 py-2">
                                                        {currentUser.role_id === 2 ? (
                                                            <select
                                                                value={user.role_id}
                                                                onChange={(e) =>
                                                                    handleRoleChange(
                                                                        user.id,
                                                                        Number(e.target.value)
                                                                    )
                                                                }
                                                                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
                                                            >
                                                                <option value={0}>User</option>
                                                                <option value={1}>Moderator</option>
                                                                <option value={2}>Admin</option>
                                                            </select>
                                                        ) : user.role_id === 0 ? (
                                                            "User"
                                                        ) : user.role_id === 1 ? (
                                                            "Moderator"
                                                        ) : (
                                                            "Admin"
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        {currentUser.role_id === 2 && (
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="inline-flex items-center justify-center rounded-full p-2 text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                                                                aria-label="Felhasználó törlése"
                                                            >
                                                                <FaTrash className="text-base" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </section>
            </div>
        </main>
    );
}