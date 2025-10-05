require('@vechain/sdk-hardhat-plugin');
const { VET_DERIVATION_PATH } = require('@vechain/sdk-core');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		compilers: [
			{
				version: '0.8.20',
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
					},
					evmVersion: 'paris',
				},
			},
		],
	},
	networks: {
		vechain_testnet: {
			url: 'https://testnet.vechain.org',
			accounts: {
				mnemonic:
					process.env.MNEMONIC ||
					'vivid any call mammal mosquito budget midnight expose spirit approve reject system',
				path: VET_DERIVATION_PATH,
				count: 3,
				initialIndex: 0,
				passphrase: 'vechainthor',
			},
			debug: true,
			delegator: undefined,
			gas: 'auto',
			gasPrice: 'auto',
			gasMultiplier: 1,
			timeout: 20000,
			httpHeaders: {},
		},
	},
	etherscan: {
		apiKey: {
			vechain_testnet: 'vechain_testnet',
		},
		customChains: [
			{
				network: 'vechain_testnet',
				chainId: 100010,
				urls: {
					apiURL: 'https://explore-testnet.vechain.org/api',
					browserURL: 'https://explore-testnet.vechain.org',
				},
			},
		],
	},
};
