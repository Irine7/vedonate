const { ethers } = require('hardhat');

async function quickTest() {
	console.log('⚡ Quick test VeDonate...\n');

	// ✅ Deployed contracts addresses VeChain Testnet
	const VEDONATE_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';
	const B3TR_ADDRESS = '0x3e0d2d748f66a56b3ed4d1afbe2e63a9db2844c3';
	const BADGES_ADDRESS = '0x9575e91189e60b4e9a41f136c87d177e42296a88';

	const signers = await ethers.getSigners();
	const deployer = signers[0];
	const donor = signers[2]; // Use third account instead of second

	console.log('👤 Test donor:', donor.address);
	console.log('🔧 Deployer:', deployer.address);
	console.log('');

	try {
		// Get contracts
		const veDonate = await ethers.getContractAt('VeDonate', VEDONATE_ADDRESS);
		const b3trToken = await ethers.getContractAt('B3TRToken', B3TR_ADDRESS);
		const donorBadges = await ethers.getContractAt(
			'DonorBadges',
			BADGES_ADDRESS
		);

		// Step 1: Registration of donor (if not registered)
		console.log('📝 1. Checking donor registration...');
		try {
			const donorInfo = await veDonate.getDonorInfo(donor.address);
			if (donorInfo.isRegistered) {
				console.log('✅ Donor already registered');
			} else {
				const regTx = await veDonate.connect(donor).registerDonor();
				await regTx.wait();
				console.log('✅ Donor registered');
			}
		} catch (error) {
			// If donor is not registered, register him
			const regTx = await veDonate.connect(donor).registerDonor();
			await regTx.wait();
			console.log('✅ Donor registered');
		}

		// Step 2: Adding donation (if needed)
		console.log('🩸 2. Checking donations...');
		const currentDonorInfo = await veDonate.getDonorInfo(donor.address);
		const currentDonations = currentDonorInfo.totalDonations;

		if (currentDonations < 1) {
			console.log('   Adding new donation...');
			const donationTx = await veDonate
				.connect(deployer)
				.addDonation(donor.address, 'blood', 450, 'quick-test-center');
			await donationTx.wait();
			console.log('✅ Donation added');
		} else {
			console.log(`✅ Donor already has ${currentDonations} donations`);
		}

		// Step 3: Checking results
		console.log('📊 3. Checking results...');

		// Get updated donor information
		const updatedDonorInfo = await veDonate.getDonorInfo(donor.address);
		const b3trBalance = await b3trToken.balanceOf(donor.address);
		const badges = await donorBadges.getDonorBadges(donor.address);

		console.log('');
		console.log('🎯 Test results:');
		console.log(`   👤 Donations: ${updatedDonorInfo.totalDonations}`);
		console.log(`   💰 B3TR: ${ethers.formatEther(b3trBalance)}`);
		console.log(`   🏆 Badges: ${badges.length}`);

		// Checking success - considering current state
		const expectedDonations = updatedDonorInfo.totalDonations.toString();
		const expectedB3TR = b3trBalance.toString();
		const expectedBadges = badges.length;

		// Checking that donor is registered and has donations
		const isSuccess =
			updatedDonorInfo.isRegistered &&
			parseInt(expectedDonations) >= 1 &&
			parseInt(expectedB3TR) >= 10000000000000000000 && // minimum 10 B3TR
			expectedBadges >= 1;

		if (isSuccess) {
			console.log('');
			console.log('🎉 QUICK TEST PASSED! ✅');
			console.log('All main functions work correctly');
		} else {
			console.log('');
			console.log('❌ QUICK TEST FAILED!');
			console.log('Check contracts and addresses');
		}
	} catch (error) {
		console.error('');
		console.error('💥 Error in quick test:', error.message);
		console.error('');
		console.error('🔧 Possible reasons:');
		console.error('   1. Incorrect contract addresses');
		console.error('   2. Contracts not deployed');
		console.error('   3. Not enough VET for gas');
		console.error('   4. Incorrect network (should be VeChain Testnet)');
		console.error('');
		console.error('📖 Solution:');
		console.error('   1. Check addresses in CONTRACT_ADDRESSES');
		console.error(
			'   2. Deploy contracts by command: npm run deploy:testnet'
		);
		console.error('   3. Get test VET: https://faucet.vecha.in/');
		throw error;
	}
}

quickTest()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('💥 Quick test failed');
		process.exit(1);
	});
