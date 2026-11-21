import { ProductCard } from "@/components/ProductCard";
import { getProducts, getCategories } from "@/lib/data";
import Link from "next/link";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; featured?: string }>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({
      category: params.category,
      q: params.q,
      sort: params.sort,
      featured: params.featured === "true",
    }),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="md:w-64 shrink-0">
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold mb-4">Filters</h3>

            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-2 text-gray-600">Category</h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/products"
                    className={`block px-3 py-1.5 rounded-lg text-sm ${
                      !params.category ? "bg-accent text-primary-dark font-semibold" : "hover:bg-muted"
                    }`}
                  >
                    All
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/products?category=${c.slug}${params.q ? `&q=${params.q}` : ""}`}
                      className={`block px-3 py-1.5 rounded-lg text-sm ${
                        params.category === c.slug
                          ? "bg-accent text-primary-dark font-semibold"
                          : "hover:bg-muted"
                      }`}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 text-gray-600">Sort by</h4>
              <ul className="space-y-1">
                {[
                  { label: "Newest", value: "" },
                  { label: "Price: Low to High", value: "price-asc" },
                  { label: "Price: High to Low", value: "price-desc" },
                ].map((s) => (
                  <li key={s.value}>
                    <Link
                      href={`/products?${params.category ? `category=${params.category}&` : ""}${params.q ? `q=${params.q}&` : ""}sort=${s.value}`}
                      className={`block px-3 py-1.5 rounded-lg text-sm ${
                        (params.sort || "") === s.value
                          ? "bg-accent text-primary-dark font-semibold"
                          : "hover:bg-muted"
                      }`}
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {params.q ? `Search: "${params.q}"` : params.category ? categories.find((c) => c.slug === params.category)?.name || "Products" : "All Products"}
            </h1>
            <p className="text-sm text-gray-500">{products.length} products</p>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🧶</div>
              <p className="text-gray-500">No products found.</p>
              <Link href="/products" className="btn btn-primary mt-4 inline-flex">
                View all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}