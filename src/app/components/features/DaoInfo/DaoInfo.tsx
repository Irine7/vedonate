'use client';

import { Box, Heading, Text } from '@chakra-ui/react';
import {
	useCurrentAllocationsRoundId,
	useIsPerson,
} from '@vechain/vechain-kit';
import { useSafeWallet } from '@/hooks/useSafeWallet';

export function DaoInfo() {
	const { account } = useSafeWallet();
	const { data: currentAllocationsRoundId } = useCurrentAllocationsRoundId();
	const accountAddress =
		typeof account === 'string' ? account : account?.address;
	const { data: isValidPassport } = useIsPerson(accountAddress);

	return (
		<Box>
			<Heading size={'md'}>VeBetterDAO</Heading>
			<Text data-testid="current-allocation-round-id">
				Current Allocations Round ID:{' '}
				{String(currentAllocationsRoundId || 'N/A')}
			</Text>
			<Text data-testid="is-passport-valid">
				Is Passport Valid: {String(isValidPassport ?? 'N/A')}
			</Text>
		</Box>
	);
}
