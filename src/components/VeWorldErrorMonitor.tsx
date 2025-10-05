'use client';

import { useEffect } from 'react';
import {
	isExtensionError,
	createExtensionErrorHandler,
} from '@/lib/extension-error-handler';

/**
 * Component to monitor and handle VeWorld extension errors
 * This component runs silently and logs extension errors for debugging
 */
export function VeWorldErrorMonitor() {
	useEffect(() => {
		// Create a specific error handler for VeWorld
		const veWorldErrorHandler =
			createExtensionErrorHandler('VeWorld Connection');

		// Monitor console errors
		const originalConsoleError = console.error;
		console.error = function (...args) {
			try {
				// Check if this is a VeWorld error
				const errorText = args
					.map((arg) => {
						if (typeof arg === 'object' && arg !== null) {
							try {
								return JSON.stringify(arg);
							} catch (e) {
								return '[Circular Reference]';
							}
						}
						return String(arg);
					})
					.join(' ');

				// Check for avatar fetch errors
				if (
					errorText.includes('Failed to fetch') &&
					errorText.includes('testnet.vet.domains/api/avatar/')
				) {
					console.warn('Avatar fetch error intercepted, using fallback');
					return; // Don't log avatar fetch errors
				}

				if (isExtensionError({ message: errorText, stack: errorText })) {
					veWorldErrorHandler({ message: errorText });
					return; // Don't log extension errors to console
				}

				// Call original console.error for non-extension errors
				// Safely handle the arguments to prevent errors
				try {
					originalConsoleError.apply(console, args);
				} catch (applyError) {
					// If apply fails, try calling with stringified arguments
					originalConsoleError(
						...args.map((arg) => {
							if (typeof arg === 'object' && arg !== null) {
								try {
									return JSON.stringify(arg);
								} catch (e) {
									return '[Circular Reference]';
								}
							}
							return arg;
						})
					);
				}
			} catch (e) {
				// If anything fails in error handling, ignore it to prevent infinite loops
			}
		};

		// Monitor uncaught errors
		const handleUncaughtError = (event: ErrorEvent) => {
			try {
				const errorInfo = {
					message: event.message,
					source: event.filename,
					lineno: event.lineno,
					colno: event.colno,
					error: event.error,
				};

				if (isExtensionError(errorInfo)) {
					veWorldErrorHandler(errorInfo);
					event.preventDefault(); // Prevent the error from showing
				}
			} catch (e) {
				// If error handling fails, ignore it
			}
		};

		// Monitor unhandled promise rejections
		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			try {
				if (isExtensionError(event.reason)) {
					veWorldErrorHandler(event.reason);
					event.preventDefault(); // Prevent the error from showing
				}
			} catch (e) {
				// If error handling fails, ignore it
			}
		};

		// Add event listeners
		window.addEventListener('error', handleUncaughtError);
		window.addEventListener('unhandledrejection', handleUnhandledRejection);

		// Cleanup function
		return () => {
			console.error = originalConsoleError;
			window.removeEventListener('error', handleUncaughtError);
			window.removeEventListener(
				'unhandledrejection',
				handleUnhandledRejection
			);
		};
	}, []);

	// This component doesn't render anything
	return null;
}
