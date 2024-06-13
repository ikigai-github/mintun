import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeout<T>(promise: Promise<T>, timeoutMs: number, reason?: string): Promise<T> {
  const timeoutPromise = new Promise<T>((_resolve, reject) => {
    setTimeout(() => reject(reason || 'Timed out waiting for promise'), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

export const ONE_DAY_MS = 1000 * 60 * 60 * 24;
