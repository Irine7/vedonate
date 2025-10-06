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
				title: 'Error',
				description: 'Please select a file and make sure wallet is connected',
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
			message: 'Uploading file...',
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
				message: 'AI analyzing document...',
			});

			// Симуляция AI обработки
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Добавляем донацию в блокчейн
			setUploadState({
				isUploading: false,
				progress: 100,
				status: 'processing',
				message: 'Writing to blockchain...',
			});

			await addDonation(account, donationType, parseInt(amount), centerId);

			// Успешное завершение
			setUploadState({
				isUploading: false,
				progress: 100,
				status: 'success',
				message: `Donation confirmed! Received ${
					donationType === 'blood' ? '10' : '15'
				} B3TR tokens`,
			});

			toast({
				title: 'Success!',
				description:
					'Donation recorded in blockchain. Tokens and NFT received.',
				status: 'success',
				duration: 5000,
				isClosable: true,
			});
		} catch (error) {
			setUploadState({
				isUploading: false,
				progress: 0,
				status: 'error',
				message: 'Error processing document or writing to blockchain',
			});

			toast({
				title: 'Error',
				description: 'Failed to process document or write to blockchain',
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
						<AlertTitle>Donation confirmed!</AlertTitle>
						<AlertDescription>
							Data recorded in VeChain blockchain. Tokens and NFT awarded.
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
						<AlertTitle>Verification Error</AlertTitle>
						<AlertDescription>
							Failed to verify donation. Check photo quality and blockchain
							connection.
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
				<FormLabel>Donation Type</FormLabel>
				<Select
					value={donationType}
					onChange={(e) =>
						setDonationType(e.target.value as 'blood' | 'plasma')
					}
					disabled={uploadState.isUploading}
				>
					<option value="blood">Blood (450 ml) - 10 B3TR</option>
					<option value="plasma">Plasma (600 ml) - 15 B3TR</option>
				</Select>
			</FormControl>

			<FormControl>
				<FormLabel>Amount (ml)</FormLabel>
				<Input
					type="number"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					disabled={uploadState.isUploading}
					placeholder="450"
				/>
			</FormControl>

			<FormControl>
				<FormLabel>Donation Center ID</FormLabel>
				<Select
					value={centerId}
					onChange={(e) => setCenterId(e.target.value)}
					disabled={uploadState.isUploading}
				>
					<option value="center-001">Blood Center #1</option>
					<option value="center-002">Health Medical Center</option>
					<option value="center-003">Hospital #5</option>
				</Select>
			</FormControl>

			<Box>
				<Text mb={2} fontWeight="medium">
					Select donation certificate photo:
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
						Selected file: {selectedFile.name}
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
				loadingText="Processing..."
				isLoading={uploadState.isUploading}
			>
				<Icon mr={2}>
					<Text>📸</Text>
				</Icon>
				Upload and record in blockchain
			</Button>

			<Text fontSize="xs" color="gray.500" textAlign="center">
				AI will verify the document, then data will be recorded in VeChain
				blockchain
			</Text>
		</VStack>
	);
}
