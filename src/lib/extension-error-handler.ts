/**
 * Extension error handler for browser extension conflicts
 * Handles errors from wallet extensions like VeWorld, MetaMask, etc.
 */

/**
 * Known extension error patterns
 */
const EXTENSION_ERROR_PATTERNS = [
    // VeWorld specific patterns
    /chrome-extension:\/\/.*VeWorldAPI\.js/,
    /chrome-extension:\/\/ffondjhiilhjpmfakjbejdgbemolaaho/,
    /\[ERROR\]\s*\(#.*\)\s*-\s*"Attempt failed"/,
    /Attempt failed.*\{\}/,

    // General extension patterns
    /chrome-extension:\/\/.*injected\.js/,
    /chrome-extension:\/\/.*content\.js/,
    /Extension context invalidated/,
    /Receiving end does not exist/,
    /Could not establish connection/,
    /A listener indicated an asynchronous response/,
    /The message port closed before a response was received/,

    // VeChain specific patterns
    /veworld.*error/i,
    /vet.*connection.*failed/i,
];

/**
 * Check if error is from a browser extension
 */
export function isExtensionError(error: any): boolean {
    if (!error) return false;

    try {
        // Handle different error formats safely
        const errorString = error.toString ? error.toString() : String(error);
        const errorMessage = error.message || '';
        const errorStack = error.stack || '';
        const errorName = error.name || '';

        // Also check the source if it's available (for window.onerror)
        const errorSource = error.source || '';

        // Combine all error text for pattern matching
        const allErrorText = [
            errorString,
            errorMessage,
            errorStack,
            errorName,
            errorSource,
        ].join(' ');

        return EXTENSION_ERROR_PATTERNS.some((pattern) => {
            try {
                return pattern.test(allErrorText);
            } catch (e) {
                // If pattern matching fails, continue to next pattern
                return false;
            }
        });
    } catch (e) {
        // If anything fails in error processing, assume it's not an extension error
        return false;
    }
}

/**
 * Create a safe error handler for extension conflicts
 */
export function createExtensionErrorHandler(context: string) {
    return (error: any) => {
        try {
            if (isExtensionError(error)) {
                const errorMessage =
                    error?.message || error?.toString() || 'Unknown error';
                console.warn(
                    `Extension error in ${context} (this is usually harmless):`,
                    errorMessage,
                );
                // Don't propagate extension errors as they're usually not critical
                return true;
            }

            // For non-extension errors, log them normally
            console.error(`Error in ${context}:`, error);
            return false;
        } catch (e) {
            // If error handling fails, log it safely
            console.error(`Error in error handler for ${context}:`, e);
            return false;
        }
    };
}

/**
 * Wrap async operations with extension error handling
 */
export async function withExtensionErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    fallback?: T,
): Promise<T | null> {
    try {
        return await operation();
    } catch (error) {
        const isExtensionErr = createExtensionErrorHandler(context)(error);

        if (isExtensionErr) {
            // Return fallback for extension errors
            return fallback || null;
        }

        // Re-throw non-extension errors
        throw error;
    }
}

/**
 * Setup global error handler for extension conflicts
 */
export function setupGlobalExtensionErrorHandler() {
    if (typeof window === 'undefined') return;

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        if (isExtensionError(event.reason)) {
            console.warn(
                'Unhandled extension error (suppressed):',
                event.reason.message,
            );
            event.preventDefault(); // Prevent the error from showing in console
        }
    });

    // Handle global errors
    const originalOnError = window.onerror;
    window.onerror = function (message, source, lineno, colno, error) {
        // Create error object with all available information
        const errorInfo = {
            message: message,
            source: source,
            lineno: lineno,
            colno: colno,
            error: error,
            stack: error?.stack || '',
            name: error?.name || '',
        };

        if (isExtensionError(errorInfo)) {
            console.warn('Extension error caught (suppressed):', message);
            return true; // Prevent default error handling
        }

        if (originalOnError) {
            return originalOnError.call(
                this,
                message,
                source,
                lineno,
                colno,
                error,
            );
        }

        return false;
    };
}

/**
 * Safe wrapper for wallet operations
 */
export function createSafeWalletOperation<
    T extends (...args: any[]) => Promise<any>,
>(operation: T, context: string): T {
    return (async (...args: any[]) => {
        try {
            return await operation(...args);
        } catch (error) {
            if (isExtensionError(error)) {
                console.warn(
                    `Wallet extension error in ${context}:`,
                    error.message,
                );
                throw new Error(
                    `Wallet operation failed: ${context}. Please try again.`,
                );
            }
            throw error;
        }
    }) as T;
}
