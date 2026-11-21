"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/Toaster";
import { Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const clear = useCart((s) => s.clear);
  const total = useCart((s) => s.total());
  const count = useCart((s) => s.count());

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link href="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  const shipping = total > 999 ? 0 : 99;
  const grandTotal = total + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({count} items)</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                {item.product.images?.[0] && (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <Link href={`/products/${item.product.slug}`} className="font-semibold hover:text-primary-dark">
                  {item.product.name}
                </Link>
                <p className="text-xs text-gray-500 mt-1">
                  {item.color && `Color: ${item.color}`} {item.size && `• Size: ${item.size}`}
                </p>
                <p className="font-bold text-primary-dark mt-2">{formatPrice(item.product.price)}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-border rounded-full">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-muted rounded-l-full">-</button>
                    <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-muted rounded-r-full">+</button>
                  </div>
                  <button
                    onClick={() => { removeItem(item.id); toast("Removed from cart", "info"); }}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right font-bold">
                {formatPrice(item.product.price * item.quantity)}
              </div>
            </div>
          ))}
          <button onClick={() => { clear(); toast("Cart cleared", "info"); }} className="text-sm text-gray-500 hover:text-red-500">
            Clear cart
          </button>
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-gray-500">Free shipping on orders over ₹999</p>
            )}
            <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary-dark">{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <Link href="/checkout" className="btn btn-primary w-full mt-6">
            <ShoppingBag className="w-5 h-5" /> Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}