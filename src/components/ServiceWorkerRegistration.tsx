'use client';

import { useEffect } from 'react';

/**
 * Component to register Service Worker and prevent 404 errors
 */
export function ServiceWorkerRegistration() {
	useEffect(() => {
		if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
			// Register service worker
			navigator.serviceWorker
				.register('/sw.js')
				.then((registration) => {
					console.log('Service Worker registered successfully:', registration);
				})
				.catch((error) => {
					console.log('Service Worker registration failed:', error);
				});

			// Handle service worker updates
			navigator.serviceWorker.addEventListener('controllerchange', () => {
				window.location.reload();
			});
		}
	}, []);

	return null;
}
