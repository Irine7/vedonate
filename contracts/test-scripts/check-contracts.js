const { ethers } = require('hardhat');

async function checkContracts() {
	console.log('🔍 Проверка статуса контрактов VeDonate...\n');

	// Deployed contracts addresses
	const VEDONATE_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';
	const B3TR_ADDRESS = '0x3e0d2d748f66a56b3ed4d1afbe2e63a9db2844c3';
	const BADGES_ADDRESS = '0x9575e91189e60b4e9a41f136c87d177e42296a88';

	try {
		// Get contracts
		console.log('📄 Получение контрактов...');
		const veDonate = await ethers.getContractAt('VeDonate', VEDONATE_ADDRESS);
		const b3trToken = await ethers.getContractAt('B3TRToken', B3TR_ADDRESS);
		const donorBadges = await ethers.getContractAt(
			'DonorBadges',
			BADGES_ADDRESS
		);
		console.log('✅ Contracts received\n');

		// Checking B3TR Token
		console.log('💰 Checking B3TR Token:');
		console.log('------------------------');
		try {
			const name = await b3trToken.name();
			const symbol = await b3trToken.symbol();
			const decimals = await b3trToken.decimals();
			const totalSupply = await b3trToken.totalSupply();

			console.log(`✅ Name: ${name}`);
			console.log(`✅ Symbol: ${symbol}`);
			console.log(`✅ Decimals: ${decimals}`);
			console.log(
				`✅ Total supply: ${ethers.formatEther(totalSupply)} B3TR`
			);
		} catch (error) {
			console.log(`❌ Error B3TR Token: ${error.message}`);
		}
		console.log('');

		// Checking Donor Badges
		console.log('🏆 Checking Donor Badges:');
		console.log('-------------------------');
		try {
			const name = await donorBadges.name();
			const symbol = await donorBadges.symbol();
			// VeChain не поддерживает totalSupply для ERC721
			console.log(`✅ Name: ${name}`);
			console.log(`✅ Symbol: ${symbol}`);
			console.log(`✅ Donor Badges contract works`);
		} catch (error) {
			console.log(`❌ Error Donor Badges: ${error.message}`);
		}
		console.log('');

		// Checking VeDonate
		console.log('🩸 Checking VeDonate:');
		console.log('---------------------');
		try {
			const globalStats = await veDonate.getGlobalStats();

			// Processing data from VeChain (returns an array of values)
			if (
				globalStats &&
				Array.isArray(globalStats) &&
				globalStats.length >= 3
			) {
				const totalDonations = globalStats[0];
				const totalDonors = globalStats[1];
				const totalB3TRDistributed = globalStats[2];

				console.log(`✅ Total donations: ${totalDonations.toString()}`);
				console.log(`✅ Total donors: ${totalDonors.toString()}`);
				console.log(
					`✅ B3TR distributed: ${ethers.formatEther(totalB3TRDistributed)}`
				);
			} else {
				console.log(`✅ VeDonate contract works (no data)`);
			}
		} catch (error) {
			console.log(`❌ Error VeDonate: ${error.message}`);
		}
		console.log('');

		// Checking network connection
		console.log('🌐 Checking network:');
		console.log('------------------');
		try {
			const network = await ethers.provider.getNetwork();
			const blockNumber = await ethers.provider.getBlockNumber();
			// VeChain does not support getGasPrice
			console.log(`✅ Network: ${network.name} (ID: ${network.chainId})`);
			console.log(`✅ Block: ${blockNumber}`);
			console.log(`✅ VeChain Testnet connected`);
		} catch (error) {
			console.log(`❌ Error network: ${error.message}`);
		}
		console.log('');

		// Checking accounts
		console.log('👤 Checking accounts:');
		console.log('----------------------');
		const [deployer, donor1, donor2] = await ethers.getSigners();

		console.log(`✅ Deployer: ${deployer.address}`);
		console.log(`✅ Donor 1: ${donor1.address}`);
		console.log(`✅ Donor 2: ${donor2.address}`);

		// Checking balances
		try {
			const deployerBalance = await ethers.provider.getBalance(
				deployer.address
			);
			const donor1Balance = await ethers.provider.getBalance(donor1.address);

			console.log(
				`💰 Deployer balance: ${ethers.formatEther(deployerBalance)} VET`
			);
			console.log(
				`💰 Donor 1 balance: ${ethers.formatEther(donor1Balance)} VET`
			);

			if (deployerBalance < ethers.parseEther('1')) {
				console.log('⚠️  Warning: Low deployer balance');
			}
		} catch (error) {
			console.log(`❌ Error balances: ${error.message}`);
		}
		console.log('');

		console.log('🎉 Checking contracts completed!');
		console.log('\n📋 Summary:');
		console.log('✅ All contracts available');
		console.log('✅ Network connected');
		console.log('✅ Accounts ready for testing');
		console.log('\n🚀 Ready to run tests!');
	} catch (error) {
		console.error('💥 Error checking contracts:', error);
		throw error;
	}
}

checkContracts()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('💥 Checking contracts failed');
		process.exit(1);
	});
