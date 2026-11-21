"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/Toaster";
import { LogOut } from "lucide-react";

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast("Logged out successfully", "success");
    router.push("/");
    router.refresh();
  };

  return (
    <button onClick={logout} className={`btn btn-ghost ${className}`}>
      <LogOut className="w-5 h-5" /> Logout
    </button>
  );
}