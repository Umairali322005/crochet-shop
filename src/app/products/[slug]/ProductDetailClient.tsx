"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { toast } from "@/components/Toaster";
import { ShoppingBag, Heart } from "lucide-react";
import type { Product } from "@/types";

export function ProductDetailClient({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(product.colors?.[0]);
  const [size, setSize] = useState(product.sizes?.[0]);

  return (
    <div className="mt-6 space-y-4">
      {product.colors?.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2">Color: {color}</p>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`px-4 py-2 rounded-full border text-sm transition ${
                  color === c ? "border-primary bg-accent text-primary-dark font-semibold" : "border-border hover:border-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
      {product.sizes?.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2">Size: {size}</p>
          <div className="flex gap-2 flex-wrap">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-4 py-2 rounded-full border text-sm transition ${
                  size === s ? "border-primary bg-accent text-primary-dark font-semibold" : "border-border hover:border-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-border rounded-full">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 hover:bg-muted rounded-l-full">
            -
          </button>
          <span className="px-4 py-2 font-semibold">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="px-4 py-2 hover:bg-muted rounded-r-full">
            +
          </button>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => {
            addItem(product, qty, color, size);
            toast("Added to cart", "success");
          }}
          disabled={product.stock === 0}
          className="btn btn-primary flex-1"
        >
          <ShoppingBag className="w-5 h-5" /> Add to Cart
        </button>
        <button className="btn btn-outline">
          <Heart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}