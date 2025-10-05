'use client';

import { Box, Heading, Text } from '@chakra-ui/react';
import { useSafeWallet } from '@/hooks/useSafeWallet';

export function ConnectionInfo() {
	const { connection } = useSafeWallet();

	return (
		<Box>
			<Heading size={'md'}>
				<b>Connection</b>
			</Heading>
			<Text data-testid="connection-type">
				Type: {String(connection.source?.type || 'unknown')}
			</Text>
			<Text data-testid="network">
				Network: {String(connection.network || 'unknown')}
			</Text>
		</Box>
	);
}
