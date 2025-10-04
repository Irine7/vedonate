/**
 * Utilities for safe ethereum property access
 * Prevents "Cannot set property ethereum of #<Window> which has only a getter" errors
 */

/**
 * Safely access the ethereum property on window object
 */
export function safeGetEthereum(): any {
    if (typeof window === 'undefined') {
        return undefined;
    }

    try {
        return (window as any).ethereum;
    } catch (error) {
        console.warn('Error accessing ethereum property:', error);
        return undefined;
    }
}

/**
 * Safely set the ethereum property on window object
 */
export function safeSetEthereum(value: any): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        // First try the internal storage
        if ((window as any)._internalEthereum !== undefined) {
            (window as any)._internalEthereum = value;
        }

        // Then try to set the actual property
        (window as any).ethereum = value;
        return true;
    } catch (error) {
        console.warn('Error setting ethereum property:', error);
        return false;
    }
}

/**
 * Check if ethereum is available and accessible
 */
export function isEthereumAvailable(): boolean {
    const ethereum = safeGetEthereum();
    return ethereum !== undefined && ethereum !== null;
}

/**
 * Get ethereum with fallback to internal storage
 */
export function getEthereumWithFallback(): any {
    const ethereum = safeGetEthereum();
    if (ethereum) {
        return ethereum;
    }

    // Try internal storage as fallback
    if (typeof window !== 'undefined') {
        try {
            return (
                (window as any)._internalEthereum ||
                (window as any)._safeEthereum
            );
        } catch (error) {
            console.warn('Error accessing fallback ethereum:', error);
        }
    }

    return undefined;
}

/**
 * Create a safe ethereum wrapper that handles errors gracefully
 */
export function createSafeEthereumWrapper(ethereum: any): any {
    if (!ethereum) {
        return null;
    }

    return new Proxy(ethereum, {
        get(target, prop) {
            try {
                const value = target[prop];
                if (typeof value === 'function') {
                    return (...args: any[]) => {
                        try {
                            return value.apply(target, args);
                        } catch (error) {
                            console.warn(
                                `Error calling ethereum.${String(prop)}:`,
                                error,
                            );
                            return Promise.reject(error);
                        }
                    };
                }
                return value;
            } catch (error) {
                console.warn(
                    `Error accessing ethereum.${String(prop)}:`,
                    error,
                );
                return undefined;
            }
        },
        set(target, prop, value) {
            try {
                target[prop] = value;
                return true;
            } catch (error) {
                console.warn(`Error setting ethereum.${String(prop)}:`, error);
                return false;
            }
        },
    });
}

/**
 * Wait for ethereum to become available
 */
export function waitForEthereum(timeout: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
        const ethereum = getEthereumWithFallback();
        if (ethereum) {
            resolve(ethereum);
            return;
        }

        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            const ethereum = getEthereumWithFallback();
            if (ethereum) {
                clearInterval(checkInterval);
                resolve(ethereum);
                return;
            }

            if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error('Ethereum not available within timeout'));
            }
        }, 100);
    });
}
