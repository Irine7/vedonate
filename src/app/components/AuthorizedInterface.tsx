'use client';

import React, { useState } from 'react';
import { useVeDonate } from '@/hooks/useVeDonate';
import { useWallet } from '@vechain/vechain-kit';
import { BadgeType } from '@/lib/contracts';
import {
	Box,
	Container,
	VStack,
	HStack,
	Heading,
	Text,
	Button,
	Grid,
	GridItem,
	Card,
	CardBody,
	CardHeader,
	Divider,
	useColorModeValue,
	Badge,
	Progress,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	StatArrow,
	SimpleGrid,
	Alert,
	AlertIcon,
	AlertTitle,
	AlertDescription,
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
	Spinner,
	Flex,
	Icon,
	Tooltip,
} from '@chakra-ui/react';

interface DonationFormData {
	donationType: string;
	amount: number;
	centerId: string;
}

const AuthorizedInterface: React.FC = () => {
	const { account, connection } = useWallet();
	const isConnectionReady = connection && connection.thor;

	const {
		donorInfo,
		donorDonations,
		donorBadges,
		globalStats,
		b3trBalance,
		isLoading,
		error,
		registerDonor,
		addDonation,
		refreshData,
		getBadgeName,
		getBadgeRequirement,
		getBadgeIcon,
		isDeployer,
	} = useVeDonate();

	const [donationForm, setDonationForm] = useState<DonationFormData>({
		donationType: 'кровь',
		amount: 500,
		centerId: 'center_001',
	});

	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();

	const bgGradient = useColorModeValue(
		'linear(to-br, blue.50, purple.50, pink.50)',
		'linear(to-br, gray.900, gray.800, gray.900)'
	);
	const cardBg = useColorModeValue('white', 'gray.800');
	const textColor = useColorModeValue('gray.800', 'white');
	const subtextColor = useColorModeValue('gray.600', 'gray.300');

	const handleRegisterDonor = async () => {
		try {
			await registerDonor();
			toast({
				title: 'Успешно!',
				description: 'Вы успешно зарегистрированы как донор',
				status: 'success',
				duration: 5000,
				isClosable: true,
				position: 'bottom-left',
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

	const handleAddDonation = async () => {
		try {
			await addDonation(
				account as string,
				donationForm.donationType,
				donationForm.amount,
				donationForm.centerId
			);
			toast({
				title: 'Донация добавлена!',
				description: 'Ваша донация успешно зарегистрирована',
				status: 'success',
				duration: 5000,
				isClosable: true,
				position: 'bottom-left',
			});
			onClose();
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

	const formatAddress = (address: string) => {
		if (!address || typeof address !== 'string') {
			return 'N/A';
		}
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const getNextBadgeProgress = () => {
		if (!donorInfo) return null;

		const totalDonations = Number(donorInfo.totalDonations);
		const currentLevel = Math.floor(totalDonations / 5);
		const nextLevel = currentLevel + 1;
		const progress = ((totalDonations % 5) / 5) * 100;

		return {
			currentLevel,
			nextLevel,
			progress,
			donationsNeeded: 5 - (totalDonations % 5),
		};
	};

	const badgeProgress = getNextBadgeProgress();

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
										👋 Добро пожаловать, донор!
									</Heading>
									<Text color={subtextColor}>
										Адрес: {formatAddress(account)}
									</Text>
								</VStack>
								<HStack spacing={4}>
									<Badge colorScheme="green" variant="subtle" px={3} py={1}>
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

					{/* Registration Section */}
					{!donorInfo?.isRegistered && (
						<Card bg={cardBg} shadow="lg">
							<CardBody p={6}>
								<VStack spacing={4} textAlign="center">
									<Heading size="md" color={textColor}>
										📝 Регистрация донора
									</Heading>
									<Text color={subtextColor}>
										Зарегистрируйтесь как донор, чтобы начать получать токены
										B3TR за донации
									</Text>
									<Button
										colorScheme="orange"
										size="lg"
										onClick={handleRegisterDonor}
										isLoading={isLoading}
										loadingText="Регистрация..."
									>
										🚀 Зарегистрироваться
									</Button>
								</VStack>
							</CardBody>
						</Card>
					)}

					{/* Stats Grid */}
					{donorInfo && (
						<SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
							<Card bg={cardBg} shadow="lg">
								<CardBody p={6}>
									<Stat>
										<StatLabel color={subtextColor}>Всего донаций</StatLabel>
										<StatNumber color="blue.400">
											{donorInfo.totalDonations.toString()}
										</StatNumber>
										<StatHelpText>
											<StatArrow type="increase" />
											За все время
										</StatHelpText>
									</Stat>
								</CardBody>
							</Card>

							<Card bg={cardBg} shadow="lg">
								<CardBody p={6}>
									<Stat>
										<StatLabel color={subtextColor}>Плазма</StatLabel>
										<StatNumber color="purple.400">
											{donorInfo.plasmaDonations.toString()}
										</StatNumber>
										<StatHelpText>Донаций плазмы</StatHelpText>
									</Stat>
								</CardBody>
							</Card>

							<Card bg={cardBg} shadow="lg">
								<CardBody p={6}>
									<Stat>
										<StatLabel color={subtextColor}>B3TR баланс</StatLabel>
										<StatNumber color="yellow.400">
											{b3trBalance.toString()}
										</StatNumber>
										<StatHelpText>Текущий баланс</StatHelpText>
									</Stat>
								</CardBody>
							</Card>

							<Card bg={cardBg} shadow="lg">
								<CardBody p={6}>
									<Stat>
										<StatLabel color={subtextColor}>Всего B3TR</StatLabel>
										<StatNumber color="green.400">
											{donorInfo.totalB3TR.toString()}
										</StatNumber>
										<StatHelpText>Заработано всего</StatHelpText>
									</Stat>
								</CardBody>
							</Card>
						</SimpleGrid>
					)}

					{/* Badge Progress */}
					{badgeProgress && (
						<Card bg={cardBg} shadow="lg">
							<CardHeader>
								<Heading size="md" color={textColor}>
									🏆 Прогресс до следующего бейджа
								</Heading>
							</CardHeader>
							<CardBody pt={0}>
								<VStack spacing={4}>
									<HStack w="full" justify="space-between">
										<Text color={subtextColor}>
											Текущий уровень: {badgeProgress.currentLevel}
										</Text>
										<Text color={subtextColor}>
											До уровня {badgeProgress.nextLevel}:{' '}
											{badgeProgress.donationsNeeded} донаций
										</Text>
									</HStack>
									<Progress
										value={badgeProgress.progress}
										colorScheme="orange"
										size="lg"
										borderRadius="full"
									/>
									<Text fontSize="sm" color={subtextColor} textAlign="center">
										Продолжайте донировать, чтобы получить новый бейдж!
									</Text>
								</VStack>
							</CardBody>
						</Card>
					)}

					{/* Badges Section */}
					{donorBadges.length > 0 && (
						<Card bg={cardBg} shadow="lg">
							<CardHeader>
								<Heading size="md" color={textColor}>
									🏆 Ваши бейджи
								</Heading>
							</CardHeader>
							<CardBody pt={0}>
								<Grid
									templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
									gap={4}
								>
									{donorBadges.map((badgeType) => (
										<GridItem key={badgeType}>
											<Card
												bg="gradient-to-br from-yellow-50 to-orange-50"
												border="1px"
												borderColor="yellow.200"
											>
												<CardBody p={4} textAlign="center">
													<VStack spacing={2}>
														<Text fontSize="3xl">
															{getBadgeIcon(badgeType)}
														</Text>
														<Text fontWeight="bold" fontSize="sm">
															{getBadgeName(badgeType)}
														</Text>
														<Text fontSize="xs" color={subtextColor}>
															{getBadgeRequirement(badgeType)}
														</Text>
													</VStack>
												</CardBody>
											</Card>
										</GridItem>
									))}
								</Grid>
							</CardBody>
						</Card>
					)}

					{/* Donation History */}
					{donorDonations.length > 0 && (
						<Card bg={cardBg} shadow="lg">
							<CardHeader>
								<HStack justify="space-between">
									<Heading size="md" color={textColor}>
										📋 История донаций
									</Heading>
									<Button
										size="sm"
										variant="outline"
										onClick={refreshData}
										isLoading={isLoading}
									>
										🔄 Обновить
									</Button>
								</HStack>
							</CardHeader>
							<CardBody pt={0}>
								<VStack spacing={3} align="stretch">
									{donorDonations.map((donation, index) => (
										<Card
											key={index}
											bg={useColorModeValue('gray.50', 'gray.700')}
										>
											<CardBody p={4}>
												<HStack justify="space-between">
													<VStack align="start" spacing={1}>
														<Text fontWeight="bold">
															{donation.donationType}
														</Text>
														<Text fontSize="sm" color={subtextColor}>
															{new Date(
																Number(donation.timestamp) * 1000
															).toLocaleString()}
														</Text>
														<Text fontSize="sm">
															Центр: {donation.centerId}
														</Text>
													</VStack>
													<VStack align="end" spacing={1}>
														<Text fontWeight="bold">
															{donation.amount.toString()} мл
														</Text>
														<Text fontSize="sm" color="yellow.500">
															+{donation.b3trReward.toString()} B3TR
														</Text>
														<Badge
															colorScheme={
																donation.verified ? 'green' : 'yellow'
															}
															variant="subtle"
														>
															{donation.verified
																? '✅ Подтверждено'
																: '⏳ Ожидает'}
														</Badge>
													</VStack>
												</HStack>
											</CardBody>
										</Card>
									))}
								</VStack>
							</CardBody>
						</Card>
					)}

					{/* Add Donation Button (for deployers) */}
					{isDeployer && (
						<Card bg={cardBg} shadow="lg">
							<CardBody p={6} textAlign="center">
								<VStack spacing={4}>
									<Heading size="md" color={textColor}>
										➕ Добавить донацию
									</Heading>
									<Text color={subtextColor}>
										Как деплойер, вы можете добавлять новые донации в систему
									</Text>
									<Button colorScheme="purple" size="lg" onClick={onOpen}>
										📝 Добавить донацию
									</Button>
								</VStack>
							</CardBody>
						</Card>
					)}

					{/* Global Stats */}
					{globalStats && (
						<Card bg={cardBg} shadow="lg">
							<CardHeader>
								<Heading size="md" color={textColor}>
									📊 Глобальная статистика
								</Heading>
							</CardHeader>
							<CardBody pt={0}>
								<SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
									<VStack spacing={2}>
										<Text fontSize="2xl" fontWeight="bold" color="blue.400">
											{globalStats.totalDonations.toString()}
										</Text>
										<Text color={subtextColor} textAlign="center">
											Всего донаций
										</Text>
									</VStack>
									<VStack spacing={2}>
										<Text fontSize="2xl" fontWeight="bold" color="green.400">
											{globalStats.totalDonors.toString()}
										</Text>
										<Text color={subtextColor} textAlign="center">
											Всего доноров
										</Text>
									</VStack>
									<VStack spacing={2}>
										<Text fontSize="2xl" fontWeight="bold" color="yellow.400">
											{globalStats.totalB3TRDistributed.toString()}
										</Text>
										<Text color={subtextColor} textAlign="center">
											B3TR распределено
										</Text>
									</VStack>
								</SimpleGrid>
							</CardBody>
						</Card>
					)}
				</VStack>
			</Container>

			{/* Add Donation Modal */}
			<Modal isOpen={isOpen} onClose={onClose} size="lg">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Добавить новую донацию</ModalHeader>
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
									<option value="кровь">Кровь</option>
									<option value="плазма">Плазма</option>
									<option value="тромбоциты">Тромбоциты</option>
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
								<FormLabel>ID центра</FormLabel>
								<Input
									value={donationForm.centerId}
									onChange={(e) =>
										setDonationForm({
											...donationForm,
											centerId: e.target.value,
										})
									}
									placeholder="center_001"
								/>
							</FormControl>

							<HStack spacing={4} w="full">
								<Button variant="outline" onClick={onClose} flex="1">
									Отмена
								</Button>
								<Button
									colorScheme="purple"
									onClick={handleAddDonation}
									isLoading={isLoading}
									loadingText="Добавление..."
									flex="1"
								>
									Добавить донацию
								</Button>
							</HStack>
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
		</Box>
	);
};

export default AuthorizedInterface;
