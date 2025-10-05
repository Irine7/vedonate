import { useWallet } from '@vechain/vechain-kit';

export function useSafeWallet() {
	try {
		return useWallet();
	} catch (error) {
		console.debug('Wallet provider not ready:', error);
		return {
			account: null,
			smartAccount: { address: null, isDeployed: false },
			connectedWallet: null,
			connection: {
				isLoading: false,
				source: { type: 'none' },
				network: 'unknown',
			},
		};
	}
}
