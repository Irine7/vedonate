import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@vechain/vechain-kit';

// Временно используем any для обхода TypeScript ошибки
const useSendTransaction = (require('@vechain/vechain-kit') as any)
	.useSendTransaction;
import { ThorClient } from '@vechain/sdk-network';
import { Clause, Transaction, ABIContract } from '@vechain/sdk-core';
import {
	CONTRACT_ADDRESSES,
	DEPLOYER_ADDRESS,
	VEDONATE_ABI,
	B3TR_TOKEN_ABI,
	DONOR_BADGES_ABI,
	type DonorInfo,
	type DonationInfo,
	type GlobalStats,
	type BadgeType,
	BADGE_NAMES,
	BADGE_REQUIREMENTS,
	BADGE_ICONS,
	NETWORK_CONFIG,
} from '@/lib/contracts';

interface UseVeDonateReturn {
	// Состояние
	donorInfo: DonorInfo | null;
	donorDonations: DonationInfo[];
	donorBadges: number[];
	globalStats: GlobalStats | null;
	b3trBalance: bigint;
	isLoading: boolean;
	error: string | null;

	// Действия
	registerDonor: () => Promise<void>;
	addDonation: (
		donor: string,
		type: string,
		amount: number,
		centerId: string
	) => Promise<void>;
	refreshData: () => Promise<void>;

	// Утилиты
	getBadgeName: (badgeType: BadgeType) => string;
	getBadgeRequirement: (badgeType: BadgeType) => string;
	getBadgeIcon: (badgeType: BadgeType) => string;
	isDeployer: boolean;
}

