'use client';
import dynamic from 'next/dynamic';
import React from 'react';
import { useWallet } from '@vechain/vechain-kit';
import { ClientOnly } from '@/components/ClientOnly';

const TestInterface = dynamic(() => import('./components/TestInterface'), {
	ssr: false,
});

const UnauthorizedInterface = dynamic(
	() => import('./components/UnauthorizedInterface'),
	{
		ssr: false,
	}
);

const AuthorizedInterface = dynamic(
	() => import('./components/AuthorizedInterface'),
	{
		ssr: false,
	}
);

function MainContent() {
	const { account } = useWallet();

	// If user is authorized, show interface for authorized users
	if (account) {
		return <AuthorizedInterface />;
	}

	// Otherwise show interface for unauthorized users
	return <UnauthorizedInterface />;
}

export default function Page() {
	return (
		<ClientOnly
			fallback={
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
						<p className="text-gray-600 dark:text-gray-400">
							Loading VeDonate...
						</p>
					</div>
				</div>
			}
		>
			<MainContent />
		</ClientOnly>
	);
}
