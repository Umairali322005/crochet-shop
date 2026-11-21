"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/Toaster";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const checkClipboard = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          const match = text.match(/\b\d{6}\b/);
          if (match && code === "") {
            setCode(match[0]);
            toast("Code auto-filled from clipboard", "info");
          }
        }
      } catch {
        // Clipboard access denied — ignore
      }
    };
    const timer = setTimeout(checkClipboard, 1000);
    return () => clearTimeout(timer);
  }, [code]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast("Please enter the 6-digit code", "error");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });
    if (error) {
      toast(error.message || "Invalid code", "error");
    } else {
      toast("Email verified! Welcome!", "success");
      router.push("/account");
      router.refresh();
    }
    setLoading(false);
  };

  const resend = async () => {
    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) {
      toast(error.message, "error");
    } else {
      toast("New code sent to your email", "success");
    }
    setResending(false);
  };

  if (!email) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">No email provided. Please sign up first.</p>
        <Link href="/auth/signup" className="btn btn-primary mt-4 inline-flex">Sign Up</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Verify Your Email</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>
        <form onSubmit={verify} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">6-Digit Code</label>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="text-xs text-gray-400 mt-1 text-center">
              Code auto-fills if received on this device
            </p>
          </div>
          <button type="submit" disabled={loading || code.length !== 6} className="btn btn-primary w-full">
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
        <div className="text-center mt-4 space-y-2">
          <button
            onClick={resend}
            disabled={resending}
            className="text-sm text-primary-dark hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
          <p className="text-sm text-gray-500">
            <Link href="/auth/signup" className="text-primary-dark hover:underline">Change email</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16 text-center"><p>Loading...</p></div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}