export function useVeDonate(): UseVeDonateReturn {
	const { account, connection, connectedWallet } = useWallet();

	// Используем useSendTransaction для отправки транзакций
	const {
		sendTransaction,
		isTransactionPending,
		isWaitingForWalletConfirmation,
	} = useSendTransaction({
		signerAccountAddress: account?.address ?? '',
	});

	// Логирование для отладки
	console.log('useVeDonate hook:', {
		account: account?.address,
		connection: !!connection,
		thor: !!connection?.thor,
		isConnected: connection?.isConnected,
		connectedWallet: !!connectedWallet,
		networkType: connection?.network?.type,
		chainId: connection?.network?.chainId,
		vechainKit:
			typeof window !== 'undefined' ? !!(window as any).vechainKit : 'server',
		feeDelegation: connection?.feeDelegation,
	});

	const [donorInfo, setDonorInfo] = useState<DonorInfo | null>(null);
	const [donorDonations, setDonorDonations] = useState<DonationInfo[]>([]);
	const [donorBadges, setDonorBadges] = useState<number[]>([]);
	const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
	const [b3trBalance, setB3trBalance] = useState<bigint>(BigInt(0));
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Получение данных донора
	const fetchDonorData = useCallback(async () => {
		if (!account || !connection || !connection.thor) {
			setDonorInfo(null);
			setDonorDonations([]);
			setDonorBadges([]);
			setB3trBalance(BigInt(0));
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			// Получаем контракт VeDonate
			const veDonateContract = connection.thor.account(
				CONTRACT_ADDRESSES.VEDONATE
			);

			// Проверяем, зарегистрирован ли донор
			const isRegistered = await veDonateContract.read([
				{
					abi: VEDONATE_ABI,
					method: 'isDonorRegistered',
					args: [account],
				},
			]);

			if (!isRegistered[0]) {
				setDonorInfo(null);
				setDonorDonations([]);
				setDonorBadges([]);
				setB3trBalance(BigInt(0));
				return;
			}

			// Получаем информацию о доноре
			const donorData = await veDonateContract.read([
				{
					abi: VEDONATE_ABI,
					method: 'getDonorInfo',
					args: [account],
				},
			]);

			setDonorInfo(donorData[0]);

			// Получаем донации донора
			const donationIds = await veDonateContract.read([
				{
					abi: VEDONATE_ABI,
					method: 'getDonorDonations',
					args: [account],
				},
			]);

			const donations: DonationInfo[] = [];
			for (const donationId of donationIds[0]) {
				const donationData = await veDonateContract.read([
					{
						abi: VEDONATE_ABI,
						method: 'getDonationInfo',
						args: [donationId],
					},
				]);
				donations.push(donationData[0]);
			}

			setDonorDonations(donations);

			// Получаем бейджи донора
			const badges = await veDonateContract.read([
				{
					abi: VEDONATE_ABI,
					method: 'getDonorBadges',
					args: [account],
				},
			]);

			setDonorBadges(badges[0]);

			// Получаем баланс B3TR
			const balance = await veDonateContract.read([
				{
					abi: VEDONATE_ABI,
					method: 'getDonorB3TRBalance',
					args: [account],
				},
			]);

			setB3trBalance(balance[0]);
		} catch (err) {
			console.error('Ошибка получения данных донора:', err);
			setError('Не удалось загрузить данные донора');
		} finally {
			setIsLoading(false);
		}
	}, [account, connection, connection.thor]);

	// Получение глобальной статистики
	const fetchGlobalStats = useCallback(async () => {
		if (!connection || !connection.thor) return;

		try {
			const veDonateContract = connection.thor.account(
				CONTRACT_ADDRESSES.VEDONATE
			);

			const stats = await veDonateContract.read([
				{
					abi: VEDONATE_ABI,
					method: 'getGlobalStats',
					args: [],
				},
			]);

			setGlobalStats(stats[0]);
		} catch (err) {
			console.error('Ошибка получения статистики:', err);
		}
	}, [connection, connection.thor]);

	// Создание Thor клиента вручную
	const createThorClient = useCallback(() => {
		try {
			console.log('Creating Thor client manually...');
			console.log('Using RPC URL:', NETWORK_CONFIG.rpcUrl);

			// Используем правильный URL для VeChain Testnet
			const thorClient = ThorClient.at('https://testnet.vechain.org');
			console.log('Thor client created successfully:', !!thorClient);
			return thorClient;
		} catch (error) {
			console.error('Failed to create Thor client:', error);
			return null;
		}
	}, []);

	// Функция для ожидания инициализации Thor
	const waitForThor = useCallback(
		async (maxAttempts = 5, delay = 1000): Promise<boolean> => {
			console.log('Waiting for Thor initialization...');

			// Сначала попробуем подождать VeChain Kit Thor
			for (let i = 0; i < maxAttempts; i++) {
				console.log(
					`Attempt ${i + 1}/${maxAttempts}: thor = ${!!connection?.thor}`
				);

				if (connection?.thor) {
					console.log('VeChain Kit Thor is ready!');
					return true;
				}

				// Ждем перед следующей попыткой
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			console.log('VeChain Kit Thor timeout, trying manual Thor client...');

			// Если VeChain Kit Thor не инициализировался, создаем вручную
			const manualThor = createThorClient();
			if (manualThor) {
				console.log('Manual Thor client created successfully!');
				return true;
			}

			console.log('All Thor initialization attempts failed');
			return false;
		},
		[connection?.thor, createThorClient]
	);

	// Проверка доступных методов в connection
	const checkConnectionMethods = useCallback(() => {
		if (!connection) {
			console.log('No connection available');
			return { hasSendTransaction: false, hasThor: false };
		}

		console.log('Connection object:', connection);
		console.log('Connection keys:', Object.keys(connection));
		console.log('Connection methods:', Object.getOwnPropertyNames(connection));

		const hasSendTransaction = typeof connection.sendTransaction === 'function';
		const hasThor =
			!!connection.thor &&
			typeof connection.thor.sendTransaction === 'function';

		// Детальное логирование для отладки
		console.log('Detailed connection analysis:', {
			hasConnection: !!connection,
			hasThor: hasThor,
			thorType: typeof connection.thor,
			thorKeys: connection.thor ? Object.keys(connection.thor) : 'no thor',
			hasSendTransaction,
			sendTransactionType: typeof connection.sendTransaction,
			connectionType: connection.source?.type,
			isConnected: connection.isConnected,
			isLoading: connection.isLoading,
		});

		console.log('Available methods:', {
			hasSendTransaction,
			hasThor,
			connectionType: connection.source?.type,
		});

		return { hasSendTransaction, hasThor };
	}, [connection]);

	// Создание транзакции для регистрации донора (ручной способ)
	const createRegisterDonorTransaction = useCallback(
		async (thorClient: any) => {
			try {
				console.log('Creating registerDonor transaction manually...');

				// Создаем ABI контракт для функции registerDonor
				const contractABI = ABIContract.ofAbi([
					{
						name: 'registerDonor',
						type: 'function',
						stateMutability: 'nonpayable',
						inputs: [],
						outputs: [],
					},
				]);

				// Кодируем вызов функции
				const encodedData = contractABI.encodeFunctionInput(
					'registerDonor',
					[]
				);

				// Создаем clause
				const clause = {
					to: CONTRACT_ADDRESSES.VEDONATE,
					value: '0x0',
					data: encodedData.toString(),
				};

				// Получаем последний блок для blockRef
				let latestBlock;
				try {
					latestBlock = await thorClient.blocks.getBestBlockCompressed();
					console.log('Latest block retrieved:', !!latestBlock);
				} catch (blockError) {
					console.warn(
						'Failed to get latest block, using default blockRef:',
						blockError
					);
					latestBlock = null;
				}

				// Создаем тело транзакции
				const transactionBody = {
					chainTag: 0xf6, // VeChain Testnet chainTag
					blockRef: latestBlock ? latestBlock.id.slice(0, 18) : '0x0',
					expiration: 32,
					clauses: [clause],
					gasPriceCoef: 128,
					gas: 30000, // Фиксированный газ для простых транзакций
					dependsOn: null,
					nonce: Math.floor(Math.random() * 1000000000), // Случайный nonce
				};

				return transactionBody;
			} catch (error) {
				console.error('Error creating registerDonor transaction:', error);
				throw error;
			}
		},
		[]
	);

	// Регистрация донора
	const registerDonor = useCallback(async () => {
		console.log('registerDonor called:', {
			account: account?.address,
			connection: !!connection,
			thor: !!connection?.thor,
			connectedWallet: !!connectedWallet,
			networkType: connection?.network?.type,
			chainId: connection?.network?.chainId,
		});

		if (!account) {
			console.error('No account found');
			throw new Error('Аккаунт не найден');
		}

		if (!connection) {
			console.error('Connection not available');
			throw new Error('Подключение к блокчейну недоступно');
		}

		// Проверяем thor, но не блокируем выполнение если он недоступен
		console.log('Connection status:', {
			connection: !!connection,
			thor: !!connection?.thor,
			isConnected: connection?.isConnected,
			feeDelegation: connection?.feeDelegation,
			vechainKit:
				typeof window !== 'undefined' ? !!(window as any).vechainKit : 'server',
		});

		// Проверяем и ждем VeChain Kit инициализацию
		if (typeof window !== 'undefined' && !(window as any).vechainKit) {
			console.warn('VeChain Kit not initialized, waiting...');
			// Ждем немного для инициализации VeChain Kit
			await new Promise((resolve) => setTimeout(resolve, 2000));
			console.log('VeChain Kit after wait:', !!(window as any).vechainKit);

			// Если VeChain Kit все еще не инициализирован, показываем альтернативные способы
			if (!(window as any).vechainKit) {
				console.warn(
					'VeChain Kit still not initialized. VeWorld API available:',
					!!(window as any).veworld
				);
				console.warn('Alternative methods available:');
				console.warn('1. Direct VeWorld call');
				console.warn('2. VeChain Explorer contract interaction');
				console.warn('3. Manual transaction via VeWorld Wallet');

				// Если VeWorld API доступен, сразу попробуем его использовать
				if ((window as any).veworld) {
					console.log('VeWorld API detected, will try direct call as fallback');
				}
			}
		}

		// Проверяем сеть (более гибкая проверка)
		const networkType = connection?.network?.type;
		const chainId = connection?.network?.chainId;

		console.log('Network check:', { networkType, chainId });

		// Если информация о сети недоступна, продолжаем (возможно, еще загружается)
		if (networkType && networkType !== 'test') {
			console.warn('Wrong network type:', networkType);
			throw new Error(
				'Пожалуйста, подключитесь к VeChain Testnet для использования приложения'
			);
		}

		// Если networkType undefined, но есть подключение, продолжаем
		if (!networkType) {
			console.warn('Network type is undefined, continuing anyway');
		}

		try {
			setIsLoading(true);
			setError(null);

			const contractAddress = CONTRACT_ADDRESSES.VEDONATE;
			console.log('Contract address:', contractAddress);

			// Проверяем, зарегистрирован ли уже пользователь через контракт
			console.log('Checking if user is already registered via contract...');

			let isAlreadyRegistered = false;

			if (connection.thor) {
				try {
					// Проверяем через thor если доступен
					const contract = connection.thor.account(contractAddress);
					const isRegisteredMethod = contract.method(
						VEDONATE_ABI.find((m) => m.includes('isDonorRegistered'))
					);
					const result = await isRegisteredMethod.call(account.address);
					isAlreadyRegistered = result.decoded[0];
					console.log('Contract check result:', isAlreadyRegistered);
				} catch (error) {
					console.warn(
						'Failed to check registration via thor, using local data:',
						error
					);
					isAlreadyRegistered = donorInfo?.isRegistered || false;
				}
			} else {
				// Fallback на локальные данные
				isAlreadyRegistered = donorInfo?.isRegistered || false;
			}

			if (isAlreadyRegistered) {
				console.log('User is already registered, skipping registration');
				setError('Вы уже зарегистрированы как донор');
				return;
			}

			// Проверяем доступность thor и выбираем метод
			if (connection.thor) {
				console.log('Using ABI contract call via thor...');

				// Создаем экземпляр контракта с ABI
				const contract = connection.thor.account(contractAddress);

				// Используем ABI для кодирования вызова функции
				const registerDonorMethod = contract.method(
					VEDONATE_ABI.find((m) => m.includes('registerDonor'))
				);

				console.log('Calling registerDonor method via ABI...');

				// Отправляем транзакцию через ABI метод
				const result = await registerDonorMethod.call();
				console.log('Contract call result:', result);
			} else {
				console.log('Thor not available, using useSendTransaction fallback...');

				// Fallback: используем useSendTransaction с правильным селектором
				const clauses = [
					{
						to: contractAddress,
						value: '0x0',
						data: '0x5b34c965', // Селектор функции registerDonor()
					},
				];

				console.log(
					'Sending transaction via useSendTransaction fallback:',
					clauses
				);

				// Попробуем с увеличенным gas в самих clauses
				try {
					const clausesWithGas = clauses.map((clause) => ({
						...clause,
						gas: 100000, // Увеличиваем gas
						gasPriceCoef: 128,
					}));

					console.log('Trying with custom gas in clauses:', clausesWithGas);
					await sendTransaction(clausesWithGas);
					console.log(
						'Transaction sent successfully via fallback with custom gas'
					);
				} catch (gasError) {
					console.warn(
						'Failed with custom gas, trying direct VeWorld method:',
						gasError
					);

					// Немедленно переходим к прямому VeWorld вызову, если gas estimation падает
					if (
						gasError instanceof Error &&
						gasError.message?.includes('Failed to estimate gas')
					) {
						console.log(
							'Gas estimation failed, skipping to direct VeWorld call...'
						);
						throw gasError; // Перебрасываем ошибку, чтобы перейти к catch блоку
					}

					// Последняя попытка - прямой вызов через VeWorld
					try {
						console.log('Attempting direct VeWorld registration...');

						// Проверяем, доступен ли VeWorld API
						if (typeof window !== 'undefined' && (window as any).veworld) {
							console.log('VeWorld API found, attempting direct call...');

							// Прямой вызов через VeWorld API
							const result = await (window as any).veworld.sendTransaction({
								clauses: [
									{
										to: contractAddress,
										value: '0x0',
										data: '0x5b34c965', // registerDonor() selector
									},
								],
								gas: 100000,
								gasPriceCoef: 128,
								dependsOn: null,
								nonce: Math.floor(Math.random() * 1000000000),
							});

							console.log('Direct VeWorld registration successful:', result);
						} else {
							console.log(
								'VeWorld API not available, trying minimal clauses...'
							);

							const minimalClauses = clauses.map((clause) => ({
								to: clause.to,
								value: clause.value,
								data: clause.data,
							}));

							console.log('Trying with minimal clauses:', minimalClauses);
							await sendTransaction(minimalClauses);
							console.log(
								'Transaction sent successfully with minimal parameters'
							);
						}
					} catch (minimalError) {
						console.error('All attempts failed:', minimalError);
						throw minimalError;
					}
				}
			}

			// Обновляем данные после регистрации
			await fetchDonorData();
		} catch (err) {
			console.error('Ошибка регистрации донора:', err);

			// Проверяем различные типы ошибок
			if (err instanceof Error) {
				const errorMessage = err.message.toLowerCase();

				if (
					errorMessage.includes('already registered') ||
					errorMessage.includes('execution reverted') ||
					errorMessage.includes('donor already registered')
				) {
					console.log('User is already registered (detected from error)');
					setError('Вы уже зарегистрированы как донор');
					// Обновляем данные, возможно пользователь уже зарегистрирован
					try {
						await fetchDonorData();
					} catch (fetchError) {
						console.warn(
							'Failed to fetch donor data after registration error:',
							fetchError
						);
					}
				} else if (errorMessage.includes('failed to estimate gas')) {
					setError('Ошибка оценки газа. Попробуйте еще раз.');
				} else if (
					errorMessage.includes('user rejected') ||
					errorMessage.includes('cancelled')
				) {
					setError('Транзакция была отменена пользователем');
				} else {
					setError(`Ошибка регистрации: ${err.message}`);
				}
			} else {
				setError('Неизвестная ошибка при регистрации');
			}

			throw err;
		} finally {
			setIsLoading(false);
		}
	}, [account, connection, sendTransaction, fetchDonorData, donorInfo]);

	// Добавление донации (только для владельца контракта)
	const addDonation = useCallback(
		async (donor: string, type: string, amount: number, centerId: string) => {
			if (!connection) {
				throw new Error('Кошелек не подключен');
			}

			// Проверяем, что пользователь является деплойером
			if (account !== DEPLOYER_ADDRESS) {
				throw new Error('Только деплойер может добавлять донации');
			}

			try {
				setIsLoading(true);
				setError(null);

				// Используем useSendTransaction для отправки транзакции
				console.log('Adding donation via useSendTransaction...');

				// Используем VeChain SDK для правильного кодирования
				try {
					const { ABIContract } = await import('@vechain/sdk-core');

					// Создаем ABI контракт для функции addDonation
					const contractABI = ABIContract.ofAbi([
						{
							name: 'addDonation',
							type: 'function',
							stateMutability: 'nonpayable',
							inputs: [
								{ name: 'donor', type: 'address' },
								{ name: 'donationType', type: 'string' },
								{ name: 'amount', type: 'uint256' },
								{ name: 'centerId', type: 'string' },
							],
							outputs: [],
						},
					]);

					// Кодируем вызов функции
					const encodedData = contractABI.encodeFunctionInput('addDonation', [
						donor,
						type,
						amount,
						centerId,
					]);

					const clauses = [
						{
							to: CONTRACT_ADDRESSES.VEDONATE,
							value: '0x0',
							data: encodedData,
						},
					];

					console.log('Sending addDonation transaction:', clauses);
					await sendTransaction(clauses);
				} catch (abiError) {
					console.error('ABI encoding failed:', abiError);
					throw new Error('Не удалось закодировать параметры транзакции');
				}

				// Обновляем данные после добавления донации
				await fetchDonorData();
				await fetchGlobalStats();
			} catch (err) {
				console.error('Ошибка добавления донации:', err);
				setError('Не удалось добавить донацию');
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[account, connection, sendTransaction, fetchDonorData, fetchGlobalStats]
	);

	// Утилиты для бейджей
	const getBadgeName = useCallback((badgeType: BadgeType): string => {
		return BADGE_NAMES[badgeType] || 'Неизвестный бейдж';
	}, []);

	const getBadgeRequirement = useCallback((badgeType: BadgeType): string => {
		return BADGE_REQUIREMENTS[badgeType] || '';
	}, []);

	const getBadgeIcon = useCallback((badgeType: BadgeType): string => {
		return BADGE_ICONS[badgeType] || '🏆';
	}, []);

	// Проверка, является ли пользователь деплойером
	const isDeployer = account === DEPLOYER_ADDRESS;

	// Загрузка данных при изменении аккаунта
	useEffect(() => {
		if (account && connection && connection.thor) {
			Promise.all([fetchDonorData(), fetchGlobalStats()]);
		}
	}, [account, connection, connection.thor, fetchDonorData, fetchGlobalStats]);

	// Обновление всех данных (для ручного вызова)
	const refreshData = useCallback(async () => {
		await Promise.all([fetchDonorData(), fetchGlobalStats()]);
	}, [fetchDonorData, fetchGlobalStats]);

	return {
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
	};
}
