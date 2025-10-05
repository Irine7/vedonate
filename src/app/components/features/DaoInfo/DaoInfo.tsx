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
	const { data: isValidPassport } = useIsPerson(account?.address);

	return (
		<Box>
			<Heading size={'md'}>VeBetterDAO</Heading>
			<Text data-testid="current-allocation-round-id">
				Current Allocations Round ID: {currentAllocationsRoundId}
			</Text>
			<Text data-testid="is-passport-valid">
				Is Passport Valid: {isValidPassport?.toString()}
			</Text>
		</Box>
	);
}
