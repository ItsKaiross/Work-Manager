"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SignUpPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
        email,
        password,
    });

    setLoading(false);

    if (error) {
        setMessage(error.message);
        return;
    }

    setMessage("Account created! Check your email to verify your account.");
    router.push("/");
    }

    return (
    <main className="flex min-h-screen items-center justify-center">
        <form
        onSubmit={handleSignUp}
        className="flex flex-col w-110 rounded-lg bg-gray-100 shadow-lg p-15"
        >
        <h1 className="text-2xl font-bold self-center">Create Account</h1>

        <input
            type="email"
            placeholder="Email"
            className="bg-white shadow-md rounded-md px-4 py-1 mt-5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />

        <input
            type="password"
            placeholder="Password"
            className="bg-white shadow-md rounded-md px-4 py-1 mt-5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
        />

        <button
            type="submit"
            disabled={loading}
            className="flex w-full px-4 py-2 bg-blue-400 mt-5 justify-center rounded-lg text-black hover:bg-blue-500 hover:text-white transition duration-300"
        >
            {loading ? "Creating account..." : "Sign Up"}
        </button>

        {message && (
            <p className="text-center text-sm text-red-600">{message}</p>
        )}
        <Link
        href="/"
        className="text-sm text-gray-600 hover:text-gray-900 hover:underline mt-2 self-center"
        >
        ← Back to Login
        </Link>
        </form>
    </main>
    );
}