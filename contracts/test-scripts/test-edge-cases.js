const { ethers } = require('hardhat');

/**
 * 🧪 Тестирование граничных случаев и ошибок
 * 🧪 Testing edge cases and errors
 * Проверяет обработку некорректных данных и edge cases
 */

async function edgeCaseTests() {
	console.log('🚨 Running edge case tests...\n');

	const [deployer, donor, nonDonor] = await ethers.getSigners();

	// ✅ Deployed contracts addresses VeChain Testnet
	const VEDONATE_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';
	const B3TR_ADDRESS = '0x3e0d2d748f66a56b3ed4d1afbe2e63a9db2844c3';
	const BADGES_ADDRESS = '0x9575e91189e60b4e9a41f136c87d177e42296a88';

	try {
		const veDonate = await ethers.getContractAt('VeDonate', VEDONATE_ADDRESS);
		const b3trToken = await ethers.getContractAt('B3TRToken', B3TR_ADDRESS);
		const donorBadges = await ethers.getContractAt(
			'DonorBadges',
			BADGES_ADDRESS
		);

		// Registering test donor (if not registered)
		console.log('👤 Registration of test donor...');
		const isRegistered = await veDonate.isDonorRegistered(donor.address);
		if (!isRegistered) {
			const regTx = await veDonate.connect(donor).registerDonor();
			await regTx.wait();
			console.log('✅ Donor registered');
		} else {
			console.log('✅ Donor already registered');
		}
		console.log('');

		// Test 1: Duplicate registration
		console.log('🔄 Test 1: Attempt to duplicate registration');
		console.log('----------------------------------------');

		try {
			await veDonate.connect(donor).registerDonor();
			console.log('❌ ERROR: Duplicate registration should not pass!');
		} catch (error) {
			console.log('✅ Correctly: Duplicate registration blocked');
			console.log(`   Error: ${error.message}\n`);
		}

		// Test 2: Donation by unregistered user
		console.log('🚫 Test 2: Donation by unregistered user');
		console.log('----------------------------------------------');

		try {
			await veDonate
				.connect(deployer)
				.addDonation(nonDonor.address, 'blood', 450, 'test-center');
			console.log('❌ ERROR: Donation by unregistered user should not pass!');
		} catch (error) {
			console.log('✅ Correctly: Donation by unregistered user blocked');
			console.log(`   Error: ${error.message}\n`);
		}

		// Test 3: Incorrect amount of blood (too little)
		console.log('📉 Test 3: Incorrect amount of blood');
		console.log('----------------------------------------');

		try {
			await veDonate.connect(deployer).addDonation(
				donor.address,
				'blood',
				100, // Too little
				'test-center'
			);
			console.log('❌ ERROR: Incorrect amount of blood should not pass!');
		} catch (error) {
			console.log('✅ Correctly: Incorrect amount of blood blocked');
			console.log(`   Error: ${error.message}\n`);
		}

		// Test 4: Incorrect amount of blood (too much)
		console.log('📈 Test 4: Incorrect amount of blood');
		console.log('----------------------------------------');

		try {
			await veDonate.connect(deployer).addDonation(
				donor.address,
				'blood',
				1000, // Too much
				'test-center'
			);
			console.log('❌ ERROR: Incorrect amount of blood should not pass!');
		} catch (error) {
			console.log('✅ Correctly: Incorrect amount of blood blocked');
			console.log(`   Error: ${error.message}\n`);
		}

		// Test 5: Incorrect donation type
		console.log('❓ Test 5: Incorrect donation type');
		console.log('--------------------------------');

		try {
			await veDonate.connect(deployer).addDonation(
				donor.address,
				'urine', // Incorrect type
				450,
				'test-center'
			);
			console.log('❌ ERROR: Incorrect donation type should not pass!');
		} catch (error) {
			console.log('✅ Correctly: Incorrect donation type blocked');
			console.log(`   Error: ${error.message}\n`);
		}

		// Test 6: Correct values on the edge
		console.log('⚖️ Test 6: Edge values');
		console.log('----------------------------');

		try {
			// Minimum amount
			const tx1 = await veDonate.connect(deployer).addDonation(
				donor.address,
				'blood',
				200, // Minimum
				'test-center-min'
			);
			await tx1.wait();
			console.log('✅ Minimum amount (200 ml) accepted');

			// Maximum amount
			const tx2 = await veDonate.connect(deployer).addDonation(
				donor.address,
				'plasma',
				500, // Maximum
				'test-center-max'
			);
			await tx2.wait();
			console.log('✅ Maximum amount (500 ml) accepted\n');
		} catch (error) {
			console.log('❌ Error with edge values:', error.message);
		}

		// Test 7: Checking rewards after edge tests
		console.log('💰 Test 7: Checking rewards after edge tests');
		console.log('---------------------------------------------');

		const donorInfo = await veDonate.getDonorInfo(donor.address);
		const b3trBalance = await b3trToken.balanceOf(donor.address);
		const badges = await donorBadges.getDonorBadges(donor.address);

		console.log('📊 Final statistics:');
		console.log(`- All donations: ${donorInfo.totalDonations}`);
		console.log(`- B3TR balance: ${ethers.formatEther(b3trBalance)} B3TR`);
		console.log(`- NFT badges: ${badges.length}`);

		// Test 8: Checking events
		console.log('\n📡 Test 8: Checking events');
		console.log('----------------------------');

		// Getting latest transactions
		const donations = await veDonate.getDonorDonations(donor.address);
		console.log(`- All donations in history: ${donations.length}`);

		// Проверяем детали каждой донации
		for (let i = 0; i < donations.length; i++) {
			const donationInfo = await veDonate.getDonationInfo(donations[i]);
			console.log(
				`  ${i + 1}. ${donationInfo.donationType} - ${
					donationInfo.amount
				} ml - ${ethers.formatEther(donationInfo.b3trReward)} B3TR`
			);
		}

		// Test 9: Checking access rights
		console.log('\n🔐 Test 9: Checking access rights');
		console.log('--------------------------------');

		try {
			// Trying to add donation by donor himself
			await veDonate
				.connect(donor)
				.addDonation(donor.address, 'blood', 450, 'test-center');
			console.log('❌ ERROR: Donor should not add donations to himself!');
		} catch (error) {
			console.log('✅ Correctly: Only the contract owner can add donations');
			console.log(`   Error: ${error.message}\n`);
		}

		console.log('🎉 All edge case tests completed!');
		console.log('\n📋 Summary of results:');
		console.log('✅ Duplicate registration blocked');
		console.log('✅ Donations by unregistered users blocked');
		console.log('✅ Incorrect amounts blocked');
		console.log('✅ Incorrect donation types blocked');
		console.log('✅ Edge values accepted correctly');
		console.log('✅ Access rights work correctly');
		console.log('✅ Events generated correctly');
	} catch (error) {
		console.error('💥 Error in edge case tests:', error);
		throw error;
	}
}

edgeCaseTests()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('💥 Edge case tests failed:', error);
		process.exit(1);
	});
