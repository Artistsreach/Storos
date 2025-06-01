import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function generateStoreUrl(storeName) {
	if (!storeName) {
		return '';
	}
	return storeName.toLowerCase().replace(/\s+/g, '-');
}
