const { ethers } = require('hardhat');

/**
 * 🔍 Getting the deployer address for getting test VET tokens
 */

async function getDeployerAddress() {
	console.log('🔍 Determining the deployer address...\n');

	try {
		// Get accounts from hardhat configuration
		const [deployer, donor1, donor2] = await ethers.getSigners();

		console.log('📋 Accounts for testing:');
		console.log('=============================');
		console.log(`👤 Deployer (index 0): ${deployer.address}`);
		console.log(`👤 Donor 1 (index 1):  ${donor1.address}`);
		console.log(`👤 Donor 2 (index 2):  ${donor2.address}`);
		console.log('');

		console.log('💰 Checking balances:');
		console.log('=====================');

		const deployerBalance = await ethers.provider.getBalance(deployer.address);
		const donor1Balance = await ethers.provider.getBalance(donor1.address);
		const donor2Balance = await ethers.provider.getBalance(donor2.address);

		console.log(`💰 Deployer: ${ethers.formatEther(deployerBalance)} VET`);
		console.log(`💰 Donor 1:  ${ethers.formatEther(donor1Balance)} VET`);
		console.log(`💰 Donor 2:  ${ethers.formatEther(donor2Balance)} VET`);
		console.log('');

		// Determine who needs tokens
		const minBalance = ethers.parseEther('1'); // Minimum 1 VET for testing

		console.log('🎯 Recommendations:');
		console.log('================');

		if (deployerBalance < minBalance) {
			console.log(`⚠️  Deployer needs VET tokens!`);
			console.log(`📍 Address for faucet: ${deployer.address}`);
			console.log('');
		}

		if (donor1Balance < minBalance) {
			console.log(`⚠️  Donor 1 needs VET tokens!`);
			console.log(`📍 Address for faucet: ${donor1.address}`);
			console.log('');
		}

		if (donor2Balance < minBalance) {
			console.log(`⚠️  Donor 2 needs VET tokens!`);
			console.log(`📍 Address for faucet: ${donor2.address}`);
			console.log('');
		}

		if (
			deployerBalance >= minBalance &&
			donor1Balance >= minBalance &&
			donor2Balance >= minBalance
		) {
			console.log('✅ All accounts have enough VET balance!');
			console.log('🚀 Ready to test!');
		} else {
			console.log('📝 Instructions:');
			console.log('==============');
			console.log('1. Open https://faucet.vechain.org/');
			console.log('2. Enter the addresses above');
			console.log('3. Get test VET tokens');
			console.log('4. Run tests: npm run test:all');
		}

		console.log('');
		console.log('🔗 Links:');
		console.log('==========');
		console.log('• VeChain Faucet: https://faucet.vechain.org/');
		console.log(
			'• VeChain Testnet Explorer: https://explore-testnet.vechain.org/'
		);

		// Output the deployer address for copying
		console.log('');
		console.log('📋 COPY THIS ADDRESS FOR FAUCET:');
		console.log('=====================================');
		console.log(deployer.address);
		console.log('=====================================');
	} catch (error) {
		console.error('💥 Error getting addresses:', error);
		throw error;
	}
}

getDeployerAddress()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('💥 Error executing');
		process.exit(1);
	});
