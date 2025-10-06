'use client';

import React, { useState } from 'react';
import {
	Box,
	Card,
	CardBody,
	VStack,
	HStack,
	Heading,
	Text,
	SimpleGrid,
	Badge,
	Progress,
	Divider,
	useColorModeValue,
	Grid,
	GridItem,
	Icon,
	Flex,
	Spacer,
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	useDisclosure,
	FormControl,
	FormLabel,
	Input,
	Select,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
	useToast,
} from '@chakra-ui/react';
import { useVeDonate } from '@/hooks/useVeDonate';

interface DonorStatsProps {
	account: string;
}

export function DonorStats({ account }: DonorStatsProps) {
	const {
		donorInfo,
		donorDonations,
		donorBadges,
		b3trBalance,
		getBadgeName,
		getBadgeRequirement,
		getBadgeIcon,
		addDonation,
		isLoading,
		isDeployer,
	} = useVeDonate();

	// Get user profile from localStorage
	const getUserProfile = () => {
		try {
			const profileData = localStorage.getItem(`userProfile_${account}`);
			return profileData ? JSON.parse(profileData) : null;
		} catch {
			return null;
		}
	};

	const userProfile = getUserProfile();

	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();

	const [donationForm, setDonationForm] = useState({
		donationType: 'blood',
		amount: 450,
		centerId: '',
	});

	const cardBg = useColorModeValue('white', 'gray.800');
	const textColor = useColorModeValue('gray.800', 'white');
	const subtextColor = useColorModeValue('gray.600', 'gray.300');
	const borderColor = useColorModeValue('gray.200', 'gray.600');

	const handleAddDonation = async () => {
		if (!donationForm.centerId.trim()) {
			toast({
				title: 'Error',
				description: 'Please specify the donation center ID',
				status: 'error',
				duration: 3000,
				isClosable: true,
				position: 'bottom-left',
			});
			return;
		}

		try {
			if (isDeployer) {
				await addDonation(
					account,
					donationForm.donationType,
					donationForm.amount,
					donationForm.centerId
				);
				toast({
					title: 'Success!',
					description: 'Donation added!',
					status: 'success',
					duration: 5000,
					isClosable: true,
					position: 'bottom-left',
				});
			} else {
				toast({
					title: 'Donation sent for verification',
					description:
						'Your donation will be verified and added by an administrator.',
					status: 'info',
					duration: 5000,
					isClosable: true,
					position: 'bottom-left',
				});
			}

			onClose();
			// Reset form
			setDonationForm({
				donationType: 'blood',
				amount: 450,
				centerId: '',
			});
		} catch (err) {
			toast({
				title: 'Error',
				description: err instanceof Error ? err.message : 'Unknown error',
				status: 'error',
				duration: 5000,
				isClosable: true,
				position: 'bottom-left',
			});
		}
	};

	if (!donorInfo) {
		return (
			<Card bg={cardBg} shadow="lg">
				<CardBody p={6}>
					<Text color={subtextColor} textAlign="center">
						Loading statistics...
					</Text>
				</CardBody>
			</Card>
		);
	}

	const totalDonations = Number(donorInfo.totalDonations);
	const currentLevel = Math.floor(totalDonations / 5);
	const nextLevel = currentLevel + 1;
	const progressToNext = ((totalDonations % 5) / 5) * 100;
	const donationsNeeded = 5 - (totalDonations % 5);

	const formatDate = (timestamp: number) => {
		return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const getDonationTypeEmoji = (type: string) => {
		switch (type.toLowerCase()) {
			case 'blood':
				return '🩸';
			case 'plasma':
				return '🩹';
			case 'platelets':
				return '🩺';
			case 'bone_marrow':
				return '🦴';
			default:
				return '💉';
		}
	};

	return (
		<VStack spacing={6} align="stretch">
			{/* Заголовок */}
			<Heading size="lg" color={textColor} textAlign="center">
				📊 Donation Statistics
				{userProfile && (
					<Text fontSize="md" color={subtextColor} fontWeight="normal" mt={2}>
						Welcome, {userProfile.firstName} {userProfile.lastName}!
					</Text>
				)}
			</Heading>

			{/* Основная статистика */}
			<SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
				<Card bg={cardBg} shadow="md" borderColor="red.200" borderWidth="1px">
					<CardBody p={4}>
						<VStack spacing={2}>
							<Icon fontSize="2xl" color="red.500">
								🩸
							</Icon>
							<Text fontSize="2xl" fontWeight="bold" color="red.500">
								{totalDonations}
							</Text>
							<Text fontSize="sm" color={subtextColor} textAlign="center">
								Total Donations
							</Text>
						</VStack>
					</CardBody>
				</Card>

				<Card
					bg={cardBg}
					shadow="md"
					borderColor="orange.200"
					borderWidth="1px"
				>
					<CardBody p={4}>
						<VStack spacing={2}>
							<Icon fontSize="2xl" color="orange.500">
								🪙
							</Icon>
							<Text fontSize="2xl" fontWeight="bold" color="orange.500">
								{b3trBalance?.toString() || '0'}
							</Text>
							<Text fontSize="sm" color={subtextColor} textAlign="center">
								B3TR Tokens
							</Text>
						</VStack>
					</CardBody>
				</Card>

				<Card
					bg={cardBg}
					shadow="md"
					borderColor="purple.200"
					borderWidth="1px"
				>
					<CardBody p={4}>
						<VStack spacing={2}>
							<Icon fontSize="2xl" color="purple.500">
								🏆
							</Icon>
							<Text fontSize="2xl" fontWeight="bold" color="purple.500">
								{currentLevel}
							</Text>
							<Text fontSize="sm" color={subtextColor} textAlign="center">
								Current Level
							</Text>
						</VStack>
					</CardBody>
				</Card>

				<Card bg={cardBg} shadow="md" borderColor="green.200" borderWidth="1px">
					<CardBody p={4}>
						<VStack spacing={2}>
							<Icon fontSize="2xl" color="green.500">
								💎
							</Icon>
							<Text fontSize="2xl" fontWeight="bold" color="green.500">
								{donorBadges?.length || 0}
							</Text>
							<Text fontSize="sm" color={subtextColor} textAlign="center">
								NFT Badges
							</Text>
						</VStack>
					</CardBody>
				</Card>
			</SimpleGrid>

			{/* Прогресс до следующего уровня */}
			<Card bg={cardBg} shadow="lg">
				<CardBody p={6}>
					<VStack spacing={4}>
						<Heading size="md" color={textColor}>
							🎯 Progress to Next Level
						</Heading>
						<VStack spacing={2} w="full">
							<HStack justify="space-between" w="full">
								<Text color={subtextColor}>
									Level {currentLevel} → {nextLevel}
								</Text>
								<Badge colorScheme="purple" variant="subtle">
									{donationsNeeded} donations to level
								</Badge>
							</HStack>
							<Progress
								value={progressToNext}
								size="lg"
								colorScheme="purple"
								borderRadius="full"
								w="full"
							/>
							<Text fontSize="sm" color={subtextColor}>
								{totalDonations % 5} of 5 donations
							</Text>
						</VStack>
					</VStack>
				</CardBody>
			</Card>

			{/* NFT бейджи */}
			{donorBadges && donorBadges.length > 0 && (
				<Card bg={cardBg} shadow="lg">
					<CardBody p={6}>
						<VStack spacing={4}>
							<Heading size="md" color={textColor}>
								🏆 Your NFT Badges
							</Heading>
							<Grid
								templateColumns={{
									base: '1fr',
									md: 'repeat(2, 1fr)',
									lg: 'repeat(3, 1fr)',
								}}
								gap={4}
								w="full"
							>
								{donorBadges.map((badge, index) => (
									<GridItem key={index}>
										<Card
											bg="gray.50"
											borderWidth="1px"
											borderColor={borderColor}
										>
											<CardBody p={4}>
												<VStack spacing={2}>
													<Text fontSize="2xl">{getBadgeIcon(badge)}</Text>
													<Text
														fontWeight="bold"
														fontSize="sm"
														color={textColor}
														textAlign="center"
													>
														{getBadgeName(badge as any)}
													</Text>
													<Badge
														colorScheme="purple"
														variant="subtle"
														fontSize="xs"
													>
														Level {badge.toString()}
													</Badge>
												</VStack>
											</CardBody>
										</Card>
									</GridItem>
								))}
							</Grid>
						</VStack>
					</CardBody>
				</Card>
			)}

			{/* История донаций */}
			{donorDonations && donorDonations.length > 0 && (
				<Card bg={cardBg} shadow="lg">
					<CardBody p={6}>
						<VStack spacing={4}>
							<Heading size="md" color={textColor}>
								📋 Donation History
							</Heading>
							<VStack spacing={3} w="full">
								{donorDonations.slice(0, 10).map((donation, index) => (
									<Box key={index} w="full">
										<HStack
											justify="space-between"
											align="center"
											p={3}
											bg="gray.50"
											borderRadius="md"
										>
											<HStack spacing={3}>
												<Text fontSize="xl">
													{getDonationTypeEmoji(donation.donationType)}
												</Text>
												<VStack align="start" spacing={1}>
													<Text fontWeight="medium" color={textColor}>
														{getBadgeName(donation.donationType as any)}
													</Text>
													<Text fontSize="sm" color={subtextColor}>
														{formatDate(Number(donation.timestamp))}
													</Text>
												</VStack>
											</HStack>
											<VStack align="end" spacing={1}>
												<Badge colorScheme="green" variant="subtle">
													+{donation.amount} B3TR
												</Badge>
												<Text fontSize="xs" color={subtextColor}>
													Center #{donation.centerId}
												</Text>
											</VStack>
										</HStack>
										{index < donorDonations.slice(0, 10).length - 1 && (
											<Divider mt={2} />
										)}
									</Box>
								))}
							</VStack>
							{donorDonations.length > 10 && (
								<Text fontSize="sm" color={subtextColor} textAlign="center">
									And {donorDonations.length - 10} more donations...
								</Text>
							)}
						</VStack>
					</CardBody>
				</Card>
			)}

			{/* Информация о регистрации */}
			<Card bg={cardBg} shadow="lg" borderColor="green.200" borderWidth="1px">
				<CardBody p={6}>
					<VStack spacing={4}>
						<HStack spacing={4} w="full">
							<Icon fontSize="3xl" color="green.500">
								✅
							</Icon>
							<VStack align="start" spacing={1} flex={1}>
								<Text fontWeight="bold" color={textColor}>
									{userProfile
										? `${userProfile.firstName} ${userProfile.lastName}`
										: 'Donor Registered'}
								</Text>
								<Text fontSize="sm" color={subtextColor}>
									{userProfile
										? `Registered ${new Date(
												userProfile.registeredAt
										  ).toLocaleDateString('en-US')}`
										: 'You are successfully registered in the VeDonate system'}
								</Text>
								{userProfile?.email && (
									<Text fontSize="xs" color={subtextColor}>
										📧 {userProfile.email}
									</Text>
								)}
								{userProfile?.phone && (
									<Text fontSize="xs" color={subtextColor}>
										📱 {userProfile.phone}
									</Text>
								)}
							</VStack>
							<Badge colorScheme="green" variant="subtle" px={3} py={1}>
								Active
							</Badge>
						</HStack>
						<Button
							colorScheme="orange"
							variant="outline"
							size="md"
							onClick={onOpen}
							leftIcon={<Icon>🩸</Icon>}
							w="full"
						>
							Add Donation
						</Button>
					</VStack>
				</CardBody>
			</Card>

			{/* Add Donation Modal */}
			<Modal isOpen={isOpen} onClose={onClose} size="lg">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>🩸 Add Donation</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<VStack spacing={4}>
							<FormControl>
								<FormLabel>Donation Type</FormLabel>
								<Select
									value={donationForm.donationType}
									onChange={(e) =>
										setDonationForm({
											...donationForm,
											donationType: e.target.value,
										})
									}
								>
									<option value="blood">Blood</option>
									<option value="plasma">Plasma</option>
									<option value="platelets">Platelets</option>
									<option value="bone_marrow">Bone Marrow</option>
								</Select>
							</FormControl>

							<FormControl>
								<FormLabel>Volume (ml)</FormLabel>
								<NumberInput
									value={donationForm.amount}
									onChange={(_, value) =>
										setDonationForm({ ...donationForm, amount: value })
									}
									min={50}
									max={1000}
								>
									<NumberInputField />
									<NumberInputStepper>
										<NumberIncrementStepper />
										<NumberDecrementStepper />
									</NumberInputStepper>
								</NumberInput>
							</FormControl>

							{/* <FormControl>
								<FormLabel>ID центра донорства</FormLabel>
								<Input
									value={donationForm.centerId}
									onChange={(e) =>
										setDonationForm({
											...donationForm,
											centerId: e.target.value,
										})
									}
																				placeholder="Enter center ID"
								/>
							</FormControl> */}

							<HStack spacing={4} w="full">
								<Button variant="ghost" onClick={onClose} flex={1}>
									Cancel
								</Button>
								<Button
									colorScheme="orange"
									onClick={handleAddDonation}
									isLoading={isLoading}
									loadingText="Adding..."
									flex={1}
								>
									{isDeployer ? 'Add Donation' : 'Send for Verification'}
								</Button>
							</HStack>
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
		</VStack>
	);
}
