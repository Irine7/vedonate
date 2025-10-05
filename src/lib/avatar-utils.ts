/**
 * Avatar utilities for handling avatar loading with fallbacks
 */

/**
 * Get avatar URL with fallback to local proxy
 */
export function getAvatarUrl(domain: string): string {
	// Use our local proxy to avoid CORS issues
	return `/api/avatar/${domain}`;
}

/**
 * Get fallback avatar URL
 */
export function getFallbackAvatarUrl(): string {
	// Return a default avatar or placeholder
	return '/logo.png'; // Using the existing logo as fallback
}

/**
 * Safe avatar loading with error handling
 */
export async function loadAvatar(domain: string): Promise<string> {
	try {
		const avatarUrl = getAvatarUrl(domain);

		// Test if the avatar exists
		const response = await fetch(avatarUrl, {
			method: 'HEAD',
			signal: AbortSignal.timeout(5000), // 5 second timeout
		});

		if (response.ok) {
			return avatarUrl;
		}
	} catch (error) {
		console.warn(`Failed to load avatar for ${domain}:`, error);
	}

	// Return fallback avatar
	return getFallbackAvatarUrl();
}

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
	return typeof window !== 'undefined';
}
