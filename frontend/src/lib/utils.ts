import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'EUR') {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency }).format(value);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }).format(
    new Date(date)
  );
}
