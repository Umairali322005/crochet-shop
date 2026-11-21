import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { getFeaturedProducts, getCategories } from "@/lib/data";

export default async function Home() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), getCategories()]);

  return (
    <div className="floral-bg">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-accent text-primary-dark text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                ✨ Handmade with love
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Beautiful <span className="text-primary">Crochet</span> Creations
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-lg">
                Discover our collection of handmade crochet products — amigurumi dolls, cozy
                blankets, accessories and home decor. Each piece crafted stitch by stitch.
              </p>
              <div className="mt-8 flex gap-4">
                <Link href="/products" className="btn btn-primary">
                  Shop Now
                </Link>
                <Link href="/products?featured=true" className="btn btn-outline">
                  Featured
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://picsum.photos/seed/crochethero/800/800"
                  alt="Crochet products"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
                <span className="text-3xl">🧶</span>
                <div>
                  <p className="font-bold text-primary-dark">500+</p>
                  <p className="text-xs text-gray-500">Happy customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="card p-6 text-center hover:scale-105 transition"
            >
              <div className="text-5xl mb-3">
                {["🧸", "🛋️", "👜", "🏡"][i % 4]}
              </div>
              <h3 className="font-semibold text-foreground">{cat.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Featured Products</h2>
          <Link href="/products" className="text-primary-dark font-semibold hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary to-primary-dark text-white p-8 sm:p-12">
          <div className="relative z-10 max-w-lg">
            <h3 className="text-3xl font-bold">Custom Orders Welcome!</h3>
            <p className="mt-2 opacity-90">
              Want something unique? We take custom crochet orders. Tell us your idea and we'll
              bring it to life.
            </p>
            <Link href="/products" className="mt-6 inline-block btn bg-white text-primary-dark hover:bg-accent">
              Get in Touch
            </Link>
          </div>
          <div className="absolute right-0 bottom-0 text-[12rem] opacity-20 leading-none">🧶</div>
        </div>
      </section>
    </div>
  );
}