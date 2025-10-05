// Simple Service Worker to prevent 404 errors
// This is a minimal service worker that doesn't interfere with the app

const CACHE_NAME = 'vedonate-v1';
const urlsToCache = ['/', '/static/js/bundle.js', '/static/css/main.css'];

// Install event - cache resources
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				return cache.addAll(urlsToCache);
			})
			.catch((error) => {
				console.log('Service Worker install failed:', error);
			})
	);
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches
			.match(event.request)
			.then((response) => {
				// Return cached version or fetch from network
				return response || fetch(event.request);
			})
			.catch(() => {
				// If both cache and network fail, return a fallback
				if (event.request.destination === 'document') {
					return caches.match('/');
				}
			})
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});
