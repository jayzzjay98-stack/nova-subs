import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' ₭';
}

export function formatDate(dateString: string): string {
  // Parse the date string and add Bangkok timezone offset
  const date = new Date(dateString + 'T00:00:00+07:00');

  return new Intl.DateTimeFormat('th', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
