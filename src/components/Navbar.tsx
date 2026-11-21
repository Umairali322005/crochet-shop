"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { ShoppingCart, Heart, Search, Menu, X, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const cartCount = useCart((s) => s.count());
  const wishCount = useWishlist((s) => s.items.length);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧶</span>
            <span className="font-bold text-xl text-primary-dark">Crochet Haven</span>
          </Link>

          <form
            action="/products"
            className="hidden md:flex items-center flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="q"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search crochet products..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-2">
            <Link href="/products" className="btn btn-ghost">Shop</Link>
            <Link href="/wishlist" className="relative btn btn-ghost">
              <Heart className="w-5 h-5" />
              {mounted && wishCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative btn btn-ghost">
              <ShoppingCart className="w-5 h-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {mounted && loggedIn ? (
              <button
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="btn btn-ghost"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link href="/account" className="btn btn-ghost">
                <User className="w-5 h-5" />
              </Link>
            )}
          </nav>

          <button className="md:hidden btn btn-ghost" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-2">
            <form action="/products" className="flex">
              <input
                name="q"
                placeholder="Search..."
                className="flex-1 px-4 py-2 rounded-full border border-border bg-muted/50"
              />
            </form>
            <Link href="/products" className="block btn btn-ghost w-full text-left">Shop</Link>
            <Link href="/wishlist" className="block btn btn-ghost w-full text-left">Wishlist ({mounted ? wishCount : 0})</Link>
            <Link href="/cart" className="block btn btn-ghost w-full text-left">Cart ({mounted ? cartCount : 0})</Link>
            <Link href="/account" className="block btn btn-ghost w-full text-left">Account</Link>
          </div>
        )}
      </div>
    </header>
  );
}