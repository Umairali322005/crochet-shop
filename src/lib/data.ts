import { createClient as createServerClient } from "@/lib/supabase/server";
import { products as mockProducts, categories as mockCategories } from "@/lib/mock-data";
import type { Product, Category } from "@/types";

const hasSupabase = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getProducts(opts?: {
  category?: string;
  q?: string;
  sort?: string;
  featured?: boolean;
}): Promise<Product[]> {
  if (!hasSupabase()) {
    let list = [...mockProducts];
    if (opts?.category) list = list.filter((p) => p.category?.slug === opts.category);
    if (opts?.q) {
      const q = opts.q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (opts?.featured) list = list.filter((p) => p.is_featured);
    if (opts?.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (opts?.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }
  const supabase = await createServerClient();
  let query = supabase.from("products").select("*, category:categories(*)").eq("is_active", true);
  if (opts?.category) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", opts.category).single();
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (opts?.q) query = query.ilike("name", `%${opts.q}%`);
  if (opts?.featured) query = query.eq("is_featured", true);
  if (opts?.sort === "price-asc") query = query.order("price", { ascending: true });
  else if (opts?.sort === "price-desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });
  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    // Fallback to mock data if DB not set up yet
    let list = [...mockProducts];
    if (opts?.category) list = list.filter((p) => p.category?.slug === opts.category);
    if (opts?.q) {
      const q = opts.q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (opts?.featured) list = list.filter((p) => p.is_featured);
    if (opts?.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (opts?.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }
  return (data as Product[]) || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasSupabase()) return mockProducts.find((p) => p.slug === slug) || null;
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .single();
  if (error || !data) return mockProducts.find((p) => p.slug === slug) || null;
  return (data as Product) || null;
}

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabase()) return mockCategories;
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error || !data || data.length === 0) return mockCategories;
  return (data as Category[]) || mockCategories;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ featured: true });
}