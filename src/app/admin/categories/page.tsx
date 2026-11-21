import { getCategories } from "@/lib/data";
import Link from "next/link";

export default async function AdminCategories() {
  const categories = await getCategories();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="card p-5">
            <h3 className="font-semibold">{c.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{c.slug}</p>
            <p className="text-sm text-gray-600 mt-2">{c.description}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-6">
        Categories can be managed directly in Supabase. Add new categories via SQL or the Supabase dashboard.
      </p>
    </div>
  );
}