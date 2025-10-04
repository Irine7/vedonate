'use client';

import { ChakraProvider } from '@chakra-ui/react';
import './globals.css';
import dynamic from 'next/dynamic';
import { darkTheme } from './theme';
import '../lib/window-ethereum-fix';
import { Web3SafeInit } from '../components/Web3SafeInit';
import { NetworkErrorBoundary } from '../components/NetworkErrorBoundary';
import { VeWorldErrorMonitor } from '../components/VeWorldErrorMonitor';

const VechainKitProviderWrapper = dynamic(
    async () =>
        (await import('./providers/VechainKitProviderWrapper'))
            .VechainKitProviderWrapper,
    {
        ssr: false,
    },
);

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
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
                {/* Web3 Safe Initialization */}
                <Web3SafeInit />
                
                {/* VeWorld Error Monitor */}
                <VeWorldErrorMonitor />

                {/* Chakra UI Provider */}
                <ChakraProvider theme={darkTheme}>
                    {/* Network Error Boundary */}
                    <NetworkErrorBoundary>
                        {/* VechainKit Provider */}
                        <VechainKitProviderWrapper>
                            {children}
                        </VechainKitProviderWrapper>
                    </NetworkErrorBoundary>
                </ChakraProvider>
            </body>
        </html>
    );
}
