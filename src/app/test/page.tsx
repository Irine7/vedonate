'use client';

import { type ReactElement } from 'react';
import {
	Container,
	VStack,
	Heading,
	Text,
	Box,
	Button,
	HStack,
	Badge,
	Divider,
	Code,
	Alert,
	AlertIcon,
	AlertTitle,
	AlertDescription,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useSafeWallet } from '@/hooks/useSafeWallet';

export default function TestPage(): ReactElement {
	const { account, connection } = useSafeWallet();
	const [testResults, setTestResults] = useState<string[]>([]);

	const runTests = () => {
		const results: string[] = [];

		// Test 1: Wallet connection
		if (account) {
			results.push('✅ Wallet connected successfully');
		} else {
			results.push('❌ Wallet not connected');
		}

		// Test 2: Connection status
		if (connection.isLoading) {
			results.push('⏳ Connection is loading...');
		} else {
			results.push('✅ Connection status loaded');
		}

		// Test 3: Account address format
		if (
			account?.address &&
			account.address.length === 42 &&
			account.address.startsWith('0x')
		) {
			results.push('✅ Account address format is valid');
		} else if (account?.address) {
			results.push('❌ Account address format is invalid');
		}

		// Test 4: Browser environment
		if (typeof window !== 'undefined') {
			results.push('✅ Browser environment detected');
		} else {
			results.push('❌ Server-side rendering detected');
		}

		// Test 5: VeChain Kit availability
		try {
			if ((window as any).vechainKit) {
				results.push('✅ VeChain Kit is available');
			} else {
				results.push('❌ VeChain Kit not found');
			}
		} catch (error) {
			results.push('❌ VeChain Kit check failed');
		}

		setTestResults(results);
	};

	return (
		<Container
			height={'full'}
			maxW="container.lg"
			justifyContent={'center'}
			wordBreak={'break-word'}
			py={10}
		>
			<VStack spacing={8} alignItems="flex-start">
				<Box>
					<Heading size="xl" mb={2}>
						🧪 Test Page
					</Heading>
					<Text color="gray.400" fontSize="lg">
						Страница для тестирования функциональности приложения
					</Text>
				</Box>

				<Divider />

				<Box w="full">
					<Heading size="md" mb={4}>
						Wallet Status
					</Heading>
					<VStack spacing={3} align="stretch">
						<HStack>
							<Text fontWeight="bold">Account:</Text>
							{account ? (
								<Badge colorScheme="green" fontSize="sm">
									Connected
								</Badge>
							) : (
								<Badge colorScheme="red" fontSize="sm">
									Not Connected
								</Badge>
							)}
						</HStack>

						<HStack>
							<Text fontWeight="bold">Connection Status:</Text>
							{connection.isLoading ? (
								<Badge colorScheme="yellow" fontSize="sm">
									Loading
								</Badge>
							) : (
								<Badge colorScheme="blue" fontSize="sm">
									Ready
								</Badge>
							)}
						</HStack>

						{account?.address && (
							<Box>
								<Text fontWeight="bold" mb={2}>
									Account Address:
								</Text>
								<Code p={2} borderRadius="md" fontSize="sm">
									{account.address}
								</Code>
							</Box>
						)}
					</VStack>
				</Box>

				<Box w="full">
					<Heading size="md" mb={4}>
						System Tests
					</Heading>
					<Button colorScheme="blue" onClick={runTests} mb={4}>
						Run Tests
					</Button>

					{testResults.length > 0 && (
						<VStack spacing={2} align="stretch">
							{testResults.map((result, index) => (
								<Alert
									key={index}
									status={
										result.startsWith('✅')
											? 'success'
											: result.startsWith('❌')
											? 'error'
											: 'warning'
									}
									borderRadius="md"
								>
									<AlertIcon />
									<AlertDescription fontSize="sm">{result}</AlertDescription>
								</Alert>
							))}
						</VStack>
					)}
				</Box>

				<Box w="full">
					<Heading size="md" mb={4}>
						Environment Info
					</Heading>
					<VStack spacing={2} align="stretch">
						<HStack>
							<Text fontWeight="bold">User Agent:</Text>
							<Text fontSize="sm" color="gray.400">
								{typeof window !== 'undefined'
									? window.navigator.userAgent
									: 'N/A'}
							</Text>
						</HStack>

						<HStack>
							<Text fontWeight="bold">Platform:</Text>
							<Text fontSize="sm" color="gray.400">
								{typeof window !== 'undefined'
									? window.navigator.platform
									: 'N/A'}
							</Text>
						</HStack>

						<HStack>
							<Text fontWeight="bold">Language:</Text>
							<Text fontSize="sm" color="gray.400">
								{typeof window !== 'undefined'
									? window.navigator.language
									: 'N/A'}
							</Text>
						</HStack>
					</VStack>
				</Box>

				<Alert status="info" borderRadius="md">
					<AlertIcon />
					<Box>
						<AlertTitle>Test Page Info</AlertTitle>
						<AlertDescription>
							Эта страница предназначена для тестирования различных компонентов
							и функций приложения. Используйте кнопку "Run Tests" для проверки
							состояния системы.
						</AlertDescription>
					</Box>
				</Alert>
			</VStack>
		</Container>
	);
}
