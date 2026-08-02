"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setAuthToken } from "@/lib/auth";

export default function OAuthCallback() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get("access_token");

    if (token) {
      setAuthToken(token);
      router.push("/homepage");
    } else {
      setError("Google sign-in failed. Please try again.");
      setTimeout(() => router.push("/"), 2000);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">
        {error || "Signing you in..."}
      </p>
    </div>
  );
}