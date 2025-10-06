'use client';

import { type ReactElement } from 'react';
import {
	Container,
	VStack,
	HStack,
	Box,
	Text,
	Heading,
	Button,
	SimpleGrid,
	Card,
	CardBody,
	CardHeader,
	Icon,
	Badge,
	useColorModeValue,
	Flex,
	Spacer,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	StatArrow,
	Alert,
	AlertIcon,
	Spinner,
} from '@chakra-ui/react';
import { useSafeWallet } from '@/hooks/useSafeWallet';
import { useVeDonate } from '@/hooks/useVeDonate';
import { WelcomeSection } from '../features/WelcomeSection/WelcomeSection';
import { DonationHistory } from './DonationHistory';
import { UploadCertificate } from './UploadCertificate';
import { DonorBadges } from './DonorBadges';

export default function VeDonateHome(): ReactElement {
	const { account, connection } = useSafeWallet();
	const {
		donorInfo,
		globalStats,
		b3trBalance,
		isLoading,
		error,
		registerDonor,
		isDeployer,
	} = useVeDonate();

	if (!account) {
		return <WelcomeSection />;
	}

	if (connection.isLoading || isLoading) {
		return (
			<Container maxW="container.xl" py={8}>
				<VStack spacing={4}>
					<Spinner size="xl" color="red.400" />
					<Text>Loading data from blockchain...</Text>
				</VStack>
			</Container>
		);
	}

	const bgColor = useColorModeValue('gray.50', 'gray.900');
	const cardBg = useColorModeValue('white', 'gray.800');

	// Если донор не зарегистрирован
	if (!donorInfo?.isRegistered) {
		return (
			<Container maxW="container.xl" py={8}>
				<VStack spacing={8} align="stretch">
					{error && (
						<Alert status="error">
							<AlertIcon />
							{error}
						</Alert>
					)}

					<Card bg={cardBg}>
						<CardBody textAlign="center" py={12}>
							<Heading size="lg" mb={4}>
								🩸 Welcome to VeDonate!
							</Heading>
							<Text fontSize="lg" mb={6} color="gray.600">
								To participate in the donation system, you need to register in
								the blockchain
							</Text>
							<Text fontSize="md" mb={8} color="gray.500">
								Registration is free and takes just a few seconds
							</Text>
						</CardBody>
					</Card>

					<SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
						<Card bg={cardBg}>
							<CardBody textAlign="center">
								<Icon boxSize={12} color="red.400" mb={4}>
									<Text fontSize="4xl">💰</Text>
								</Icon>
								<Heading size="md" mb={3}>
									B3TR Rewards
								</Heading>
								<Text color="gray.600">
									Receive B3TR tokens for each confirmed donation
								</Text>
							</CardBody>
						</Card>

						<Card bg={cardBg}>
							<CardBody textAlign="center">
								<Icon boxSize={12} color="orange.400" mb={4}>
									<Text fontSize="4xl">🏆</Text>
								</Icon>
								<Heading size="md" mb={3}>
									NFT Badges
								</Heading>
								<Text color="gray.600">
									Collect unique NFT badges for donation achievements
								</Text>
							</CardBody>
						</Card>

						<Card bg={cardBg}>
							<CardBody textAlign="center">
								<Icon boxSize={12} color="purple.400" mb={4}>
									<Text fontSize="4xl">🤖</Text>
								</Icon>
								<Heading size="md" mb={3}>
									AI Verification
								</Heading>
								<Text color="gray.600">
									Artificial intelligence verifies and confirms your donations
								</Text>
							</CardBody>
						</Card>
					</SimpleGrid>
				</VStack>
			</Container>
		);
	}

	return (
		<Container maxW="container.xl" py={8}>
			<VStack spacing={8} align="stretch">
				{error && (
					<Alert status="error">
						<AlertIcon />
						{error}
					</Alert>
				)}

				{/* Hero Section */}
				<Box textAlign="center" py={12}>
					<Heading
						size="2xl"
						mb={4}
						bgGradient="linear(to-r, red.400, orange.400)"
						bgClip="text"
					>
						🩸 VeDonate Dashboard
					</Heading>
					<Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
						Welcome, donor! Your data is synchronized with the blockchain
					</Text>
					{isDeployer && (
						<Badge colorScheme="purple" mt={2} fontSize="sm">
							👑 System Administrator
						</Badge>
					)}
				</Box>

				{/* Stats Dashboard */}
				<SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
					<Card bg={cardBg}>
						<CardBody>
							<Stat>
								<StatLabel>Total Donations</StatLabel>
								<StatNumber color="red.400">
									{Number(donorInfo?.totalDonations || 0n)}
								</StatNumber>
								<StatHelpText>
									<StatArrow type="increase" />
									Active Donor
								</StatHelpText>
							</Stat>
						</CardBody>
					</Card>

					<Card bg={cardBg}>
						<CardBody>
							<Stat>
								<StatLabel>B3TR Tokens</StatLabel>
								<StatNumber color="orange.400">
									{Number(b3trBalance / 10n ** 18n)} B3TR
								</StatNumber>
								<StatHelpText>Earned from donations</StatHelpText>
							</Stat>
						</CardBody>
					</Card>

					<Card bg={cardBg}>
						<CardBody>
							<Stat>
								<StatLabel>NFT Badges</StatLabel>
								<StatNumber color="purple.400">
									{Number(donorInfo?.totalDonations || 0n) > 0 ? '1' : '0'}
								</StatNumber>
								<StatHelpText>Achievements earned</StatHelpText>
							</Stat>
						</CardBody>
					</Card>

					<Card bg={cardBg}>
						<CardBody>
							<Stat>
								<StatLabel>Global Statistics</StatLabel>
								<StatNumber color="green.400">
									{globalStats ? Number(globalStats.totalDonations) : 0}
								</StatNumber>
								<StatHelpText>Total donations in system</StatHelpText>
							</Stat>
						</CardBody>
					</Card>
				</SimpleGrid>

				{/* Main Actions */}
				<SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
					{/* Upload Certificate */}
					<Card bg={cardBg}>
						<CardHeader>
							<Heading size="md">📸 Upload Donation Certificate</Heading>
						</CardHeader>
						<CardBody>
							<UploadCertificate />
						</CardBody>
					</Card>

					{/* AI Assistant */}
					<Card bg={cardBg}>
						<CardHeader>
							<Heading size="md">🤖 AI Assistant</Heading>
						</CardHeader>
						<CardBody>
							<Text color="gray.500">
								AI Assistant will be added in future versions
							</Text>
						</CardBody>
					</Card>
				</SimpleGrid>

				{/* Donation History & Badges */}
				<SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
					<DonationHistory />
					<DonorBadges />
				</SimpleGrid>

				{/* Blockchain Info */}
				<Card
					bg={cardBg}
					bgGradient="linear(to-r, blue.50, purple.50)"
					_dark={{ bgGradient: 'linear(to-r, blue.900, purple.900)' }}
				>
					<CardBody textAlign="center" py={8}>
						<Heading size="md" mb={4}>
							⛓️ Blockchain Data
						</Heading>
						<Text fontSize="sm" color="gray.600" mb={4}>
							Your donations are recorded in VeChain blockchain
						</Text>
						<HStack justify="center" spacing={4} fontSize="xs" color="gray.500">
							<Text>
								Address: {account?.slice(0, 6)}...{account?.slice(-4)}
							</Text>
							<Text>•</Text>
							<Text>
								Last donation:{' '}
								{donorInfo?.lastDonation
									? new Date(
											Number(donorInfo.lastDonation) * 1000
									  ).toLocaleDateString()
									: 'None'}
							</Text>
						</HStack>
					</CardBody>
				</Card>
			</VStack>
		</Container>
	);
}
