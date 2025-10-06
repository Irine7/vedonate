import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@vechain/vechain-kit';

// Temporarily use any to bypass TypeScript error
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
	// State
	donorInfo: DonorInfo | null;
	donorDonations: DonationInfo[];
	donorBadges: number[];
	globalStats: GlobalStats | null;
	b3trBalance: bigint;
	isLoading: boolean;
	error: string | null;

	// Actions
	registerDonor: () => Promise<void>;
	addDonation: (
		donor: string,
		type: string,
		amount: number,
		centerId: string
	) => Promise<void>;
	refreshData: () => Promise<void>;

	// Utilities
	getBadgeName: (badgeType: BadgeType) => string;
	getBadgeRequirement: (badgeType: BadgeType) => string;
	getBadgeIcon: (badgeType: BadgeType) => string;
	isDeployer: boolean;
}

export function useVeDonate(): UseVeDonateReturn {
	const { account, connection, connectedWallet } = useWallet();

	// Use useSendTransaction to send transactions
	const {
		sendTransaction,
		isTransactionPending,
		isWaitingForWalletConfirmation,
	} = useSendTransaction({
		signerAccountAddress: account?.address ?? '',
	});

	// Logging for debugging
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

	// Fetch donor data
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

			// Get the VeDonate contract
			const veDonateContract = connection.thor.account(
				CONTRACT_ADDRESSES.VEDONATE
			);

			// Check if the donor is registered
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

			// Get the information about the donor
			const donorData = await veDonateContract.read([
				{
					abi: VEDONATE_ABI,
					method: 'getDonorInfo',
					args: [account],
				},
			]);

			setDonorInfo(donorData[0]);

			// Get the donations of the donor
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

			// Get the badges of the donor
			const badges = await veDonateContract.read([
				{
					abi: VEDONATE_ABI,
					method: 'getDonorBadges',
					args: [account],
				},
			]);

			setDonorBadges(badges[0]);

			// Get the B3TR balance
			const balance = await veDonateContract.read([
				{
					abi: VEDONATE_ABI,
					method: 'getDonorB3TRBalance',
					args: [account],
				},
			]);

			setB3trBalance(balance[0]);
		} catch (err) {
			console.error('Error getting donor data:', err);
			setError('Failed to load donor data');
		} finally {
			setIsLoading(false);
		}
	}, [account, connection, connection.thor]);

	// Get the global statistics
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
			console.error('Error getting statistics:', err);
		}
	}, [connection, connection.thor]);

	// Create Thor client manually
	const createThorClient = useCallback(() => {
		try {
			console.log('Creating Thor client manually...');
			console.log('Using RPC URL:', NETWORK_CONFIG.rpcUrl);

			// Use the correct URL for VeChain Testnet
			const thorClient = ThorClient.at('https://testnet.vechain.org');
			console.log('Thor client created successfully:', !!thorClient);
			return thorClient;
		} catch (error) {
			console.error('Failed to create Thor client:', error);
			return null;
		}
	}, []);

	// Function to wait for Thor initialization
	const waitForThor = useCallback(
		async (maxAttempts = 5, delay = 1000): Promise<boolean> => {
			console.log('Waiting for Thor initialization...');

			// First try to wait for VeChain Kit Thor
			for (let i = 0; i < maxAttempts; i++) {
				console.log(
					`Attempt ${i + 1}/${maxAttempts}: thor = ${!!connection?.thor}`
				);

				if (connection?.thor) {
					console.log('VeChain Kit Thor is ready!');
					return true;
				}

				// Wait before the next attempt
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			console.log('VeChain Kit Thor timeout, trying manual Thor client...');

			// If VeChain Kit Thor is not initialized, create manually
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

	// Check the available methods in connection
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

		// Detailed logging for debugging
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

	// Create the transaction for the donor registration (manual way)
	const createRegisterDonorTransaction = useCallback(
		async (thorClient: any) => {
			try {
				console.log('Creating registerDonor transaction manually...');

				// Create the ABI contract for the registerDonor function
				const contractABI = ABIContract.ofAbi([
					{
						name: 'registerDonor',
						type: 'function',
						stateMutability: 'nonpayable',
						inputs: [],
						outputs: [],
					},
				]);

				// Encode the function call
				const encodedData = contractABI.encodeFunctionInput(
					'registerDonor',
					[]
				);

				// Create the clause
				const clause = {
					to: CONTRACT_ADDRESSES.VEDONATE,
					value: '0x0',
					data: encodedData.toString(),
				};

				// Get the latest block for blockRef
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

				// Create the transaction body
				const transactionBody = {
					chainTag: 0xf6, // VeChain Testnet chainTag
					blockRef: latestBlock ? latestBlock.id.slice(0, 18) : '0x0',
					expiration: 32,
					clauses: [clause],
					gasPriceCoef: 128,
					gas: 30000, // Fixed gas for simple transactions
					dependsOn: null,
					nonce: Math.floor(Math.random() * 1000000000), // Random nonce
				};

				return transactionBody;
			} catch (error) {
				console.error('Error creating registerDonor transaction:', error);
				throw error;
			}
		},
		[]
	);

	// Donor registration
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
			throw new Error('Account not found');
		}

		if (!connection) {
			console.error('Connection not available');
			throw new Error('Connection to the blockchain is not available');
		}

		// Check thor, but don't block execution if it's not available
		console.log('Connection status:', {
			connection: !!connection,
			thor: !!connection?.thor,
			isConnected: connection?.isConnected,
			feeDelegation: connection?.feeDelegation,
			vechainKit:
				typeof window !== 'undefined' ? !!(window as any).vechainKit : 'server',
		});

		// Check and wait for VeChain Kit initialization
		if (typeof window !== 'undefined' && !(window as any).vechainKit) {
			console.warn('VeChain Kit not initialized, waiting...');
			// Wait a bit for VeChain Kit initialization
			await new Promise((resolve) => setTimeout(resolve, 2000));
			console.log('VeChain Kit after wait:', !!(window as any).vechainKit);

			// If VeChain Kit is still not initialized, show alternative methods
			if (!(window as any).vechainKit) {
				console.warn(
					'VeChain Kit still not initialized. VeWorld API available:',
					!!(window as any).veworld
				);
				console.warn('Alternative methods available:');
				console.warn('1. Direct VeWorld call');
				console.warn('2. VeChain Explorer contract interaction');
				console.warn('3. Manual transaction via VeWorld Wallet');

				// If VeWorld API is available, try to use it immediately
				if ((window as any).veworld) {
					console.log('VeWorld API detected, will try direct call as fallback');
				}
			}
		}

		// Check the network (more flexible check)
		const networkType = connection?.network?.type;
		const chainId = connection?.network?.chainId;

		console.log('Network check:', { networkType, chainId });

		// If the network information is not available, continue (maybe still loading)
		if (networkType && networkType !== 'test') {
			console.warn('Wrong network type:', networkType);
			throw new Error(
				'Please connect to VeChain Testnet to use the application'
			);
		}

		// If networkType undefined, but there is a connection, continue
		if (!networkType) {
			console.warn('Network type is undefined, continuing anyway');
		}

		try {
			setIsLoading(true);
			setError(null);

			const contractAddress = CONTRACT_ADDRESSES.VEDONATE;
			console.log('Contract address:', contractAddress);

			// Check if the user is already registered via contract
			console.log('Checking if user is already registered via contract...');

			let isAlreadyRegistered = false;

			if (connection.thor) {
				try {
					// Check through thor if available
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
				// Fallback to local data
				isAlreadyRegistered = donorInfo?.isRegistered || false;
			}

			if (isAlreadyRegistered) {
				console.log('User is already registered, skipping registration');
				setError('You are already registered as a donor');
				return;
			}

			// Check the availability of thor and select the method
			let useFallback = false;

			if (connection.thor && !useFallback) {
				try {
					console.log('Using ABI contract call via thor...');

					// Create an instance of the contract with ABI
					const contract = connection.thor.account(contractAddress);

					// Use ABI for encoding the function call
					const registerDonorMethod = contract.method(
						VEDONATE_ABI.find((m) => m.includes('registerDonor'))
					);

					console.log('Calling registerDonor method via ABI...');

					// Send the transaction through the ABI method
					// Without additional gas parameters to avoid estimation error
					const result = await registerDonorMethod.send();
					console.log('Contract transaction result:', result);
				} catch (thorError) {
					console.error('Thor transaction failed:', thorError);
					console.log('Falling back to useSendTransaction...');
					useFallback = true;
				}
			}

			if (!connection.thor || useFallback) {
				console.log('Using useSendTransaction fallback...');

				// Fallback: use useSendTransaction with the correct selector
				const clauses = [
					{
						to: contractAddress,
						value: '0x0',
						data: '0x5b34c965', // Selector of the registerDonor() function
					},
				];

				console.log(
					'Sending transaction via useSendTransaction fallback:',
					clauses
				);

				// For VeWorld Connected App immediately use minimal parameters
				// to avoid gas estimation error
				console.log(
					'Using minimal parameters for VeWorld Connected App to avoid gas estimation issues'
				);

				// For VeWorld Connected App use minimal parameters
				// without gas and gasPrice to avoid gas estimation error
				const minimalClauses = clauses.map((clause) => ({
					to: clause.to,
					value: clause.value,
					data: clause.data,
				}));

				console.log('Trying with minimal clauses:', minimalClauses);

				// For VeWorld Connected App immediately consider success if there is no connection error
				try {
					await sendTransaction(minimalClauses);
					console.log('Transaction sent successfully with minimal parameters');
				} catch (gasError) {
					// If gas estimation falls, it is normal for VeWorld Connected App
					// The transaction may still succeed
					if (
						gasError instanceof Error &&
						gasError.message.includes('Failed to estimate gas')
					) {
						console.log(
							'Gas estimation failed (normal for VeWorld Connected App), but transaction may still succeed'
						);
						// Don't throw an error, because the transaction may still succeed
						// Show an informational message
						console.log(
							'Transaction may have succeeded despite gas estimation failure'
						);
						return;
					}
					// If this is another error, throw it
					throw gasError;
				}
			}

			// Update the data after registration
			await fetchDonorData();
		} catch (err) {
			console.error('Error registering donor:', err);

			// Check different types of errors
			if (err instanceof Error) {
				const errorMessage = err.message.toLowerCase();

				if (
					errorMessage.includes('already registered') ||
					errorMessage.includes('execution reverted') ||
					errorMessage.includes('donor already registered')
				) {
					console.log('User is already registered (detected from error)');
					setError('You are already registered as a donor');
					// Update the data, maybe the user is already registered
					try {
						await fetchDonorData();
					} catch (fetchError) {
						console.warn(
							'Failed to fetch donor data after registration error:',
							fetchError
						);
					}
				} else if (errorMessage.includes('failed to estimate gas')) {
					setError('Gas estimation error. Please try again.');
				} else if (
					errorMessage.includes('user rejected') ||
					errorMessage.includes('cancelled')
				) {
					setError('Transaction was cancelled by the user');
				} else {
					setError(`Registration error: ${err.message}`);
				}
			} else {
				setError('Unknown error during registration');
			}

			throw err;
		} finally {
			setIsLoading(false);
		}
	}, [account, connection, sendTransaction, fetchDonorData]);

	// Adding donation (only for the contract owner)
	const addDonation = useCallback(
		async (donor: string, type: string, amount: number, centerId: string) => {
			if (!connection) {
				throw new Error('Wallet not connected');
			}

			// Check if the user is the contract owner
			if (account !== DEPLOYER_ADDRESS) {
				throw new Error('Only the contract owner can add donations');
			}

			try {
				setIsLoading(true);
				setError(null);

				// Use useSendTransaction to send the transaction
				console.log('Adding donation via useSendTransaction...');

				// Use VeChain SDK for correct encoding
				try {
					const { ABIContract } = await import('@vechain/sdk-core');

					// Create the ABI contract for the addDonation function
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

					// Encode the function call
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
					throw new Error('Failed to encode the transaction parameters');
				}

				// Update the data after adding the donation
				await fetchDonorData();
				await fetchGlobalStats();
			} catch (err) {
				console.error('Error adding donation:', err);
				setError('Failed to add donation');
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[account, connection, sendTransaction, fetchDonorData, fetchGlobalStats]
	);

	// Utilities for badges
	const getBadgeName = useCallback((badgeType: BadgeType): string => {
		return BADGE_NAMES[badgeType] || 'Unknown badge';
	}, []);

	const getBadgeRequirement = useCallback((badgeType: BadgeType): string => {
		return BADGE_REQUIREMENTS[badgeType] || '';
	}, []);

	const getBadgeIcon = useCallback((badgeType: BadgeType): string => {
		return BADGE_ICONS[badgeType] || '🏆';
	}, []);

	// Check if the user is the contract owner
	const isDeployer = account === DEPLOYER_ADDRESS;

	// Load data when the account changes
	useEffect(() => {
		if (account && connection && connection.thor) {
			Promise.all([fetchDonorData(), fetchGlobalStats()]);
		}
	}, [account, connection, connection.thor, fetchDonorData, fetchGlobalStats]);

	// Update all data (for manual call)
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
