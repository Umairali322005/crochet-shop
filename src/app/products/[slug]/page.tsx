import { notFound } from "next/navigation";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { getProductBySlug, getProducts } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { ProductDetailClient } from "./ProductDetailClient";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProducts({ category: product.category?.slug })).filter(
    (p) => p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted card">
            {product.images?.[0] ? (
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🧶</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {product.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted card">
                  <Image src={img} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-500 mb-1">{product.category?.name}</p>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            <span className="text-sm text-gray-500">(24 reviews)</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary-dark">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
            )}
          </div>
          <p className="mt-2 text-sm text-green-600 font-medium">
            {product.stock > 0 ? `In stock (${product.stock} available)` : "Out of stock"}
          </p>

          <ProductDetailClient product={product} />

          <div className="mt-8 border-t border-border pt-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-gray-500">Material</p>
              <p className="font-medium">100% Cotton Yarn</p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-gray-500">Care</p>
              <p className="font-medium">Hand wash cold</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}