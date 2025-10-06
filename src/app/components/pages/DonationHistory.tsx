'use client';

import { type ReactElement } from 'react';
import {
	Box,
	VStack,
	Text,
	Heading,
	Card,
	CardBody,
	CardHeader,
	HStack,
	Badge,
	Button,
	useColorModeValue,
	Spinner,
} from '@chakra-ui/react';
import { useVeDonate } from '@/hooks/useVeDonate';

export function DonationHistory(): ReactElement {
	const { donorDonations, isLoading } = useVeDonate();
	const cardBg = useColorModeValue('white', 'gray.800');

	if (isLoading) {
		return (
			<Card bg={cardBg}>
				<CardHeader>
					<Heading size="md">📊 Donation History</Heading>
				</CardHeader>
				<CardBody>
					<VStack spacing={4}>
						<Spinner color="red.400" />
						<Text color="gray.600">Loading data from blockchain...</Text>
					</VStack>
				</CardBody>
			</Card>
		);
	}

	return (
		<Card bg={cardBg}>
			<CardHeader>
				<Heading size="md">📊 Donation History</Heading>
			</CardHeader>
			<CardBody>
				{donorDonations.length === 0 ? (
					<Box textAlign="center" py={8}>
						<Text fontSize="lg" color="gray.500" mb={4}>
							You don't have any donations yet
						</Text>
						<Text fontSize="sm" color="gray.400">
							After your first donation, blockchain history will appear here
						</Text>
					</Box>
				) : (
					<VStack spacing={4} align="stretch">
						{donorDonations.map((donation, index) => (
							<Box
								key={index}
								p={4}
								border="1px solid"
								borderColor="gray.200"
								borderRadius="md"
								bg="gray.50"
								_dark={{ borderColor: 'gray.600', bg: 'gray.700' }}
							>
								<HStack justify="space-between" mb={2}>
									<HStack>
										<Text fontWeight="bold">
											{new Date(
												Number(donation.timestamp) * 1000
											).toLocaleDateString('en-US')}
										</Text>
										<Badge
											colorScheme={
												donation.donationType === 'blood' ? 'red' : 'orange'
											}
											variant="subtle"
										>
											{donation.donationType === 'blood' ? 'Blood' : 'Plasma'}
										</Badge>
									</HStack>
									<Badge colorScheme="green" variant="solid">
										✓ Confirmed
									</Badge>
								</HStack>

								<HStack justify="space-between">
									<VStack align="start" spacing={1}>
										<Text fontSize="sm" color="gray.600">
											{donation.centerId}
										</Text>
										<Text fontSize="sm" color="gray.600">
											{Number(donation.amount)} мл
										</Text>
									</VStack>
									<Text fontWeight="bold" color="orange.400">
										+{Number(donation.b3trReward / 10n ** 18n)} B3TR
									</Text>
								</HStack>

								{/* Blockchain info */}
								<Box
									mt={2}
									pt={2}
									borderTop="1px solid"
									borderColor="gray.300"
									_dark={{ borderColor: 'gray.600' }}
								>
									<Text fontSize="xs" color="gray.500">
										⛓️ Recorded in VeChain blockchain
									</Text>
								</Box>
							</Box>
						))}

						<Button variant="outline" size="sm">
							View all donations in Explorer
						</Button>
					</VStack>
				)}
			</CardBody>
		</Card>
	);
}
