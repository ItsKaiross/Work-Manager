"use client";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
  setError("");
  setLoading(true);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  console.log("LOGIN DATA:", data);
  console.log("LOGIN ERROR:", error);

  setLoading(false);

  if (error) {
    setError(error.message);
    return;
  }

  router.push("/homepage");
}

  async function handleGoogleLogin(){
    window.location.href = `${API_URL}/auth/google/login`;
  }

  async function handleForgotPassword() {
    if (!email) return setError("Enter your email first, then click forgot password.")
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) setError(error.message);
    else setError("Check your inbox for a password reset link.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <main>
        {/* Login Box */}
        <div className="flex flex-col w-110 rounded-lg bg-gray-100 shadow-lg p-15">
          <h1 className="text-black self-center text-3xl font-bold">Log in</h1>
          {error && (
            <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
          )}
          <input className="bg-white shadow-md rounded-md px-4 py-1 mt-5"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          />
          <input className="bg-white shadow-md rounded-md px-4 py-1 mt-5" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required 
          />
          <button
          onClick={handleLogin}
          disabled={loading}
          className="flex w-full px-4 py-2 bg-gray-200 mt-5 justify-center rounded-lg text-black hover:bg-blue-500 hover:text-white transition duration-300">
            {loading? "Sign in..." : "Log in"}
          </button>
          <Link className="flex w-full justify-center mt-1 bottom-0 text-sm text-gray-400"
          href=""
          onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}
          >forgot password?</Link>
          
          <div className="flex items-center mt-5">
          <div className="flex-1 border-t border-gray-400"></div>
          <p className="text-sm mx-4 text-gray-400">or</p>
          <div className="flex-1 border-t border-gray-400"></div>
          </div>
          <div className="w-full self-center mt-5">
            <button
            onClick={handleGoogleLogin}
            className="flex w-full bg-gray-200 px-4 py-2 rounded-lg text-black hover:bg-blue-500 hover:text-white transition duration-300 justify-center">
              <img className="w-5 h-5 mr-5" src="/images/google.png" alt="" /> Continue with Google
            </button>
          </div>
          <div className="flex w-full justify-center mt-2">
          <p>New user?</p><Link className="ml-2 text-blue-600" href="/signup">Sign up</Link>
          </div>
          
        </div>
      </main>
    </div>
  );
}
