"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/Toaster";
import { useRouter } from "next/navigation";

type PaymentMethod = "cod" | "easypaisa";

const EASYPAISA_NUMBER = process.env.NEXT_PUBLIC_EASYPAISA_NUMBER || "03167981980";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);
  const router = useRouter();

  const [method, setMethod] = useState<PaymentMethod>("cod");
  const [loading, setLoading] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  const shipping = total > 999 ? 0 : 99;
  const grandTotal = total + shipping;

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast("Cart is empty", "error");
      return;
    }
    if (method === "easypaisa" && !txnId.trim()) {
      toast("Please enter your Easypaisa transaction ID", "error");
      return;
    }
    setLoading(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          product_image: i.product.images?.[0],
          price: i.product.price,
          quantity: i.quantity,
          color: i.color,
          size: i.size,
        })),
        ...form,
        payment_method: method,
        transaction_id: method === "easypaisa" ? txnId.trim() : null,
        subtotal: total,
        shipping,
        total: grandTotal,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");

      const params = new URLSearchParams({
        success: "1",
        num: data.order_number,
        total: String(grandTotal),
        method,
        name: form.name,
        phone: form.phone,
        address: `${form.address}, ${form.city}, ${form.state} ${form.pincode}`,
        txn: method === "easypaisa" ? txnId.trim() : "",
      });
      clear();
      router.push(`/orders/${data.order_id}?${params.toString()}`);
    } catch (err: any) {
      toast(err.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/products" className="btn btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={submit} className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-bold mb-4">Shipping Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: "name", label: "Full Name", type: "text" },
                { key: "email", label: "Email", type: "email" },
                { key: "phone", label: "Phone", type: "tel" },
                { key: "city", label: "City", type: "text" },
                { key: "state", label: "State/Province", type: "text" },
                { key: "pincode", label: "Postal Code", type: "text" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">{f.label}</label>
                  <input
                    type={f.type}
                    required
                    value={(form as any)[f.key]}
                    onChange={(e) => update(f.key, e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-600 mb-1 block">Address</label>
                <textarea
                  required
                  rows={3}
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-600 mb-1 block">Order Notes (optional)</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition ${method === "cod" ? "border-primary bg-accent" : "border-border"}`}>
                <input type="radio" checked={method === "cod"} onChange={() => setMethod("cod")} />
                <div>
                  <p className="font-semibold">Cash on Delivery (COD)</p>
                  <p className="text-xs text-gray-500">Pay when your order arrives</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition ${method === "easypaisa" ? "border-primary bg-accent" : "border-border"}`}>
                <input type="radio" checked={method === "easypaisa"} onChange={() => setMethod("easypaisa")} />
                <div>
                  <p className="font-semibold">Easypaisa</p>
                  <p className="text-xs text-gray-500">Send payment via Easypaisa mobile wallet</p>
                </div>
              </label>
            </div>

            {method === "easypaisa" && (
              <div className="mt-4 p-4 bg-accent rounded-lg space-y-3">
                <p className="text-sm font-semibold text-primary-dark">How to pay:</p>
                <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
                  <li>Open your Easypaisa app</li>
                  <li>Send <strong>{formatPrice(grandTotal)}</strong> to Easypaisa number <strong>{EASYPAISA_NUMBER}</strong></li>
                  <li>Copy the transaction ID from the receipt</li>
                  <li>Paste it below</li>
                </ol>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Easypaisa Transaction ID *</label>
                  <input
                    type="text"
                    required
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    placeholder="e.g. 1234567890"
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4 max-h-60 overflow-auto">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="text-gray-600 line-clamp-1 flex-1">
                  {i.product.name} × {i.quantity}
                </span>
                <span className="ml-2">{formatPrice(i.product.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-border pt-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary-dark">{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-6">
            {loading ? "Processing..." : method === "cod" ? "Place Order (COD)" : "Place Order (Easypaisa)"}
          </button>
          <p className="text-xs text-gray-500 mt-3 text-center">
            By placing order you agree to our terms & conditions.
          </p>
        </div>
      </form>
    </div>
  );
}