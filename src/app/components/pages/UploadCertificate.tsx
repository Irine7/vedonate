'use client';

import { type ReactElement, useState } from 'react';
import {
	Box,
	Button,
	VStack,
	Text,
	Input,
	useToast,
	Progress,
	HStack,
	Icon,
	Alert,
	AlertIcon,
	AlertTitle,
	AlertDescription,
	Select,
	FormControl,
	FormLabel,
} from '@chakra-ui/react';
import { useVeDonate } from '@/hooks/useVeDonate';
import { useSafeWallet } from '@/hooks/useSafeWallet';

interface UploadState {
	isUploading: boolean;
	progress: number;
	status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
	message: string;
}

export function UploadCertificate(): ReactElement {
	const [uploadState, setUploadState] = useState<UploadState>({
		isUploading: false,
		progress: 0,
		status: 'idle',
		message: '',
	});
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [donationType, setDonationType] = useState<'blood' | 'plasma'>('blood');
	const [amount, setAmount] = useState<string>('450');
	const [centerId, setCenterId] = useState<string>('center-001');

	const { addDonation } = useVeDonate();
	const { account } = useSafeWallet();
	const toast = useToast();

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			setUploadState({
				isUploading: false,
				progress: 0,
				status: 'idle',
				message: '',
			});
		}
	};

	const handleUpload = async () => {
		if (!selectedFile || !account) {
			toast({
				title: 'Ошибка',
				description:
					'Пожалуйста, выберите файл и убедитесь, что кошелек подключен',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		setUploadState({
			isUploading: true,
			progress: 0,
			status: 'uploading',
			message: 'Загружаем файл...',
		});

		try {
			// Симуляция загрузки
			for (let i = 0; i <= 100; i += 10) {
				await new Promise((resolve) => setTimeout(resolve, 100));
				setUploadState((prev) => ({
					...prev,
					progress: i,
				}));
			}

			setUploadState({
				isUploading: false,
				progress: 100,
				status: 'processing',
				message: 'AI анализирует документ...',
			});

			// Симуляция AI обработки
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Добавляем донацию в блокчейн
			setUploadState({
				isUploading: false,
				progress: 100,
				status: 'processing',
				message: 'Записываем в блокчейн...',
			});

			await addDonation(account, donationType, parseInt(amount), centerId);

			// Успешное завершение
			setUploadState({
				isUploading: false,
				progress: 100,
				status: 'success',
				message: `Донация подтверждена! Получено ${
					donationType === 'blood' ? '10' : '15'
				} B3TR токенов`,
			});

			toast({
				title: 'Успешно!',
				description: 'Донация записана в блокчейн. Получены токены и NFT.',
				status: 'success',
				duration: 5000,
				isClosable: true,
			});
		} catch (error) {
			setUploadState({
				isUploading: false,
				progress: 0,
				status: 'error',
				message: 'Ошибка при обработке документа или записи в блокчейн',
			});

			toast({
				title: 'Ошибка',
				description: 'Не удалось обработать документ или записать в блокчейн',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const getStatusAlert = () => {
		if (uploadState.status === 'success') {
			return (
				<Alert status="success">
					<AlertIcon />
					<Box>
						<AlertTitle>Донация подтверждена!</AlertTitle>
						<AlertDescription>
							Данные записаны в блокчейн VeChain. Токены и NFT начислены.
						</AlertDescription>
					</Box>
				</Alert>
			);
		}

		if (uploadState.status === 'error') {
			return (
				<Alert status="error">
					<AlertIcon />
					<Box>
						<AlertTitle>Ошибка верификации</AlertTitle>
						<AlertDescription>
							Не удалось подтвердить донацию. Проверьте качество фото и
							подключение к блокчейну.
						</AlertDescription>
					</Box>
				</Alert>
			);
		}

		return null;
	};

	return (
		<VStack spacing={4} align="stretch">
			{getStatusAlert()}

			<FormControl>
				<FormLabel>Тип донации</FormLabel>
				<Select
					value={donationType}
					onChange={(e) =>
						setDonationType(e.target.value as 'blood' | 'plasma')
					}
					disabled={uploadState.isUploading}
				>
					<option value="blood">Кровь (450 мл) - 10 B3TR</option>
					<option value="plasma">Плазма (600 мл) - 15 B3TR</option>
				</Select>
			</FormControl>

			<FormControl>
				<FormLabel>Количество (мл)</FormLabel>
				<Input
					type="number"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					disabled={uploadState.isUploading}
					placeholder="450"
				/>
			</FormControl>

			<FormControl>
				<FormLabel>ID центра сдачи</FormLabel>
				<Select
					value={centerId}
					onChange={(e) => setCenterId(e.target.value)}
					disabled={uploadState.isUploading}
				>
					<option value="center-001">Центр крови №1</option>
					<option value="center-002">Медцентр "Здоровье"</option>
					<option value="center-003">Больница №5</option>
				</Select>
			</FormControl>

			<Box>
				<Text mb={2} fontWeight="medium">
					Выберите фото справки о донации:
				</Text>
				<Input
					type="file"
					accept="image/*"
					onChange={handleFileSelect}
					disabled={uploadState.isUploading}
					mb={3}
				/>
				{selectedFile && (
					<Text fontSize="sm" color="gray.600">
						Выбран файл: {selectedFile.name}
					</Text>
				)}
			</Box>

			{uploadState.isUploading && (
				<Box>
					<HStack mb={2}>
						<Icon>
							<Text>🤖</Text>
						</Icon>
						<Text fontSize="sm">{uploadState.message}</Text>
					</HStack>
					<Progress value={uploadState.progress} colorScheme="red" />
				</Box>
			)}

			<Button
				colorScheme="red"
				onClick={handleUpload}
				disabled={!selectedFile || uploadState.isUploading || !account}
				loadingText="Обработка..."
				isLoading={uploadState.isUploading}
			>
				<Icon mr={2}>
					<Text>📸</Text>
				</Icon>
				Загрузить и записать в блокчейн
			</Button>

			<Text fontSize="xs" color="gray.500" textAlign="center">
				AI проверит документ, затем данные будут записаны в VeChain блокчейн
			</Text>
		</VStack>
	);
}
