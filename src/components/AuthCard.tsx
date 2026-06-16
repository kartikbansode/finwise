"use client";

import { Mail, Lock } from "lucide-react";
import Link from "next/link";

interface Props {
  email: string;
  password: string;
  loading: boolean;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onLogin: () => void;
  onGoogle: () => void;
}

export default function AuthCard({
  email,
  password,
  loading,
  setEmail,
  setPassword,
  onLogin,
  onGoogle,
}: Props) {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">FinWise India</h1>

        <p className="text-gray-500 mt-2">Financial Operating System</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>

          <div className="mt-1 flex items-center border rounded-xl px-3">
            <Mail size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 outline-none"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>

          <div className="mt-1 flex items-center border rounded-xl px-3">
            <Lock size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 outline-none"
              placeholder="********"
            />
          </div>
        </div>

        <button
          onClick={onLogin}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <Link
          href="/signup"
          className="w-full border py-3 rounded-xl font-medium hover:bg-gray-50 text-center block"
        >
          Create Account
        </Link>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>

          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-sm text-gray-500">OR</span>
          </div>
        </div>

        <button
          onClick={onGoogle}
          className="w-full border py-3 rounded-xl flex justify-center items-center gap-3 hover:bg-gray-50"
        >
          <div className="w-5 h-5 rounded-full bg-white border flex items-center justify-center text-xs font-bold">
            G
          </div>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
