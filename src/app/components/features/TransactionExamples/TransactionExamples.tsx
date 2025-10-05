'use client';

import { Box, Button, Heading, HStack, useToast } from '@chakra-ui/react';
import { useSafeWallet } from '@/hooks/useSafeWallet';
import { useCallback, useState } from 'react';

export function TransactionExamples() {
	const { account } = useSafeWallet();
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);

	const handleSimpleTransaction = useCallback(async () => {
		if (!account?.address) {
			toast({
				title: 'Wallet not connected',
				description: 'Please connect your wallet first',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		setIsLoading(true);
		try {
			// Simulate a transaction
			await new Promise((resolve) => setTimeout(resolve, 2000));

			toast({
				title: 'Transaction successful!',
				description: `Transaction completed for ${account.address}`,
				status: 'success',
				duration: 3000,
				isClosable: true,
			});
		} catch (error) {
			toast({
				title: 'Transaction failed',
				description: error instanceof Error ? error.message : 'Unknown error',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	}, [account, toast]);

	const handleTestConnection = useCallback(async () => {
		if (!account?.address) {
			toast({
				title: 'Wallet not connected',
				description: 'Please connect your wallet first',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		toast({
			title: 'Connection test',
			description: `Wallet connected: ${account.address}`,
			status: 'info',
			duration: 3000,
			isClosable: true,
		});
	}, [account, toast]);

	return (
		<Box>
			<Heading size="md">
				<b>Test Transactions</b>
			</Heading>
			<HStack mt={4} spacing={4}>
				<Button
					onClick={handleSimpleTransaction}
					isLoading={isLoading}
					isDisabled={isLoading}
					data-testid="tx-simple-button"
					colorScheme="blue"
				>
					{isLoading ? 'Processing...' : 'Test Transaction'}
				</Button>
				<Button
					onClick={handleTestConnection}
					data-testid="test-connection-button"
					colorScheme="green"
					variant="outline"
				>
					Test Connection
				</Button>
			</HStack>
		</Box>
	);
}
