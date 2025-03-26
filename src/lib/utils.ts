import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  // Check if the number is unrealistically large
  // This indicates a potential data conversion issue
  if (amount > 1000000000000) { // More than a trillion SAR
    // Use a safer value for display
    amount = amount / 1000000000000;
  }

  // Check if the number is direct SAR value
  // (most bank statements provide values in SAR, not halalas)
  if (amount < 1000000) { // If less than a million, assume actual SAR value
    // Format using Intl.NumberFormat for consistent formatting
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } else {
    // Convert to appropriate denomination (SAR)
    const value = amount / 100;
    
    // Format using Intl.NumberFormat for consistent formatting
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }
}

export function formatDate(date: Date): string {
  // Format date in Arabic
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return new Intl.DateTimeFormat('ar-SA', options).format(date);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ar-SA').format(value);
}

export const getInitials = (name: string): string => {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) return name.charAt(0);
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
};

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
