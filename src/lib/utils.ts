import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// `isPublicRoute` used to be duplicated here with different semantics - it
// matched with a bare `path.startsWith(route)`, which would have made
// `/loginhack` public. The single source of truth is `@lib/constants/routes`.
