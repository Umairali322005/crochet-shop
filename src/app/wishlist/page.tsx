"use client";

import Link from "next/link";
import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "@/components/Toaster";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const items = useWishlist((s) => s.items);
  const clear = useWishlist((s) => s.clear);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4">💔</div>
        <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
        <p className="text-gray-500 mb-6">Save your favorite crochet items here.</p>
        <Link href="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Wishlist ({items.length})</h1>
        <button onClick={() => { clear(); toast("Wishlist cleared", "info"); }} className="text-sm text-gray-500 hover:text-red-500">
          Clear all
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}