-- Crochet Haven E-Commerce Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  created_at timestamptz default now()
);

-- Products
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text not null default '',
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  category_id uuid references categories(id) on delete set null,
  images text[] default '{}',
  stock int not null default 0,
  colors text[] default '{}',
  sizes text[] default '{}',
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  address text,
  city text,
  state text,
  pincode text,
  created_at timestamptz default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  order_number text unique not null,
  status text not null default 'pending',
  payment_method text not null,
  payment_status text not null default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  transaction_id text,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  shipping_name text not null,
  shipping_email text not null,
  shipping_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_state text not null,
  shipping_pincode text not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order Items
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid,
  product_name text not null,
  product_image text,
  price numeric(10,2) not null,
  quantity int not null,
  color text,
  size text
);

-- Reviews
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table categories enable row level security;
alter table products enable row level security;
alter table profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;

-- Public read for categories & products
create policy "Categories are viewable by everyone" on categories for select using (true);
create policy "Products are viewable by everyone" on products for select using (is_active = true);

-- Profiles: users manage own
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Orders: users view own; admin views all (via service role)
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can create orders" on orders for insert with check (auth.uid() = user_id);

-- Order items follow orders
create policy "Users can view own order items" on order_items for select
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

-- Reviews
create policy "Reviews viewable by everyone" on reviews for select using (true);
create policy "Authenticated users can create reviews" on reviews for insert
  with check (auth.uid() = user_id);

-- Storage bucket for product images (create in dashboard: 'products' bucket, public)
-- insert into storage.buckets (id, name, public) values ('products', 'products', true);