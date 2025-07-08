import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `R ${numPrice.toFixed(2)}`;
}

export function calculateDiscountPercentage(original: string | number, current: string | number): number {
  const originalPrice = typeof original === 'string' ? parseFloat(original) : original;
  const currentPrice = typeof current === 'string' ? parseFloat(current) : current;
  
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return targetDate.toLocaleDateString();
}

export function formatLocation(location: string): string {
  if (location.length > 15) {
    return location.substring(0, 15) + '...';
  }
  return location;
}

export function generateGradientClass(gradientString: string): string {
  return `bg-gradient-to-r ${gradientString}`;
}
