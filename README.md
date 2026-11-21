# 🧶 Crochet Haven — E-Commerce Website

A full-featured e-commerce website for selling handmade crochet products. Built with Next.js 16, Tailwind CSS, Supabase, and Razorpay.

## Features

**Customer-facing**
- 🏠 Home page with hero, categories, featured products, promo
- 🛍️ Product listing with filters (category, sort, search)
- 📄 Product detail with image gallery, color/size selection, quantity
- 🛒 Shopping cart (persistent)
- ❤️ Wishlist (persistent)
- 💳 Checkout with COD + Easypaisa payment
- 📦 Order tracking & history
- 👤 User accounts (sign up / login)
- ⭐ Reviews section

**Admin (owner only)**
- 📊 Dashboard with stats
- ➕ Add / ✏️ Edit / 🗑️ Delete products
- 📋 Order management
- 🗂️ Categories

**Tech**
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4 (pink/floral minimal theme)
- Supabase (auth, database, storage) — free tier
- Easypaisa (manual payment verification)
- Zustand (cart/wishlist state)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase (free)

1. Create a project at https://supabase.com
2. Go to SQL Editor → paste contents of `supabase/schema.sql` → Run
3. Go to Storage → create a public bucket named `products`
4. Copy your Project URL and anon key from Settings → API

### 3. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_EASYPAISA_NUMBER` — your Easypaisa number (default: 03167981980)
- `NEXT_PUBLIC_ADMIN_EMAIL` — the email that gets admin access

### 4. Make yourself admin

Sign up with the email you set as `NEXT_PUBLIC_ADMIN_EMAIL`. That account gets admin dashboard access.

### 5. Run dev server

```bash
npm run dev
```

Open http://localhost:3000

### 6. Deploy (free)

Push to GitHub, then import on https://vercel.com. Add the same env vars in Vercel project settings.

## Without Supabase (demo mode)

The site runs in demo mode using mock data if Supabase env vars are empty. Cart, wishlist work via localStorage. Orders won't persist. Admin product changes won't save.

## Project Structure

```
src/
  app/            # Next.js app router pages
  components/     # Reusable UI components
  lib/            # Supabase clients, utils, data layer, mock data
  store/          # Zustand stores (cart, wishlist)
  types/          # TypeScript types
supabase/
  schema.sql      # Database schema
```

## License

MIT — free to use and modify.