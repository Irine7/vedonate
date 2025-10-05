import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@vechain/vechain-kit';
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
	const { account, connection } = useWallet();
	const [donorInfo, setDonorInfo] = useState<DonorInfo | null>(null);
	const [donorDonations, setDonorDonations] = useState<DonationInfo[]>([]);
	const [donorBadges, setDonorBadges] = useState<number[]>([]);
	const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
	const [b3trBalance, setB3trBalance] = useState<bigint>(BigInt(0));
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Получение данных донора
	const fetchDonorData = useCallback(async () => {
		if (!account || !connection.isConnected || !connection.thor) {
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
	}, [account, connection.isConnected, connection.thor]);

	// Получение глобальной статистики
	const fetchGlobalStats = useCallback(async () => {
		if (!connection.isConnected || !connection.thor) return;

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
	}, [connection.isConnected, connection.thor]);

	// Регистрация донора
	const registerDonor = useCallback(async () => {
		if (!account || !connection.isConnected || !connection.thor) {
			throw new Error('Кошелек не подключен');
		}

		try {
			setIsLoading(true);
			setError(null);

			const veDonateContract = connection.thor.account(
				CONTRACT_ADDRESSES.VEDONATE
			);

			const clause = veDonateContract.transaction('registerDonor').asClause();

			await connection.thor.sendTransaction([clause]);

			// Обновляем данные после регистрации
			await fetchDonorData();
		} catch (err) {
			console.error('Ошибка регистрации донора:', err);
			setError('Не удалось зарегистрироваться как донор');
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, [account, connection.isConnected, connection.thor, fetchDonorData]);

	// Добавление донации (только для владельца контракта)
	const addDonation = useCallback(
		async (donor: string, type: string, amount: number, centerId: string) => {
			if (!connection.isConnected || !connection.thor) {
				throw new Error('Кошелек не подключен');
			}

			// Проверяем, что пользователь является деплойером
			if (account !== DEPLOYER_ADDRESS) {
				throw new Error('Только деплойер может добавлять донации');
			}

			try {
				setIsLoading(true);
				setError(null);

				const veDonateContract = connection.thor.account(
					CONTRACT_ADDRESSES.VEDONATE
				);

				const clause = veDonateContract
					.transaction('addDonation', [donor, type, amount, centerId])
					.asClause();

				await connection.thor.sendTransaction([clause]);

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
		[connection.isConnected, connection.thor, fetchDonorData, fetchGlobalStats]
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
		if (account && connection.isConnected && connection.thor) {
			Promise.all([fetchDonorData(), fetchGlobalStats()]);
		}
	}, [
		account,
		connection.isConnected,
		connection.thor,
		fetchDonorData,
		fetchGlobalStats,
	]);

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
