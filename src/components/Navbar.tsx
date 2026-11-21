"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import {
  ShoppingCart, Heart, Search, Menu, X, User, LogOut, Package, Home, Grid3x3,
} from "lucide-react";
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

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Products", icon: Grid3x3 },
    { href: "/cart", label: "Cart", icon: ShoppingCart },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
    { href: "/orders", label: "Orders", icon: Package },
    { href: "/account", label: "Account", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      {/* Top bar: Logo + Search + Icons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🧶</span>
            <span className="font-bold text-xl text-primary-dark hidden sm:inline">Crochet Haven</span>
          </Link>

          {/* Search (center) */}
          <form action="/products" className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="q"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search crochet products..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              />
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1 shrink-0">
            <Link href="/wishlist" className="relative btn btn-ghost p-2" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
              {mounted && wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative btn btn-ghost p-2" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
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
                className="btn btn-ghost p-2"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link href="/account" className="btn btn-ghost p-2" aria-label="Account">
                <User className="w-5 h-5" />
              </Link>
            )}
            {/* Hamburger (mobile only) */}
            <button className="md:hidden btn btn-ghost p-2" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop nav bar: Products, Cart, Orders, etc. (hidden on mobile) */}
      <nav className="hidden md:block border-t border-border bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-1 h-11">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-dark hover:bg-accent transition"
                >
                  <l.icon className="w-4 h-4" />
                  {l.label}
                  {l.href === "/cart" && mounted && cartCount > 0 && (
                    <span className="ml-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                  {l.href === "/wishlist" && mounted && wishCount > 0 && (
                    <span className="ml-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {wishCount}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu (hamburger) */}
      {open && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1">
          <form action="/products" className="mb-2">
            <input
              name="q"
              placeholder="Search..."
              className="w-full px-4 py-2 rounded-full border border-border bg-muted/50 text-sm"
            />
          </form>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent text-sm font-medium"
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          ))}
          {mounted && loggedIn && (
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-sm font-medium text-red-500 w-full text-left"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}