// Script for creating a new test wallet
const crypto = require('crypto');

async function createTestWallet() {
	try {
		console.log('🔧 Creating a new test wallet...');
		console.log('');

		// Generate a random private key
		const privateKeyBytes = crypto.randomBytes(32);
		const privateKey = '0x' + privateKeyBytes.toString('hex');

		// Create a public key and address (simplified version)
		const publicKey = crypto
			.createHash('sha256')
			.update(privateKeyBytes)
			.digest('hex');
		const address = '0x' + publicKey.slice(-40);

		// Generate a seed phrase (12 words)
		const words = [
			'abandon',
			'ability',
			'able',
			'about',
			'above',
			'absent',
			'absorb',
			'abstract',
			'absurd',
			'abuse',
			'access',
			'accident',
			'account',
			'accuse',
			'achieve',
			'acid',
			'acoustic',
			'acquire',
			'across',
			'act',
			'action',
			'actor',
			'actress',
			'actual',
			'adapt',
			'add',
			'addict',
			'address',
			'adjust',
			'admit',
		];

		const mnemonic = Array.from(
			{ length: 12 },
			() => words[Math.floor(Math.random() * words.length)]
		).join(' ');

		console.log('✅ New wallet created!');
		console.log('');
		console.log('📋 Information about the wallet:');
		console.log(`   🏠 Address: ${address}`);
		console.log(`   🔑 Private key: ${privateKey}`);
		console.log(`   📝 Seed phrase: ${mnemonic}`);
		console.log('');

		console.log('🚀 Now you can use this wallet:');
		console.log(`   PRIVATE_KEY=${privateKey} node register-donor-with-key.js`);
		console.log('');

		console.log('⚠️ IMPORTANT NOTES:');
		console.log('   - This wallet does not have VET for gas payment');
		console.log('   - You need to top up it through VeChain Testnet faucet');
		console.log('   - Faucet: https://faucet.vecha.in/');
		console.log('   - Or get test tokens another way');
		console.log('');

		console.log('🔗 Useful links:');
		console.log(
			`   - Explorer: https://explore-testnet.vechain.org/accounts/${address}`
		);
		console.log('   - Faucet: https://faucet.vecha.in/');
		console.log('   - VeWorld: https://www.veworld.io/');
		console.log('');

		console.log('🛡️ SECURITY:');
		console.log('   - Do not use this wallet in mainnet!');
		console.log('   - This is only for testing!');
		console.log('   - Do not share the private key with others!');

		return {
			address: address,
			privateKey: privateKey,
			mnemonic: mnemonic,
		};
	} catch (error) {
		console.error('❌ Error creating wallet:', error);
	}
}

// Запускаем создание кошелька
createTestWallet().catch(console.error);
