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
					<Heading size="md">📊 История донаций</Heading>
				</CardHeader>
				<CardBody>
					<VStack spacing={4}>
						<Spinner color="red.400" />
						<Text color="gray.600">Загрузка данных из блокчейна...</Text>
					</VStack>
				</CardBody>
			</Card>
		);
	}

	return (
		<Card bg={cardBg}>
			<CardHeader>
				<Heading size="md">📊 История донаций</Heading>
			</CardHeader>
			<CardBody>
				{donorDonations.length === 0 ? (
					<Box textAlign="center" py={8}>
						<Text fontSize="lg" color="gray.500" mb={4}>
							У вас пока нет донаций
						</Text>
						<Text fontSize="sm" color="gray.400">
							После первой донации здесь появится история из блокчейна
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
								_dark={{ borderColor: 'gray.600' }}
								bg="gray.50"
								_dark={{ bg: 'gray.700' }}
							>
								<HStack justify="space-between" mb={2}>
									<HStack>
										<Text fontWeight="bold">
											{new Date(
												Number(donation.timestamp) * 1000
											).toLocaleDateString('ru-RU')}
										</Text>
										<Badge
											colorScheme={
												donation.donationType === 'blood' ? 'red' : 'orange'
											}
											variant="subtle"
										>
											{donation.donationType === 'blood' ? 'Кровь' : 'Плазма'}
										</Badge>
									</HStack>
									<Badge colorScheme="green" variant="solid">
										✓ Подтверждено
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
										⛓️ Записано в блокчейн VeChain
									</Text>
								</Box>
							</Box>
						))}

						<Button variant="outline" size="sm">
							Показать все донации в Explorer
						</Button>
					</VStack>
				)}
			</CardBody>
		</Card>
	);
}
