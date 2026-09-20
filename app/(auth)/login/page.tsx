"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setLoading(false);
            setError(error.message);
            return;
        }

        // Hard reload (not router.push) — guarantees the session cookie set
        // by signInWithPassword is actually attached to the next request.
        // A client-side navigation risks reaching the server before the
        // cookie write has fully landed.
        window.location.href = "/";
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md bg-surface rounded-xl border border-outline-variant p-8">
                <h1 className="font-headline-lg text-headline-lg font-bold text-primary mb-2">
                    Al Awwal University
                </h1>
                <p className="font-body-sm text-body-sm text-secondary mb-6">
                    Log in to your account
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="font-label-md text-label-md text-on-surface block mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="you@aau.edu.ng"
                        />
                    </div>

                    <div>
                        <label className="font-label-md text-label-md text-on-surface block mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="font-body-sm text-body-sm text-error">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full bg-primary text-on-primary rounded-lg py-3 font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <p className="font-body-sm text-body-sm text-secondary mt-6 text-center">
                    Don&apos;t have an account?{" "}
                    <a href="/register" className="text-primary hover:underline">
                        Register
                    </a>
                </p>
            </div>
        </div>
    );
}