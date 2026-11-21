import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

const hasSupabase = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const rl = rateLimit(`upload:${ip}`, 20, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    if (!hasSupabase()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email?.toLowerCase() !== process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPG/PNG/WebP/GIF." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }

    const admin = await createAdminClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage.from("products").upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { data: urlData } = admin.storage.from("products").getPublicUrl(path);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}