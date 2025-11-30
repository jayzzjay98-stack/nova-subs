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

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDuration(days: number): string {
  if (days === 1) return '1 Day';
  if (days === 7) return '1 Week';
  if (days === 30) return '1 Month';
  if (days === 60) return '2 Months';
  if (days === 90) return '3 Months';
  if (days === 180) return '6 Months';
  if (days === 365) return '1 Year';

  // For other values, try to calculate
  if (days % 365 === 0) {
    const years = days / 365;
    return `${years} Year${years > 1 ? 's' : ''}`;
  }
  if (days % 30 === 0) {
    const months = days / 30;
    return `${months} Month${months > 1 ? 's' : ''}`;
  }
  if (days % 7 === 0) {
    const weeks = days / 7;
    return `${weeks} Week${weeks > 1 ? 's' : ''}`;
  }

  return `${days} Days`;
}
