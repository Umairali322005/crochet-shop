import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const admin = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  return !!admin && email.toLowerCase() === admin.toLowerCase();
}

export function truncate(text: string, length = 100) {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}