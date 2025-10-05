// Конфигурация смарт-контрактов VeDonate для VeChain Testnet
export const CONTRACT_ADDRESSES = {
	// VeChain Testnet адреса (деплоены 05.10.2024)
	B3TR_TOKEN:
		process.env.NEXT_PUBLIC_B3TR_TOKEN_ADDRESS ||
		'0x3e0d2d748f66a56b3ed4d1afbe2e63a9db2844c3',
	DONOR_BADGES:
		process.env.NEXT_PUBLIC_DONOR_BADGES_ADDRESS ||
		'0x9575e91189e60b4e9a41f136c87d177e42296a88',
	VEDONATE:
		process.env.NEXT_PUBLIC_VEDONATE_ADDRESS ||
		'0x3e445638b907d942c33b904d6ea6951ac533bc34',
};

// Адрес деплойера (владельца контрактов)
export const DEPLOYER_ADDRESS =
	process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS ||
	'0xa5e7D3f660893F67aCf000f117a4dDdAD3bf8a07';

// Сетевая конфигурация
export const NETWORK_CONFIG = {
	chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '100010'),
	rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet.vechain.org',
	explorerUrl:
		process.env.NEXT_PUBLIC_EXPLORER_URL ||
		'https://explore-testnet.vechain.org',
	networkType: process.env.NEXT_PUBLIC_NETWORK_TYPE || 'test',
};

// ABI контрактов
export const B3TR_TOKEN_ABI = [
	'function balanceOf(address owner) view returns (uint256)',
	'function totalSupply() view returns (uint256)',
	'function name() view returns (string)',
	'function symbol() view returns (string)',
	'function decimals() view returns (uint8)',
	'function rewardDonor(address donor, string memory donationType) external',
	'event TokensRewarded(address indexed donor, uint256 amount, string donationType)',
];

export const DONOR_BADGES_ABI = [
	'function balanceOf(address owner) view returns (uint256)',
	'function tokenURI(uint256 tokenId) view returns (string)',
	'function getDonorBadges(address donor) view returns (uint256[])',
	'function donorHasBadge(address donor, uint8 badgeType) view returns (bool)',
	'function mintBadge(address donor, uint8 badgeType) external',
	'event BadgeMinted(address indexed donor, uint256 tokenId, uint8 badgeType)',
	'event BadgeAwarded(address indexed donor, uint8 badgeType)',
];

export const VEDONATE_ABI = [
	'function registerDonor() external',
	'function addDonation(address donor, string memory donationType, uint256 amount, string memory centerId) external',
	'function getDonorInfo(address donor) view returns (tuple(address wallet, uint256 totalDonations, uint256 plasmaDonations, uint256 totalB3TR, bool isRegistered, uint256 lastDonation))',
	'function getDonorDonations(address donor) view returns (uint256[])',
	'function getDonationInfo(uint256 donationId) view returns (tuple(address donor, uint256 timestamp, string donationType, uint256 amount, string centerId, bool verified, uint256 b3trReward))',
	'function getGlobalStats() view returns (uint256 totalDonations, uint256 totalDonors, uint256 totalB3TRDistributed)',
	'function isDonorRegistered(address donor) view returns (bool)',
	'function getDonorB3TRBalance(address donor) view returns (uint256)',
	'function getDonorBadges(address donor) view returns (uint256[])',
	'event DonationAdded(address indexed donor, uint256 indexed donationId, string donationType, uint256 amount, string centerId)',
	'event DonorRegistered(address indexed donor)',
	'event DonationVerified(uint256 indexed donationId, bool verified)',
	'event RewardsDistributed(address indexed donor, uint256 b3trAmount)',
];

// Типы для TypeScript
export interface DonorInfo {
	wallet: string;
	totalDonations: bigint;
	plasmaDonations: bigint;
	totalB3TR: bigint;
	isRegistered: boolean;
	lastDonation: bigint;
}

export interface DonationInfo {
	donor: string;
	timestamp: bigint;
	donationType: string;
	amount: bigint;
	centerId: string;
	verified: boolean;
	b3trReward: bigint;
}

export interface GlobalStats {
	totalDonations: bigint;
	totalDonors: bigint;
	totalB3TRDistributed: bigint;
}

export enum BadgeType {
	FIRST_DONATION = 0,
	BRONZE_DONOR = 1,
	SILVER_DONOR = 2,
	GOLD_DONOR = 3,
	PLASMA_MASTER = 4,
	LIFESAVER = 5,
}

export const BADGE_NAMES = {
	[BadgeType.FIRST_DONATION]: 'Первая донация',
	[BadgeType.BRONZE_DONOR]: 'Бронзовый донор',
	[BadgeType.SILVER_DONOR]: 'Серебряный донор',
	[BadgeType.GOLD_DONOR]: 'Золотой донор',
	[BadgeType.PLASMA_MASTER]: 'Мастер плазмы',
	[BadgeType.LIFESAVER]: 'Спасатель жизней',
};

export const BADGE_REQUIREMENTS = {
	[BadgeType.FIRST_DONATION]: '1 донация',
	[BadgeType.BRONZE_DONOR]: '5 донаций',
	[BadgeType.SILVER_DONOR]: '10 донаций',
	[BadgeType.GOLD_DONOR]: '25 донаций',
	[BadgeType.PLASMA_MASTER]: '10 донаций плазмы',
	[BadgeType.LIFESAVER]: '50 донаций',
};

export const BADGE_ICONS = {
	[BadgeType.FIRST_DONATION]: '🥉',
	[BadgeType.BRONZE_DONOR]: '🥉',
	[BadgeType.SILVER_DONOR]: '🥈',
	[BadgeType.GOLD_DONOR]: '🥇',
	[BadgeType.PLASMA_MASTER]: '💧',
	[BadgeType.LIFESAVER]: '❤️',
};
