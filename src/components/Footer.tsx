import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧶</span>
              <span className="font-bold text-lg text-primary-dark">Crochet Haven</span>
            </div>
            <p className="text-sm text-gray-600">
              Handmade crochet products crafted with love. Every stitch tells a story.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/products" className="hover:text-primary-dark">All Products</Link></li>
              <li><Link href="/products?category=amigurumi" className="hover:text-primary-dark">Amigurumi</Link></li>
              <li><Link href="/products?category=blankets" className="hover:text-primary-dark">Blankets</Link></li>
              <li><Link href="/products?category=accessories" className="hover:text-primary-dark">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/account" className="hover:text-primary-dark">My Account</Link></li>
              <li><Link href="/orders" className="hover:text-primary-dark">My Orders</Link></li>
              <li><Link href="/wishlist" className="hover:text-primary-dark">Wishlist</Link></li>
              <li><Link href="/cart" className="hover:text-primary-dark">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>📧 crochet.c43@gmail.com</li>
              <li>📱 +92 310 5175894</li>
              <li>📍 Pakistan, KPK, Swabi</li>
              <li>💬 WhatsApp: +92 310 5175894</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-gray-500">
          © 2026 Crochet Haven. Made with 💕 and yarn.
        </div>
      </div>
    </footer>
  );
}