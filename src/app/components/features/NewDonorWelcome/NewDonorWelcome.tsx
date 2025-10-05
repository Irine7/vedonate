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
	Button,
	useColorModeValue,
	Badge,
	Grid,
	GridItem,
	Flex,
	Spacer,
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
	Divider,
	Icon,
} from '@chakra-ui/react';
import { useVeDonate } from '@/hooks/useVeDonate';
import { useSafeWallet } from '@/hooks/useSafeWallet';

interface NewDonorWelcomeProps {
	account: string;
}

export function NewDonorWelcome({ account }: NewDonorWelcomeProps) {
	const { registerDonor, addDonation, isLoading, isDeployer, refreshData } =
		useVeDonate();
	const { connection, connect } = useSafeWallet();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();

	const [donationForm, setDonationForm] = useState({
		donationType: 'blood',
		amount: 450,
		centerId: '',
	});

	const [profileForm, setProfileForm] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
	});

	const cardBg = useColorModeValue('white', 'gray.800');
	const textColor = useColorModeValue('gray.800', 'white');
	const subtextColor = useColorModeValue('gray.600', 'gray.300');
	const borderColor = useColorModeValue('gray.200', 'gray.600');

	const formatAddress = (address: string) => {
		if (!address || typeof address !== 'string') {
			return 'N/A';
		}
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const handleForceReconnect = async () => {
		try {
			toast({
				title: 'Переподключение...',
				description: 'Попытка переподключения к VeChain Thor',
				status: 'info',
				duration: 3000,
				isClosable: true,
				position: 'bottom-left',
			});

			// Принудительно обновляем данные
			await refreshData();

			toast({
				title: 'Обновлено',
				description: 'Состояние подключения обновлено',
				status: 'success',
				duration: 2000,
				isClosable: true,
				position: 'bottom-left',
			});
		} catch (err) {
			console.error('Force reconnect error:', err);
			toast({
				title: 'Ошибка',
				description: 'Не удалось обновить подключение',
				status: 'error',
				duration: 3000,
				isClosable: true,
				position: 'bottom-left',
			});
		}
	};

	const handleDirectVeWorldRegistration = async () => {
		try {
			toast({
				title: 'Прямая регистрация...',
				description: 'Попытка регистрации через VeWorld API',
				status: 'info',
				duration: 3000,
				isClosable: true,
				position: 'bottom-left',
			});

			// Проверяем доступность различных VeWorld API
			const vechainApi =
				(window as any).vechain ||
				(window as any).veworldKit ||
				(window as any).veworld;

			if (typeof window !== 'undefined' && vechainApi) {
				console.log(
					'VeChain API found:',
					vechainApi.constructor.name,
					'attempting direct registration...'
				);

				// Пробуем разные методы вызова
				let result;
				if (vechainApi.sendTransaction) {
					result = await vechainApi.sendTransaction({
						clauses: [
							{
								to: '0x3e445638b907d942c33b904d6ea6951ac533bc34',
								value: '0x0',
								data: '0x5b34c965', // registerDonor() selector
							},
						],
						gas: 100000,
						gasPriceCoef: 128,
						dependsOn: null,
						nonce: Math.floor(Math.random() * 1000000000),
					});
				} else if (vechainApi.request) {
					// Для wallet API
					result = await vechainApi.request({
						method: 'vechain_sendTransaction',
						params: [
							{
								clauses: [
									{
										to: '0x3e445638b907d942c33b904d6ea6951ac533bc34',
										value: '0x0',
										data: '0x5b34c965',
									},
								],
								gas: 100000,
								gasPriceCoef: 128,
							},
						],
					});
				} else {
					throw new Error('Неподдерживаемый API VeWorld');
				}

				console.log('Direct VeChain registration successful:', result);

				toast({
					title: 'Успешно!',
					description: 'Регистрация через VeWorld прошла успешно',
					status: 'success',
					duration: 3000,
					isClosable: true,
					position: 'bottom-left',
				});

				// Обновляем данные после регистрации
				await refreshData();
				onClose();
			} else {
				console.log('Available APIs:', {
					vechain: !!(window as any).vechain,
					veworldKit: !!(window as any).veworldKit,
					veworld: !!(window as any).veworld,
				});
				throw new Error(
					'VeChain API недоступен. Попробуйте стандартную кнопку регистрации.'
				);
			}
		} catch (err) {
			console.error('Direct VeWorld registration error:', err);
			toast({
				title: 'Ошибка',
				description: `Не удалось зарегистрироваться через VeWorld: ${
					err instanceof Error ? err.message : 'Неизвестная ошибка'
				}`,
				status: 'error',
				duration: 5000,
				isClosable: true,
				position: 'bottom-left',
			});
		}
	};

	const handleAddDonation = async () => {
		// Проверяем поля профиля
		if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
			toast({
				title: 'Ошибка',
				description: 'Пожалуйста, заполните имя и фамилию',
				status: 'error',
				duration: 3000,
				isClosable: true,
				position: 'bottom-left',
			});
			return;
		}

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
			// Сначала регистрируем пользователя как донора
			await registerDonor();

			// Сохраняем профиль пользователя в localStorage
			const userProfile = {
				firstName: profileForm.firstName,
				lastName: profileForm.lastName,
				email: profileForm.email,
				phone: profileForm.phone,
				address: account,
				registeredAt: new Date().toISOString(),
			};
			localStorage.setItem(
				`userProfile_${account}`,
				JSON.stringify(userProfile)
			);

			toast({
				title: 'Регистрация успешна!',
				description: `${profileForm.firstName} ${profileForm.lastName}, вы зарегистрированы как донор!`,
				status: 'success',
				duration: 3000,
				isClosable: true,
				position: 'bottom-left',
			});

			// Если пользователь является деплойером, добавляем донацию
			if (isDeployer) {
				await addDonation(
					account,
					donationForm.donationType,
					donationForm.amount,
					donationForm.centerId
				);
				toast({
					title: 'Успешно!',
					description: 'Ваша донация зарегистрирована!',
					status: 'success',
					duration: 5000,
					isClosable: true,
					position: 'bottom-left',
				});
			} else {
				// Для обычных пользователей показываем сообщение о том, что донация будет добавлена администратором
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
			setProfileForm({
				firstName: '',
				lastName: '',
				email: '',
				phone: '',
			});
		} catch (err) {
			console.error('Registration error:', err);
			toast({
				title: 'Ошибка регистрации',
				description: err instanceof Error ? err.message : 'Неизвестная ошибка',
				status: 'error',
				duration: 8000,
				isClosable: true,
				position: 'bottom-left',
			});
		}
	};

	return (
		<VStack spacing={6} align="stretch" mt={820}>
			{/* Приветствие для нового донора */}
			<Card bg={cardBg} shadow="lg" borderColor="blue.200" borderWidth="1px">
				<CardBody p={8}>
					<VStack spacing={6} textAlign="center">
						<VStack spacing={3}>
							<Heading color={textColor}>Добро пожаловать в VeDonate!</Heading>
							<Text fontSize="lg" color={subtextColor} maxW="2xl">
								Вы пока не зарегистрированы как донор
							</Text>
						</VStack>
					</VStack>
				</CardBody>
			</Card>

			{/* Информация о том, как стать донором */}
			<Card bg={cardBg} shadow="lg">
				<CardBody p={6}>
					<VStack spacing={6}>
						<Heading size="lg" color={textColor} textAlign="center">
							Как стать донором?
						</Heading>

						<Grid
							templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
							gap={6}
							w="full"
						>
							<GridItem>
								<Card bg="gray.50" borderWidth="1px" borderColor={borderColor}>
									<CardBody p={6}>
										<VStack spacing={4} textAlign="center">
											<Text fontSize="4xl">🏥</Text>
											<Heading size="md" color="black">
												1. Посетите центр донорства
											</Heading>
											<Text fontSize="sm" color="black">
												Найдите ближайший центр донорства крови и запишитесь на
												прием
											</Text>
										</VStack>
									</CardBody>
								</Card>
							</GridItem>

							<GridItem>
								<Card bg="gray.50" borderWidth="1px" borderColor={borderColor}>
									<CardBody p={6}>
										<VStack spacing={4} textAlign="center">
											<Text fontSize="4xl">📝</Text>
											<Heading size="md" color="black">
												2. Зарегистрируйте донацию
											</Heading>
											<Text fontSize="sm" color="black">
												После донации используйте кнопку "Добавить донацию" для
												регистрации
											</Text>
										</VStack>
									</CardBody>
								</Card>
							</GridItem>

							<GridItem>
								<Card bg="gray.50" borderWidth="1px" borderColor={borderColor}>
									<CardBody p={6}>
										<VStack spacing={4} textAlign="center">
											<Text fontSize="4xl">🪙</Text>
											<Heading size="md" color="black">
												3. Получайте B3TR токены
											</Heading>
											<Text fontSize="sm" color="black">
												За каждую зарегистрированную донацию вы получите B3TR
												токены
											</Text>
										</VStack>
									</CardBody>
								</Card>
							</GridItem>

							<GridItem>
								<Card bg="gray.50" borderWidth="1px" borderColor={borderColor}>
									<CardBody p={6}>
										<VStack spacing={4} textAlign="center">
											<Text fontSize="4xl">🏆</Text>
											<Heading size="md" color="black">
												4. Собирайте NFT бейджи
											</Heading>
											<Text fontSize="sm" color="black">
												Достигайте новых уровней и получайте уникальные NFT
												бейджи
											</Text>
										</VStack>
									</CardBody>
								</Card>
							</GridItem>
						</Grid>
					</VStack>
				</CardBody>
			</Card>

			{/* Преимущества донорства */}
			<Card bg={cardBg} shadow="lg">
				<CardBody p={6}>
					<VStack spacing={6}>
						<Heading size="lg" color={textColor} textAlign="center">
							✨ Преимущества донорства
						</Heading>

						<Grid
							templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
							gap={4}
							w="full"
						>
							<VStack spacing={3} p={4} bg="red.50" borderRadius="md">
								<Text fontSize="3xl">❤️</Text>
								<Text fontWeight="bold" color="black" textAlign="center">
									Спасение жизней
								</Text>
								<Text fontSize="sm" color="black" textAlign="center">
									Каждая донация может спасти до 3 жизней
								</Text>
							</VStack>

							<VStack spacing={3} p={4} bg="orange.50" borderRadius="md">
								<Text fontSize="3xl">💰</Text>
								<Text fontWeight="bold" color="black" textAlign="center">
									B3TR токены
								</Text>
								<Text fontSize="sm" color="black" textAlign="center">
									Зарабатывайте токены за каждую донацию
								</Text>
							</VStack>

							<VStack spacing={3} p={4} bg="purple.50" borderRadius="md">
								<Text fontSize="3xl">🎖️</Text>
								<Text fontWeight="bold" color="black" textAlign="center">
									NFT бейджи
								</Text>
								<Text fontSize="sm" color="black" textAlign="center">
									Коллекционируйте уникальные достижения
								</Text>
							</VStack>
						</Grid>
					</VStack>
				</CardBody>
			</Card>

			{/* Статистика платформы */}
			<Card bg={cardBg} shadow="lg">
				<CardBody p={6}>
					<VStack spacing={4}>
						<Heading size="md" color={textColor} textAlign="center">
							📊 Статистика платформы
						</Heading>

						<Grid
							templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }}
							gap={4}
							w="full"
						>
							<VStack spacing={2} p={3} bg="blue.50" borderRadius="md">
								<Text fontSize="2xl" fontWeight="bold" color="blue.500">
									1,247
								</Text>
								<Text fontSize="sm" color="black" textAlign="center">
									Активных доноров
								</Text>
							</VStack>

							<VStack spacing={2} p={3} bg="green.50" borderRadius="md">
								<Text fontSize="2xl" fontWeight="bold" color="green.500">
									15,892
								</Text>
								<Text fontSize="sm" color="black" textAlign="center">
									Всего донаций
								</Text>
							</VStack>

							<VStack spacing={2} p={3} bg="orange.50" borderRadius="md">
								<Text fontSize="2xl" fontWeight="bold" color="orange.500">
									2,847,350
								</Text>
								<Text fontSize="sm" color="black" textAlign="center">
									B3TR распределено
								</Text>
							</VStack>

							<VStack spacing={2} p={3} bg="red.50" borderRadius="md">
								<Text fontSize="2xl" fontWeight="bold" color="red.500">
									47,676
								</Text>
								<Text fontSize="sm" color="black" textAlign="center">
									Спасенных жизней
								</Text>
							</VStack>
						</Grid>
					</VStack>
				</CardBody>
			</Card>

			{/* Призыв к действию */}
			<Card bg="linear(to-r, orange.400, red.400)" shadow="xl">
				<CardBody p={8}>
					<VStack spacing={4} textAlign="center">
						<Text fontSize="4xl" color="white">
							🚀
						</Text>
						<Heading size="lg" color="white">
							Готовы начать?
						</Heading>
						<Text color="whiteAlpha.900" maxW="lg">
							Присоединяйтесь к сообществу доноров VeDonate и начните спасать
							жизни уже сегодня!
						</Text>
						<Button
							colorScheme="white"
							variant="outline"
							size="lg"
							px={8}
							py={6}
							fontSize="lg"
							fontWeight="bold"
							onClick={onOpen}
							_hover={{
								bg: 'whiteAlpha.200',
								transform: 'translateY(-2px)',
							}}
							transition="all 0.2s"
						>
							📝 Зарегистрироваться как донор
						</Button>
					</VStack>
				</CardBody>
			</Card>

			{/* Registration Modal */}
			<Modal isOpen={isOpen} onClose={onClose} size="lg">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>🩸 Регистрация донора</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<VStack spacing={4}>
							{/* Индикатор подключения */}
							<VStack spacing={2} w="full">
								<HStack spacing={2} w="full" justify="center">
									<Icon color={connection?.thor ? 'green.500' : 'red.500'}>
										{connection?.thor ? '🟢' : '🔴'}
									</Icon>
									<Text
										fontSize="sm"
										color={connection?.thor ? 'green.500' : 'red.500'}
									>
										{connection?.thor
											? 'Подключен к VeChain Thor'
											: 'Не подключен к VeChain Thor'}
									</Text>
								</HStack>
								<Text fontSize="xs" color="gray.500" textAlign="center">
									Сеть: {connection?.network?.type || 'Загрузка...'} | Chain ID:{' '}
									{connection?.network?.chainId || 'Загрузка...'}
								</Text>
								{!connection?.network?.type && (
									<Text fontSize="xs" color="blue.500" textAlign="center">
										ℹ️ Информация о сети загружается, регистрация все равно
										возможна
									</Text>
								)}
								{!connection?.thor && (
									<Text fontSize="xs" color="orange.500" textAlign="center">
										⚠️ Thor не подключен. Система попытается инициализировать
										его автоматически при регистрации (может занять до 30
										секунд)
									</Text>
								)}
								{connection?.network?.type &&
									connection?.network?.type !== 'test' && (
										<Text fontSize="xs" color="red.500" textAlign="center">
											❌ Требуется VeChain Testnet
										</Text>
									)}
							</VStack>

							{/* Поля профиля */}
							<Text fontWeight="bold" color={textColor} alignSelf="start">
								Личная информация
							</Text>

							<HStack spacing={4} w="full">
								<FormControl>
									<FormLabel>Имя *</FormLabel>
									<Input
										value={profileForm.firstName}
										onChange={(e) =>
											setProfileForm({
												...profileForm,
												firstName: e.target.value,
											})
										}
										placeholder="Введите имя"
									/>
								</FormControl>

								<FormControl>
									<FormLabel>Фамилия *</FormLabel>
									<Input
										value={profileForm.lastName}
										onChange={(e) =>
											setProfileForm({
												...profileForm,
												lastName: e.target.value,
											})
										}
										placeholder="Введите фамилию"
									/>
								</FormControl>
							</HStack>

							<HStack spacing={4} w="full">
								<FormControl>
									<FormLabel>Email</FormLabel>
									<Input
										type="email"
										value={profileForm.email}
										onChange={(e) =>
											setProfileForm({
												...profileForm,
												email: e.target.value,
											})
										}
										placeholder="example@email.com"
									/>
								</FormControl>

								<FormControl>
									<FormLabel>Телефон</FormLabel>
									<Input
										value={profileForm.phone}
										onChange={(e) =>
											setProfileForm({
												...profileForm,
												phone: e.target.value,
											})
										}
										placeholder="+7 (999) 123-45-67"
									/>
								</FormControl>
							</HStack>

							<Divider />

							<Text fontWeight="bold" color={textColor} alignSelf="start">
								Информация о донации
							</Text>

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

							<VStack spacing={4} w="full">
								<Button
									colorScheme="blue"
									variant="outline"
									onClick={handleForceReconnect}
									size="sm"
									w="full"
									isDisabled={isLoading}
								>
									🔄 Переподключить Thor
								</Button>
								<Button
									colorScheme="green"
									variant="outline"
									onClick={handleDirectVeWorldRegistration}
									size="sm"
									w="full"
									isDisabled={isLoading}
								>
									🚀 Прямая регистрация через VeWorld
								</Button>
								<HStack spacing={4} w="full">
									<Button variant="ghost" onClick={onClose} flex={1}>
										Отмена
									</Button>
									<Button
										colorScheme="orange"
										onClick={handleAddDonation}
										isLoading={isLoading}
										loadingText="Регистрация..."
										flex={1}
									>
										{isDeployer
											? 'Зарегистрироваться и добавить донацию'
											: 'Зарегистрироваться как донор'}
									</Button>
								</HStack>
							</VStack>
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
		</VStack>
	);
}
