/**
 * Network utilities for handling fetch errors and network issues
 */

/**
 * Safe fetch wrapper with error handling and retries
 */
export async function safeFetch(
    url: string,
    options: RequestInit = {},
    retries: number = 3,
    delay: number = 1000,
): Promise<Response | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {
                ...options,
                // Add timeout to prevent hanging requests
                signal: AbortSignal.timeout(10000), // 10 second timeout
            });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`,
                );
            }

            return response;
        } catch (error) {
            console.warn(`Fetch attempt ${attempt} failed for ${url}:`, error);

            if (attempt === retries) {
                console.error(
                    `All ${retries} fetch attempts failed for ${url}`,
                );
                return null;
            }

            // Wait before retrying
            await new Promise((resolve) =>
                setTimeout(resolve, delay * attempt),
            );
        }
    }

    return null;
}

/**
 * Safe fetch for avatar images with fallback
 */
export async function safeFetchAvatar(
    avatarUrl: string,
    name: string,
): Promise<Blob | null> {
    try {
        const response = await safeFetch(avatarUrl);

        if (!response) {
            console.warn(
                `Failed to fetch avatar for ${name} from ${avatarUrl}`,
            );
            return null;
        }

        const blob = await response.blob();

        // Validate that we got an image
        if (!blob.type.startsWith('image/')) {
            console.warn(`Invalid avatar format for ${name}: ${blob.type}`);
            return null;
        }

        return blob;
    } catch (error) {
        console.warn(`Error fetching avatar for ${name}:`, error);
        return null;
    }
}

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof fetch !== 'undefined';
}

/**
 * Check if we have network connectivity
 */
export function hasNetworkConnectivity(): boolean {
    if (!isBrowser()) {
        return false;
    }

    // Check navigator.onLine
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return false;
    }

    return true;
}

/**
 * Create a network error handler
 */
export function createNetworkErrorHandler(context: string) {
    return (error: any) => {
        console.warn(`Network error in ${context}:`, error);

        // Don't throw errors for network issues, just log them
        if (error.name === 'AbortError') {
            console.warn(`Request was aborted in ${context}`);
        } else if (error.message?.includes('Failed to fetch')) {
            console.warn(
                `Network request failed in ${context} - this might be due to CORS or network issues`,
            );
        }
    };
}

/**
 * Safe wrapper for async network operations
 */
export async function withNetworkErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    fallback?: T,
): Promise<T | null> {
    try {
        if (!hasNetworkConnectivity()) {
            console.warn(`No network connectivity for ${context}`);
            return fallback || null;
        }

        return await operation();
    } catch (error) {
        createNetworkErrorHandler(context)(error);
        return fallback || null;
    }
}
