"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: "student", // default role; admins are promoted manually via SQL
                },
            },
        });

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        router.push("/login?registered=true");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md bg-surface rounded-xl border border-outline-variant p-8">
                <h1 className="font-headline-lg text-headline-lg font-bold text-primary mb-2">
                    Al Awwal University
                </h1>
                <p className="font-body-sm text-body-sm text-secondary mb-6">
                    Create your account
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="font-label-md text-label-md text-on-surface block mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Awwal Bashir"
                        />
                    </div>

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
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="At least 6 characters"
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
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="font-body-sm text-body-sm text-secondary mt-6 text-center">
                    Already have an account?{" "}
                    <a href="/login" className="text-primary hover:underline">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
}