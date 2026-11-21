"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { toast } from "@/components/Toaster";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const toggleWish = useWishlist((s) => s.toggle);
  const hasWish = useWishlist((s) => s.has(product.id));

  return (
    <div className="card group">
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-muted">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🧶</div>
        )}
        {product.compare_at_price && product.compare_at_price > product.price && (
          <span className="absolute top-3 left-3 bg-danger text-white text-xs font-bold px-2 py-1 rounded-full">
            Sale
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWish(product);
            toast(hasWish ? "Removed from wishlist" : "Added to wishlist", "success");
          }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow hover:scale-110 transition"
          aria-label="wishlist"
        >
          <Heart
            className={`w-4 h-4 ${hasWish ? "fill-primary text-primary" : "text-gray-500"}`}
          />
        </button>
      </Link>
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-foreground line-clamp-1 hover:text-primary-dark">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-gray-400 ml-1">(24)</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-bold text-primary-dark">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-gray-400 line-through ml-2">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              addItem(product);
              toast("Added to cart", "success");
            }}
            className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark transition"
            aria-label="add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}