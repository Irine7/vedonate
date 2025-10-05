'use client';

import { useEffect } from 'react';

/**
 * Component to handle avatar loading errors from VeChain Kit
 * This intercepts fetch errors and provides fallbacks
 */
export function AvatarErrorBoundary({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		// Override the global fetch to handle avatar errors
		const originalFetch = window.fetch;

		window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
			const url = typeof input === 'string' ? input : input.toString();

			// Check if this is an avatar request
			if (url.includes('testnet.vet.domains/api/avatar/')) {
				try {
					// Try to use our proxy instead
					const proxyUrl = url.replace(
						'https://testnet.vet.domains/api/avatar/',
						'/api/avatar/'
					);
					return await originalFetch(proxyUrl, init);
				} catch (error) {
					console.warn('Avatar fetch failed, using fallback:', error);
					// Return a mock response for failed avatar requests
					return new Response('', {
						status: 404,
						statusText: 'Not Found',
					});
				}
			}

			// For all other requests, use the original fetch
			return originalFetch(input, init);
		};

		// Cleanup on unmount
		return () => {
			window.fetch = originalFetch;
		};
	}, []);

	return <>{children}</>;
}
