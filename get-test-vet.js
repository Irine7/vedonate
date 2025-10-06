// Script for getting test VET tokens for VeChain Testnet
const { ThorClient } = require('@vechain/sdk-network');

// Конфигурация VeChain Testnet
const thor = ThorClient.fromUrl('https://testnet.vechain.org');

async function getTestVET() {
	console.log('💰 Getting test VET tokens for VeChain Testnet');
	console.log('');

	console.log('🔗 Available faucets:');
	console.log('');

	console.log('1️⃣ VeChain Official Faucet:');
	console.log('   URL: https://faucet.vecha.in/');
	console.log('   Description: Official faucet from VeChain');
	console.log('   Limit: Up to 10 VET per day');
	console.log('');

	console.log('2️⃣ VeChain Community Faucet:');
	console.log('   URL: https://faucet.vechain.org/');
	console.log('   Description: Community faucet');
	console.log('   Limit: Up to 5 VET per day');
	console.log('');

	console.log('3️⃣ VeChain Testnet Faucet (Discord):');
	console.log('   URL: https://discord.gg/vechain');
	console.log('   Description: Faucet through Discord bot');
	console.log('   Command: !faucet <address>');
	console.log('');

	console.log('📋 Instructions for use:');
	console.log('');
	console.log('1. Go to one of the faucet sites');
	console.log('2. Enter your wallet address');
	console.log('3. Pass the captcha or verification');
	console.log('4. Wait for VET to arrive at your address');
	console.log('5. Check the balance in explorer');
	console.log('');

	console.log('🔍 Check balance:');
	console.log(
		'   URL: https://explore-testnet.vechain.org/accounts/<your_address>'
	);
	console.log('');

	console.log('⚠️ Important notes:');
	console.log('   - Faucets have time limits');
	console.log('   - Do not abuse faucet services');
	console.log('   - One address can get a limited amount of VET');
	console.log(
		'   - VET is only needed for gas payment (usually 0.1-1 VET is enough)'
	);
	console.log('');

	console.log('💡 Alternative ways:');
	console.log('   - Ask for VET from other developers');
	console.log('   - Use an existing wallet with VET');
	console.log('   - Join the VeChain community');
	console.log('');

	console.log('🎯 Minimum amount for donor registration:');
	console.log('   - Gas for registration: ~0.1 VET');
	console.log('   - Recommended amount: 1-2 VET');
	console.log('   - This will cover several transactions');
}

// Run
getTestVET().catch(console.error);
