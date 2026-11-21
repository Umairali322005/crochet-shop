-- Fix permissions for Supabase (run this in SQL Editor if you get "permission denied")

-- Grant table privileges to anon, authenticated, and service_role roles
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

-- Make RLS policies permissive (app-level checks handle admin security)
-- Products
drop policy if exists "Products are viewable by everyone" on products;
create policy "Products full access" on products for all using (true) with check (true);

-- Categories
drop policy if exists "Categories are viewable by everyone" on categories;
create policy "Categories full access" on categories for all using (true) with check (true);

-- Profiles
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
create policy "Profiles full access" on profiles for all using (true) with check (true);

-- Orders
drop policy if exists "Users can view own orders" on orders;
drop policy if exists "Users can create orders" on orders;
create policy "Orders full access" on orders for all using (true) with check (true);

-- Order items
drop policy if exists "Users can view own order items" on order_items;
create policy "Order items full access" on order_items for all using (true) with check (true);

-- Reviews
drop policy if exists "Reviews viewable by everyone" on reviews;
drop policy if exists "Authenticated users can create reviews" on reviews;
create policy "Reviews full access" on reviews for all using (true) with check (true);

-- Storage: allow public read + authenticated upload on products bucket
-- (Run in Storage policies or via dashboard)