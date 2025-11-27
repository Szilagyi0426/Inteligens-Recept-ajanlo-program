"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [tokenMissing, setTokenMissing] = useState(false);

    useEffect(() => {
        if (!token) {
            setTokenMissing(true);
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast.error("Missing token. Please open the link from your email.");
            return;
        }
        if (!password || !passwordAgain) {
            toast.error("Please fill in both password fields.");
            return;
        }
        if (password !== passwordAgain) {
            toast.error("The two passwords do not match.");
            return;
        }
        if (password.length < 6) {
            toast.error("The password must be at least 6 characters long.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("http://localhost:8000/api/v1/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // backend: { token, new_password }
                body: JSON.stringify({
                    token,
                    new_password: password,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                const msg = data?.detail || "Password reset failed.";
                toast.error(msg);
            } else {
                toast.success("Your password has been updated. You can now log in.");
                // ha van külön login oldalad:
                router.push("/login-page");
            }
        } catch (err) {
            console.error(err);
            toast.error("A network error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
            <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-6">
                <header className="space-y-1 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reset password</h1>
                    <p className="text-sm text-slate-500">
                        Enter your new password.
                    </p>
                </header>

                {tokenMissing ? (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm">
                        Token not found in the URL. Please open the link directly from your email.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="password">
                                New password
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="passwordAgain">
                                Confirm new password
                            </label>
                            <input
                                id="passwordAgain"
                                type="password"
                                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                value={passwordAgain}
                                onChange={(e) => setPasswordAgain(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                            {submitting ? "Saving..." : "Set new password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}