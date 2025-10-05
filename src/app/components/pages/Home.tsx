'use client';

import { type ReactElement } from 'react';
import { Container, Spinner, VStack } from '@chakra-ui/react';
import { useSafeWallet } from '@/hooks/useSafeWallet';
import { AccountInfo } from '@/app/components/features/AccountInfo';
import { ConnectionInfo } from '@/app/components/features/ConnectionInfo';
import { DaoInfo } from '@/app/components/features/DaoInfo';
import { UIControls } from '@/app/components/features/UIControls';
import { LanguageSelector } from '@/app/components/features/LanguageSelector';
import { TransactionExamples } from '@/app/components/features/TransactionExamples';
import { SigningExample } from '@/app/components/features/SigningExample/SigningExample';
import { WelcomeSection } from '@/app/components/features/WelcomeSection';
import mixpanelClient from '@/lib/mixpanelClient';
import { useEffect } from 'react';

export default function Home(): ReactElement {
	const { account, connection } = useSafeWallet();

	// Track page view when component mounts and account is available
	useEffect(() => {
		if (account && !connection.isLoading && mixpanelClient.isMixpanelReady()) {
			mixpanelClient.trackEvent('Home Page Viewed', {
				account: account,
				timestamp: new Date().toISOString(),
			});
		}
	}, [account, connection.isLoading]);

	if (!account) {
		return <WelcomeSection />;
	}

	if (connection.isLoading) {
		return (
			<VStack w="full" h="full" justify="center" align="center">
				<Spinner />
			</VStack>
		);
	}

	return (
		<Container
			height={'full'}
			maxW="container.md"
			justifyContent={'center'}
			wordBreak={'break-word'}
		>
			<VStack spacing={10} mt={10} pb={10} alignItems="flex-start">
				<AccountInfo />
				<ConnectionInfo />
				<DaoInfo />
				<UIControls />
				<LanguageSelector />
				<TransactionExamples />
				<SigningExample />
			</VStack>
		</Container>
	);
}
