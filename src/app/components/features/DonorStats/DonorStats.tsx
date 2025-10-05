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

	// Получаем профиль пользователя из localStorage
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
				title: 'Ошибка',
				description: 'Пожалуйста, укажите ID центра донорства',
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
					title: 'Успешно!',
					description: 'Донация добавлена!',
					status: 'success',
					duration: 5000,
					isClosable: true,
					position: 'bottom-left',
				});
			} else {
				toast({
					title: 'Донация отправлена на верификацию',
					description:
						'Ваша донация будет проверена и добавлена администратором.',
					status: 'info',
					duration: 5000,
					isClosable: true,
					position: 'bottom-left',
				});
			}

			onClose();
			// Сброс формы
			setDonationForm({
				donationType: 'blood',
				amount: 450,
				centerId: '',
			});
		} catch (err) {
			toast({
				title: 'Ошибка',
				description: err instanceof Error ? err.message : 'Неизвестная ошибка',
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
						Загрузка статистики...
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
				📊 Статистика донорства
				{userProfile && (
					<Text fontSize="md" color={subtextColor} fontWeight="normal" mt={2}>
						Добро пожаловать, {userProfile.firstName} {userProfile.lastName}!
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
								Всего донаций
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
								B3TR токенов
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
								Текущий уровень
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
								NFT бейджей
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
							🎯 Прогресс до следующего уровня
						</Heading>
						<VStack spacing={2} w="full">
							<HStack justify="space-between" w="full">
								<Text color={subtextColor}>
									Уровень {currentLevel} → {nextLevel}
								</Text>
								<Badge colorScheme="purple" variant="subtle">
									{donationsNeeded} донаций до уровня
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
								{totalDonations % 5} из 5 донаций
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
								🏆 Ваши NFT бейджи
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
														Уровень {badge.toString()}
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
								📋 История донаций
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
													Центр #{donation.centerId}
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
									И еще {donorDonations.length - 10} донаций...
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
										: 'Донор зарегистрирован'}
								</Text>
								<Text fontSize="sm" color={subtextColor}>
									{userProfile
										? `Зарегистрирован ${new Date(
												userProfile.registeredAt
										  ).toLocaleDateString('ru-RU')}`
										: 'Вы успешно зарегистрированы в системе VeDonate'}
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
								Активен
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
							Добавить донацию
						</Button>
					</VStack>
				</CardBody>
			</Card>

			{/* Add Donation Modal */}
			<Modal isOpen={isOpen} onClose={onClose} size="lg">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>🩸 Добавить донацию</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<VStack spacing={4}>
							<FormControl>
								<FormLabel>Тип донации</FormLabel>
								<Select
									value={donationForm.donationType}
									onChange={(e) =>
										setDonationForm({
											...donationForm,
											donationType: e.target.value,
										})
									}
								>
									<option value="blood">Кровь</option>
									<option value="plasma">Плазма</option>
									<option value="platelets">Тромбоциты</option>
									<option value="bone_marrow">Костный мозг</option>
								</Select>
							</FormControl>

							<FormControl>
								<FormLabel>Объем (мл)</FormLabel>
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

							<FormControl>
								<FormLabel>ID центра донорства</FormLabel>
								<Input
									value={donationForm.centerId}
									onChange={(e) =>
										setDonationForm({
											...donationForm,
											centerId: e.target.value,
										})
									}
									placeholder="Введите ID центра"
								/>
							</FormControl>

							<HStack spacing={4} w="full">
								<Button variant="ghost" onClick={onClose} flex={1}>
									Отмена
								</Button>
								<Button
									colorScheme="orange"
									onClick={handleAddDonation}
									isLoading={isLoading}
									loadingText="Добавление..."
									flex={1}
								>
									{isDeployer ? 'Добавить донацию' : 'Отправить на верификацию'}
								</Button>
							</HStack>
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
		</VStack>
	);
}
