import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fungsi utilitas untuk menggabungkan class names secara kondisional
 * dan membersihkan konflik Tailwind CSS.
 * * @param inputs Array dari class names, strings, atau conditional objects.
 * @returns String tunggal dari class names yang bersih.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}