'use client';

import { ChakraProvider, Box } from '@chakra-ui/react';
import './globals.css';
import dynamic from 'next/dynamic';
import { darkTheme } from './theme';
import '../lib/window-ethereum-fix';
import { Web3SafeInit } from '../components/Web3SafeInit';
import { NetworkErrorBoundary } from '../components/NetworkErrorBoundary';
import { VeWorldErrorMonitor } from '../components/VeWorldErrorMonitor';
import { AvatarErrorBoundary } from '../components/AvatarErrorBoundary';
import { Header } from './components/Header';
import { Suspense } from 'react';
import { ClientOnly } from '../components/ClientOnly';
import { HeaderPlaceholder } from '../components/HeaderPlaceholder';
import { HydrationBoundary } from '../components/HydrationBoundary';
import { ServiceWorkerRegistration } from '../components/ServiceWorkerRegistration';

const VechainKitProviderWrapper = dynamic(
	async () =>
		(await import('./providers/VechainKitProviderWrapper'))
			.VechainKitProviderWrapper,
	{
		ssr: false,
	}
);

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning={true}>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#1a202c" />
				<meta
					name="description"
					content="VeDonate - Decentralized donation platform"
				/>
				<link rel="manifest" href="/manifest.json" />
				{/* Early ethereum fix to prevent extension conflicts */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
                            (function() {
                                'use strict';
                                let originalEthereum = null;
                                try { originalEthereum = window.ethereum; } catch (e) {}
                                try {
                                    try { delete window.ethereum; } catch (e) {}
                                    Object.defineProperty(window, 'ethereum', {
                                        get: function() {
                                            try { return window._internalEthereum || originalEthereum; } catch (e) { return originalEthereum; }
                                        },
                                        set: function(value) {
                                            try { window._internalEthereum = value; } catch (e) {}
                                        },
                                        configurable: true,
                                        enumerable: true
                                    });
                                } catch (e) {
                                    try {
                                        Object.defineProperty(window, 'ethereum', {
                                            value: originalEthereum,
                                            writable: true,
                                            configurable: true,
                                            enumerable: true
                                        });
                                    } catch (e2) {
                                        console.warn('Could not fix ethereum property:', e2);
                                    }
                                }
                            })();
                        `,
					}}
				/>
			</head>
			<body>
				{/* Service Worker Registration */}
				<ClientOnly>
					<ServiceWorkerRegistration />
				</ClientOnly>

				{/* Prevent 404 errors for common requests */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
							// Prevent 404 errors for common requests
							if (typeof window !== 'undefined') {
								// Handle service worker registration errors
								if ('serviceWorker' in navigator) {
									navigator.serviceWorker.getRegistrations().then(registrations => {
										registrations.forEach(registration => {
											if (registration.scope.includes('/sw.js')) {
												registration.unregister();
											}
										});
									});
								}
							}
						`,
					}}
				/>

				{/* Web3 Safe Initialization */}
				<ClientOnly>
					<Web3SafeInit />
				</ClientOnly>

				{/* VeWorld Error Monitor */}
				<ClientOnly>
					<VeWorldErrorMonitor />
				</ClientOnly>

				{/* Avatar Error Boundary */}
				<ClientOnly>
					<AvatarErrorBoundary>
						{/* Chakra UI Provider */}
						<ChakraProvider theme={darkTheme}>
							{/* Network Error Boundary */}
							<NetworkErrorBoundary>
								{/* Hydration Boundary */}
								<HydrationBoundary
									fallback={
										<>
											{/* Header placeholder */}
											<HeaderPlaceholder />
											{/* Main Content */}
											<Box pt={16}>{children}</Box>
										</>
									}
								>
									{/* VechainKit Provider */}
									<ClientOnly
										fallback={
											<>
												{/* Header placeholder */}
												<HeaderPlaceholder />
												{/* Main Content */}
												<Box pt={16}>{children}</Box>
											</>
										}
									>
										<VechainKitProviderWrapper>
											<Suspense
												fallback={
													<>
														{/* Header placeholder */}
														<HeaderPlaceholder />
														{/* Main Content */}
														<Box pt={16}>{children}</Box>
													</>
												}
											>
												{/* Header */}
												<Header />
												{/* Main Content */}
												<Box pt={16}>{children}</Box>
											</Suspense>
										</VechainKitProviderWrapper>
									</ClientOnly>
								</HydrationBoundary>
							</NetworkErrorBoundary>
						</ChakraProvider>
					</AvatarErrorBoundary>
				</ClientOnly>
			</body>
		</html>
	);
}
