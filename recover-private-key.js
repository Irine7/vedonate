// Script to recover private key from seed phrase
const { ethers } = require('ethers');

// WARNING: This is only for demonstration!
// In real use, NEVER store seed phrases in code!

async function recoverPrivateKey() {
	// Example seed phrase (REPLACE with real one!)
	const mnemonic =
		'your twelve word seed phrase goes here like this example mnemonic';

	// Address of the wallet to find
	const targetAddress = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';

	try {
		console.log('🔍 Searching for private key for address:', targetAddress);
		console.log(
			'⚠️ WARNING: Do not use this script with real seed phrases!'
		);
		console.log('');

		// Check several derivation paths
		const derivationPaths = [
			"m/44'/818'/0'/0/0", // VeChain standard path
			"m/44'/60'/0'/0/0", // Ethereum standard path
			"m/44'/818'/0'/0", // Alternative VeChain path
		];

		for (let i = 0; i < derivationPaths.length; i++) {
			try {
				const path = derivationPaths[i];
				const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);

				console.log(`🔑 Checking path ${path}:`);
				console.log(`   Адрес: ${wallet.address}`);

				if (wallet.address.toLowerCase() === targetAddress.toLowerCase()) {
					console.log('✅ FOUND! Private key:');
					console.log(`   ${wallet.privateKey}`);
					console.log('');
					console.log('🚀 Now you can use:');
					console.log(
						`   PRIVATE_KEY=${wallet.privateKey} node register-donor-with-key.js`
					);
					return wallet.privateKey;
				}
			} catch (error) {
					console.log(`❌ Error with path ${derivationPaths[i]}:`, error.message);
			}
		}

		console.log('❌ Private key not found for specified address.');
		console.log('💡 Check the correctness of the seed phrase and address.');
	} catch (error) {
		console.error('❌ Error during recovery:', error.message);
	}
}

// Run only if there is a seed phrase
if (process.argv.length > 2) {
	const mnemonic = process.argv[2];
	recoverPrivateKey(mnemonic).catch(console.error);
} else {
	console.log('🔧 Usage:');
	console.log('   node recover-private-key.js "your seed phrase here"');
	console.log('');
	console.log('⚠️ WARNING:');
	console.log(
		'   - Never use this script with real seed phrases!'
	);
	console.log('   - This script is only for demonstration!');
	console.log('   - Use only for test wallets!');
}
