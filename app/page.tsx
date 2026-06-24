"use client";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center">
      <main>
        {/* Login Box */}
        <div className="flex flex-col w-110 rounded-lg bg-gray-100 shadow-lg p-15">
          <h1 className="text-black self-center text-3xl">Log in</h1>
          <input className="bg-white shadow-md rounded-md px-4 py-1 mt-5"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="juandelacruz@gmail.com"
          required
          />
          <input className="bg-white shadow-md rounded-md px-4 py-1 mt-5" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          required 
          />
          <button className="flex w-full px-4 py-2 bg-gray-200 mt-5 justify-center rounded-lg text-black hover:bg-blue-500 hover:text-white transition duration-300">
            Log in
          </button>
          <Link className="flex w-full justify-center mt-1 bottom-0 text-sm text-gray-400" href={""}>forgot password?</Link>
          
          <div className="flex items-center mt-5">
          <div className="flex-1 border-t border-gray-400"></div>
          <p className="text-sm mx-4 text-gray-400">or</p>
          <div className="flex-1 border-t border-gray-400"></div>
          </div>
          <div className="w-full self-center mt-5">
            <button className="flex w-full bg-gray-200 px-4 py-2 rounded-lg text-black hover:bg-blue-500 hover:text-white transition duration-300 justify-center">
              <img className="w-5 h-5 mr-5" src="/images/google.png" alt="" /> Continue with Google
            </button>
          </div>
          <div className="flex w-full justify-center mt-2">
          <p>New user?</p><Link className="ml-2" href={""}>Sign up</Link>
          </div>
          
        </div>
      </main>
    </div>
  );
}
