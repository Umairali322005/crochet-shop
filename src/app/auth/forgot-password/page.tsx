"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/Toaster";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      toast(error.message, "error");
    } else {
      setSent(true);
      toast("Password reset email sent!", "success");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and we'll send a reset link.
        </p>
        {sent ? (
          <div className="text-center">
            <p className="text-green-600 font-medium">✅ Reset link sent to {email}</p>
            <p className="text-xs text-gray-500 mt-2">Check your inbox (and spam).</p>
            <Link href="/auth/login" className="btn btn-primary mt-4 inline-flex">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
        <p className="text-sm text-center mt-4 text-gray-500">
          <Link href="/auth/login" className="text-primary-dark font-semibold hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}