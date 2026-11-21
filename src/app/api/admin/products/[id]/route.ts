import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { products as mockProducts } from "@/lib/mock-data";

const hasSupabase = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!hasSupabase()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 403 });
  }
  const admin = await createAdminClient();
  const { data } = await admin.from("products").select("*").eq("id", id).single();
  return NextResponse.json(data || {});
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    // Basic validation
    if (typeof body.name !== "string" || body.name.length < 1 || body.name.length > 200) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (typeof body.price !== "number" || body.price <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }
    if (!hasSupabase()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 403 });
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email?.toLowerCase() !== process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const admin = await createAdminClient();
    const { data, error } = await admin.from("products").update(body).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!hasSupabase()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 403 });
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email?.toLowerCase() !== process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const admin = await createAdminClient();
    await admin.from("products").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}