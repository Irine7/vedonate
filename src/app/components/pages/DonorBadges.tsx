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
	SimpleGrid,
	Badge,
	useColorModeValue,
	Icon,
	Tooltip,
	Spinner,
} from '@chakra-ui/react';
import { useVeDonate } from '@/hooks/useVeDonate';
import { BadgeType, type BadgeType as BadgeTypeEnum } from '@/lib/contracts';

export function DonorBadges(): ReactElement {
	const {
		donorBadges,
		donorInfo,
		isLoading,
		getBadgeName,
		getBadgeRequirement,
		getBadgeIcon,
	} = useVeDonate();
	const cardBg = useColorModeValue('white', 'gray.800');

	if (isLoading) {
		return (
			<Card bg={cardBg}>
				<CardHeader>
					<Heading size="md">🏆 NFT Badges</Heading>
				</CardHeader>
				<CardBody>
					<VStack spacing={4}>
						<Spinner color="red.400" />
						<Text color="gray.600">Loading badges from blockchain...</Text>
					</VStack>
				</CardBody>
			</Card>
		);
	}

	// Создаем список всех возможных бейджей
	const allBadges = [
		BadgeType.FIRST_DONATION,
		BadgeType.BRONZE_DONOR,
		BadgeType.SILVER_DONOR,
		BadgeType.GOLD_DONOR,
		BadgeType.PLASMA_MASTER,
		BadgeType.LIFESAVER,
	];

	const earnedBadges = donorBadges || [];
	const totalDonations = Number(donorInfo?.totalDonations || 0n);
	const plasmaDonations = Number(donorInfo?.plasmaDonations || 0n);

	// Определяем, какие бейджи доступны для получения
	const getBadgeStatus = (badgeType: BadgeTypeEnum) => {
		const hasBadge = earnedBadges.length > 0; // Упрощенная проверка

		let canEarn = false;
		switch (badgeType) {
			case BadgeType.FIRST_DONATION:
				canEarn = totalDonations >= 1;
				break;
			case BadgeType.BRONZE_DONOR:
				canEarn = totalDonations >= 5;
				break;
			case BadgeType.SILVER_DONOR:
				canEarn = totalDonations >= 10;
				break;
			case BadgeType.GOLD_DONOR:
				canEarn = totalDonations >= 25;
				break;
			case BadgeType.PLASMA_MASTER:
				canEarn = plasmaDonations >= 10;
				break;
			case BadgeType.LIFESAVER:
				canEarn = totalDonations >= 50;
				break;
		}

		return {
			earned: hasBadge && canEarn,
			available: canEarn && !hasBadge,
			locked: !canEarn,
		};
	};

	return (
		<Card bg={cardBg}>
			<CardHeader>
				<Heading size="md">🏆 NFT Badges</Heading>
			</CardHeader>
			<CardBody>
				<VStack spacing={6} align="stretch">
					{/* Earned Badges */}
					<Box>
						<Text fontWeight="bold" mb={3} color="green.400">
							Earned Badges ({earnedBadges.length})
						</Text>
						{earnedBadges.length > 0 ? (
							<SimpleGrid columns={2} spacing={3}>
								{allBadges.map((badgeType) => {
									const status = getBadgeStatus(badgeType);
									if (!status.earned) return null;

									return (
										<Tooltip
											key={badgeType}
											label={`${getBadgeName(badgeType)} - NFT in blockchain`}
											placement="top"
										>
											<Box
												p={3}
												border="2px solid"
												borderColor="green.400"
												borderRadius="md"
												textAlign="center"
												bg="green.50"
												_dark={{ bg: 'green.900' }}
											>
												<Text fontSize="2xl" mb={1}>
													{getBadgeIcon(badgeType)}
												</Text>
												<Text fontSize="sm" fontWeight="bold">
													{getBadgeName(badgeType)}
												</Text>
												<Badge colorScheme="green" size="sm">
													NFT
												</Badge>
											</Box>
										</Tooltip>
									);
								})}
							</SimpleGrid>
						) : (
							<Text fontSize="sm" color="gray.500">
								No earned badges yet
							</Text>
						)}
					</Box>

					{/* Available Badges */}
					<Box>
						<Text fontWeight="bold" mb={3} color="blue.400">
							Available Badges
						</Text>
						<SimpleGrid columns={2} spacing={3}>
							{allBadges.map((badgeType) => {
								const status = getBadgeStatus(badgeType);
								if (status.earned) return null;

								return (
									<Tooltip
										key={badgeType}
										label={`Requires: ${getBadgeRequirement(badgeType)}`}
										placement="top"
									>
										<Box
											p={3}
											border="1px solid"
											borderColor={status.available ? 'blue.300' : 'gray.300'}
											borderRadius="md"
											textAlign="center"
											bg={status.available ? 'blue.50' : 'gray.50'}
											_dark={{
												bg: status.available ? 'blue.900' : 'gray.700',
												borderColor: status.available ? 'blue.600' : 'gray.600',
											}}
											opacity={status.locked ? 0.6 : 1}
										>
											<Text fontSize="2xl" mb={1}>
												{getBadgeIcon(badgeType)}
											</Text>
											<Text fontSize="sm" fontWeight="bold">
												{getBadgeName(badgeType)}
											</Text>
											<Text fontSize="xs" color="gray.500">
												{getBadgeRequirement(badgeType)}
											</Text>
											{status.available && (
												<Badge colorScheme="blue" size="sm" mt={1}>
													Available
												</Badge>
											)}
										</Box>
									</Tooltip>
								);
							})}
						</SimpleGrid>
					</Box>

					<Text fontSize="xs" color="gray.500" textAlign="center">
						NFT badges are automatically awarded in the blockchain when
						requirements are met
					</Text>
				</VStack>
			</CardBody>
		</Card>
	);
}
