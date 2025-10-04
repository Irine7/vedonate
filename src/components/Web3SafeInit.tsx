'use client';

import { useEffect } from 'react';
import { setupGlobalExtensionErrorHandler } from '@/lib/extension-error-handler';

export function Web3SafeInit() {
    useEffect(() => {
        // Safe initialization of Web3 properties
        if (typeof window === 'undefined') return;

        try {
            // Additional safety layer for ethereum property
            const ensureEthereumSafety = () => {
                try {
                    // Check if ethereum property is accessible
                    const ethereum = (window as any).ethereum;

                    // If ethereum exists and is not configurable, try to make it safe
                    const descriptor = Object.getOwnPropertyDescriptor(
                        window,
                        'ethereum',
                    );

                    if (descriptor && !descriptor.configurable) {
                        // Try to create a proxy for read-only ethereum
                        const safeEthereum = new Proxy(ethereum || {}, {
                            get(target, prop) {
                                try {
                                    return target[prop];
                                } catch (error) {
                                    console.warn(
                                        `Error accessing ethereum.${String(
                                            prop,
                                        )}:`,
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
                                    console.warn(
                                        `Error setting ethereum.${String(
                                            prop,
                                        )}:`,
                                        error,
                                    );
                                    return false;
                                }
                            },
                        });

                        // Try to replace the property
                        try {
                            delete (window as any).ethereum;
                        } catch (e) {
                            // Ignore deletion errors
                        }

                        try {
                            Object.defineProperty(window, 'ethereum', {
                                value: safeEthereum,
                                writable: true,
                                configurable: true,
                                enumerable: true,
                            });
                        } catch (e) {
                            // If we can't define the property, store it internally
                            (window as any)._safeEthereum = safeEthereum;
                        }
                    }
                } catch (error) {
                    console.warn('Error in ensureEthereumSafety:', error);
                }
            };

            // Run the safety check
            ensureEthereumSafety();

            // Setup global extension error handler
            setupGlobalExtensionErrorHandler();

            // Also add a global error handler for ethereum-related errors
            const originalError = window.onerror;
            window.onerror = function (message, source, lineno, colno, error) {
                // Check for ethereum-related errors
                if (
                    typeof message === 'string' &&
                    (message.includes('ethereum') || message.includes('web3'))
                ) {
                    console.warn('Ethereum-related error caught:', message);
                    return true; // Prevent the error from propagating
                }

                // Check for VeWorld extension errors specifically
                if (
                    typeof message === 'string' &&
                    (message.includes('Attempt failed') || 
                     message.includes('VeWorldAPI') ||
                     source?.includes('chrome-extension'))
                ) {
                    console.warn('VeWorld extension error caught:', message);
                    return true; // Prevent the error from propagating
                }

                if (originalError) {
                    return originalError.call(
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

            // Cleanup function
            return () => {
                if (originalError) {
                    window.onerror = originalError;
                }
            };
        } catch (error) {
            console.warn('Error in Web3SafeInit:', error);
        }
    }, []);

    return null;
}
