import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils";

const hasSupabase = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (hasSupabase()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdminEmail(user.email)) {
      redirect("/auth/login");
    }
  }

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/products/new", label: "Add Product" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/categories", label: "Categories" },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="w-64 bg-white border-r border-border p-4 shrink-0">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🧶</span>
          <span className="font-bold text-primary-dark">Admin</span>
        </Link>
        <nav className="space-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block px-3 py-2 rounded-lg hover:bg-accent text-sm font-medium">
              {l.label}
            </Link>
          ))}
          <Link href="/" className="block px-3 py-2 rounded-lg hover:bg-accent text-sm font-medium text-gray-500 mt-4">
            ← Back to site
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}