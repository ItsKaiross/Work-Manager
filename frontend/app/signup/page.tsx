"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/api";
import { setAuthToken } from "@/lib/auth";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup() {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const data = await signup(email.trim(), password);
      setAuthToken(data.access_token);
      router.push("/homepage");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <main>
        <div className="flex flex-col w-110 rounded-lg bg-gray-100 shadow-lg p-15">
          <h1 className="text-black self-center text-3xl font-bold">Sign up</h1>
          {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}

          <input
            className="bg-white shadow-md rounded-md px-4 py-1 mt-5"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            className="bg-white shadow-md rounded-md px-4 py-1 mt-5"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <input
            className="bg-white shadow-md rounded-md px-4 py-1 mt-5"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
          />

          <button
            onClick={handleSignup}
            disabled={loading}
            className="flex w-full px-4 py-2 bg-gray-200 mt-5 justify-center rounded-lg text-black hover:bg-blue-500 hover:text-white transition duration-300"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <div className="flex w-full justify-center mt-2">
            <p>Already have an account?</p>
            <Link className="ml-2 text-blue-600" href="/">Log in</Link>
          </div>
        </div>
      </main>
    </div>
  );
}