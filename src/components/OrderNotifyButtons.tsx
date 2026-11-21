"use client";

import { useState } from "react";
import { toast } from "@/components/Toaster";
import { MessageCircle, Mail } from "lucide-react";

const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "03167981980";
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "umairali.c3@gmail.com";

export function OrderNotifyButtons({
  orderNumber,
  customerName,
  phone,
  address,
  paymentMethod,
  transactionId,
  total,
  items,
}: {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  transactionId?: string | null;
  total: number;
  items: { product_name: string; quantity: number; price: number }[];
}) {
  const [sending, setSending] = useState(false);

  const waMessage = encodeURIComponent(
    `🧶 *New Order - Crochet Haven*\n\n` +
      `Order #: ${orderNumber}\n` +
      `Customer: ${customerName}\n` +
      `Phone: ${phone}\n` +
      `Address: ${address}\n` +
      `Payment: ${paymentMethod === "cod" ? "Cash on Delivery" : "Easypaisa"}\n` +
      (transactionId ? `Txn ID: ${transactionId}\n` : "") +
      `Total: Rs ${total}\n\n` +
      `Items:\n${items.map((i) => `- ${i.product_name} x${i.quantity} = Rs ${i.price * i.quantity}`).join("\n")}`
  );
  const waLink = `https://wa.me/92${ADMIN_WHATSAPP.replace(/^0/, "")}?text=${waMessage}`;

  const sendEmail = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/notify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          customerName,
          phone,
          address,
          paymentMethod,
          transactionId,
          total,
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.method === "mailto") {
        window.location.href = data.mailto;
        toast("Opening email client...", "info");
      } else {
        toast("Email sent to admin!", "success");
      }
    } catch (err: any) {
      toast(err.message || "Email failed", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex gap-1">
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition"
        title="Notify on WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
      </a>
      <button
        onClick={sendEmail}
        disabled={sending}
        className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition disabled:opacity-50"
        title="Notify via Email"
      >
        <Mail className="w-4 h-4" />
      </button>
    </div>
  );
}