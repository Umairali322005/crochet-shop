"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/Toaster";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        toast("Please verify your email first", "info");
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        setLoading(false);
        return;
      }
      toast(error.message, "error");
    } else {
      toast("Welcome back!", "success");
      router.push("/account");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Log in to your account</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="text-sm text-center mt-2">
          <Link href="/auth/forgot-password" className="text-primary-dark hover:underline">Forgot password?</Link>
        </p>
        <p className="text-sm text-center mt-4 text-gray-500">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-primary-dark font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}