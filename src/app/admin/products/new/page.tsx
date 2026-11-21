"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/Toaster";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import { ImageUpload } from "@/components/ImageUpload";
import { createClient } from "@/lib/supabase/client";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast("Please log in as admin first", "error");
        router.push("/auth/login");
        return;
      }
      setAuthChecked(true);
    })();
  }, [router]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    compare_at_price: "",
    stock: "0",
    colors: "",
    sizes: "",
    is_featured: false,
    is_active: true,
    images: [] as string[],
  });

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      if (!form.name.trim()) throw new Error("Product name is required");
      if (!form.price || Number(form.price) <= 0) throw new Error("Valid price is required");

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: slugify(form.name),
          description: form.description,
          price: Number(form.price),
          compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
          stock: Number(form.stock) || 0,
          colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
          sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
          is_featured: form.is_featured,
          is_active: form.is_active,
          images: form.images,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Admin access required. Please log in with admin account first.");
        }
        throw new Error(data.error || "Failed to create product");
      }
      setStatus({ type: "success", msg: `✅ Product "${form.name}" saved successfully!` });
      toast("Product created successfully!", "success");
      setForm({ name: "", description: "", price: "", compare_at_price: "", stock: "0", colors: "", sizes: "", is_featured: false, is_active: true, images: [] as string[] });
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (err: any) {
      setStatus({ type: "error", msg: `❌ ${err.message || "Something went wrong"}` });
      toast(err.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return <div className="max-w-2xl"><p className="text-gray-500">Checking authentication...</p></div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <form onSubmit={submit} className="card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Name *</label>
          <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Price (₹) *</label>
            <input type="number" required value={form.price} onChange={(e) => update("price", e.target.value)} className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Compare Price (₹)</label>
            <input type="number" value={form.compare_at_price} onChange={(e) => update("compare_at_price", e.target.value)} className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Stock</label>
          <input type="number" value={form.stock} onChange={(e) => update("stock", e.target.value)} className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Colors (comma separated)</label>
          <input value={form.colors} onChange={(e) => update("colors", e.target.value)} placeholder="Pink, White, Beige" className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Sizes (comma separated)</label>
          <input value={form.sizes} onChange={(e) => update("sizes", e.target.value)} placeholder="Small, Medium, Large" className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <ImageUpload images={form.images} onChange={(urls) => update("images", urls)} />
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => update("is_featured", e.target.checked)} />
            <span className="text-sm">Featured</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} />
            <span className="text-sm">Active</span>
          </label>
        </div>
        {status && (
          <div className={`p-3 rounded-lg text-sm font-medium ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {status.msg}
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Creating..." : "Create Product"}
          </button>
          <Link href="/admin/products" className="btn btn-outline">Cancel</Link>
        </div>
      </form>
    </div>
  );
}