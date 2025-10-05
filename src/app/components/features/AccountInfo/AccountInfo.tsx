'use client';

import { Box, Heading, Text, Spinner } from '@chakra-ui/react';
import { useGetB3trBalance } from '@vechain/vechain-kit';
import { useSafeWallet } from '@/hooks/useSafeWallet';

export function AccountInfo() {
	const { smartAccount, connectedWallet } = useSafeWallet();

	// Only use B3TR balance hook if smartAccount.address exists
	const { data: b3trBalance, isLoading: b3trBalanceLoading } =
		useGetB3trBalance(smartAccount.address ?? undefined);

	return (
		<>
			{smartAccount.address && (
				<Box>
					<Heading size={'md'}>
						<b>Smart Account</b>
					</Heading>
					<Text data-testid="smart-account-address">
						Smart Account: {smartAccount.address}
					</Text>
					<Text data-testid="is-sa-deployed">
						Deployed: {smartAccount.isDeployed.toString()}
					</Text>
					{b3trBalanceLoading ? (
						<Spinner />
					) : (
						<Text data-testid="b3tr-balance">
							B3TR Balance: {b3trBalance?.formatted}
						</Text>
					)}
				</Box>
			)}

			<Box>
				<Heading size={'md'}>
					<b>Wallet</b>
				</Heading>
				<Text data-testid="connected-wallet-address">
					Address:{' '}
					{typeof connectedWallet?.address === 'string'
						? connectedWallet.address
						: connectedWallet?.address?.address || 'N/A'}
				</Text>
			</Box>
		</>
	);
}
