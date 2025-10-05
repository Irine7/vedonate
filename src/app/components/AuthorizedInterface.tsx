'use client';

import React from 'react';
import { useVeDonate } from '@/hooks/useVeDonate';
import { useSafeWallet } from '@/hooks/useSafeWallet';
import { DonorStats } from '@/app/components/features/DonorStats';
import { NewDonorWelcome } from '@/app/components/features/NewDonorWelcome';
import {
	Box,
	Container,
	VStack,
	HStack,
	Heading,
	Text,
	Card,
	CardBody,
	useColorModeValue,
	Badge,
	Alert,
	AlertIcon,
	AlertTitle,
	AlertDescription,
} from '@chakra-ui/react';

const AuthorizedInterface: React.FC = () => {
	const { account, connection, connectedWallet } = useSafeWallet();
	const isConnectionReady = connection && connection.thor;

	const {
		donorInfo,
		donorDonations,
		donorBadges,
		globalStats,
		b3trBalance,
		isLoading,
		error,
		getBadgeName,
		getBadgeRequirement,
		getBadgeIcon,
		isDeployer,
	} = useVeDonate();

	const bgGradient = useColorModeValue(
		'linear(to-br, orange.50, red.50, pink.50)',
		'linear(to-br, gray.900, gray.800, gray.900)'
	);
	const cardBg = useColorModeValue('white', 'gray.800');
	const textColor = useColorModeValue('gray.800', 'white');
	const subtextColor = useColorModeValue('gray.600', 'gray.300');

	const formatAddress = (address: string) => {
		if (!address || typeof address !== 'string') {
			return 'N/A';
		}
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	return (
		<Box minH="100vh" bg={bgGradient}>
			<Container maxW="container.xl" py={8}>
				<VStack spacing={8} align="stretch">
					{/* Header */}
					<Card bg={cardBg} shadow="lg">
						<CardBody p={6}>
							<HStack justify="space-between" align="center">
								<VStack align="start" spacing={2}>
									<Heading size="lg" color={textColor}>
										Добро пожаловать!
									</Heading>
								</VStack>
								<HStack spacing={4}>
									<Badge colorScheme="green" px={2} py={1}>
										🟢 Подключен
									</Badge>
									{isDeployer && (
										<Badge colorScheme="blue" variant="subtle" px={3} py={1}>
											🔑 Деплойер
										</Badge>
									)}
								</HStack>
							</HStack>
						</CardBody>
					</Card>

					{/* Error Alert */}
					{error && (
						<Alert status="error" borderRadius="lg">
							<AlertIcon />
							<Box>
								<AlertTitle>Ошибка!</AlertTitle>
								<AlertDescription>{error}</AlertDescription>
							</Box>
						</Alert>
					)}

					{/* Donor Statistics or Welcome */}
					{donorInfo ? (
						<DonorStats account={account as string} />
					) : (
						<NewDonorWelcome account={account as string} />
					)}
				</VStack>
			</Container>
		</Box>
	);
};

export default AuthorizedInterface;
