"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    function validatePassword(password: string) {
    if (password.length < 8) {
        return "Password must be at least 8 characters.";
    }

    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number.";
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return "Password must contain at least one special character.";
    }

    return "";
    }
    
    

    async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
    setMessage("Passwords do not match.");
    setLoading(false);
    return;
    }

    const validationError = validatePassword(password);

    if (validationError) {
        setMessage(validationError);
        setLoading(false);
        return;
    }

    const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
    },
    });

console.log("Data:", data);
console.log("Error:", error);

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
        
        <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="bg-white shadow-md rounded-md px-4 py-1 mt-5"
        required
        />

        <div className="mt-3 text-sm space-y-1">
        <Requirement
            valid={passwordChecks.length}
            text="At least 8 characters"
        />
        <Requirement
            valid={passwordChecks.uppercase}
            text="One uppercase letter"
        />
        <Requirement
            valid={passwordChecks.lowercase}
            text="One lowercase letter"
        />
        <Requirement
            valid={passwordChecks.number}
            text="One number"
        />
        <Requirement
            valid={passwordChecks.special}
            text="One special character"
        />
        </div>

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

    function Requirement({
    valid,
    text,
    }: {
    valid: boolean;
    text: string;
    }) {
    return (
        <div
        className={`flex items-center gap-2 ${
            valid ? "text-green-600" : "text-gray-500"
        }`}
        >
        <span>{valid ? "✔" : "✖"}</span>
        <span>{text}</span>
        </div>
    );
    }
}