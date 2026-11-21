"use client";

import { useState } from "react";
import { toast } from "@/components/Toaster";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export function OrderStatusSelect({ orderId, current }: { orderId: string; current: string }) {
  const [status, setStatus] = useState(current);
  const [saving, setSaving] = useState(false);

  const change = async (newStatus: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus(newStatus);
      toast(`Order status updated to ${newStatus}`, "success");
    } catch (err: any) {
      toast(err.message || "Failed to update status", "error");
    } finally {
      setSaving(false);
    }
  };

  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <select
      value={status}
      onChange={(e) => change(e.target.value)}
      disabled={saving}
      className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${colors[status] || "bg-muted"}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}