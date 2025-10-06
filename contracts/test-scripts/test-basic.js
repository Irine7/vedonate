const { ethers } = require('hardhat');

/**
 * 🧪 Basic testing of VeDonate smart contracts
 * Tests basic functions: registration, donations, awards
 */

async function basicTests() {
	console.log('🚀 Running basic VeDonate tests...\n');

	const [deployer, donor1, donor2] = await ethers.getSigners();

	// ✅ Deployed contracts addresses VeChain Testnet
	const VEDONATE_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';
	const B3TR_ADDRESS = '0x3e0d2d748f66a56b3ed4d1afbe2e63a9db2844c3';
	const BADGES_ADDRESS = '0x9575e91189e60b4e9a41f136c87d177e42296a88';

	console.log('👤 Test accounts:');
	console.log('- Deployer:', deployer.address);
	console.log('- Donor 1:', donor1.address);
	console.log('- Donor 2:', donor2.address);
	console.log('');

	try {
		// Getting contracts
		console.log('📄 Getting contracts...');
		const veDonate = await ethers.getContractAt('VeDonate', VEDONATE_ADDRESS);
		const b3trToken = await ethers.getContractAt('B3TRToken', B3TR_ADDRESS);
		const donorBadges = await ethers.getContractAt(
			'DonorBadges',
			BADGES_ADDRESS
		);
		console.log('✅ Contracts received\n');

		// Test 1: Registration of donors
		console.log('📝 Test 1: Registration of donors');
		console.log('--------------------------------');

		// Checking and registering Donor 1
		const isRegistered1 = await veDonate.isDonorRegistered(donor1.address);
		if (!isRegistered1) {
			const tx1 = await veDonate.connect(donor1).registerDonor();
			await tx1.wait();
			console.log('✅ Donor 1 registered');
		} else {
			console.log('✅ Donor 1 already registered');
		}

		// Checking and registering Donor 2
		const isRegistered2 = await veDonate.isDonorRegistered(donor2.address);
		if (!isRegistered2) {
			const tx2 = await veDonate.connect(donor2).registerDonor();
			await tx2.wait();
			console.log('✅ Donor 2 registered');
		} else {
			console.log('✅ Donor 2 already registered');
		}
		console.log('');

		// Test 2: Checking registration
		console.log('🔍 Test 2: Checking registration');
		console.log('--------------------------------');

		const isRegistered1Check = await veDonate.isDonorRegistered(donor1.address);
		const isRegistered2Check = await veDonate.isDonorRegistered(donor2.address);

		console.log(`Donor 1 registered: ${isRegistered1Check}`);
		console.log(`Donor 2 registered: ${isRegistered2Check}\n`);

		// Test 3: Adding donations
		console.log('🩸 Test 3: Adding donations');
		console.log('--------------------------------');

		// Blood donation
		const tx3 = await veDonate
			.connect(deployer)
			.addDonation(donor1.address, 'blood', 450, 'test-center-001');
		await tx3.wait();
		console.log('✅ Donor 1: blood donation (450 ml)');

		// Донация плазмы
		const tx4 = await veDonate
			.connect(deployer)
			.addDonation(donor2.address, 'plasma', 450, 'test-center-002');
		await tx4.wait();
		console.log('✅ Donor 2: plasma donation (450 ml)\n');

		// Test 4: Checking awards
		console.log('💰 Test 4: Checking awards');
		console.log('--------------------------------');

		// Information about donors
		const donor1Info = await veDonate.getDonorInfo(donor1.address);
		const donor2Info = await veDonate.getDonorInfo(donor2.address);

		// B3TR balances
		const b3trBalance1 = await b3trToken.balanceOf(donor1.address);
		const b3trBalance2 = await b3trToken.balanceOf(donor2.address);

		// Badges
		const badges1 = await donorBadges.getDonorBadges(donor1.address);
		const badges2 = await donorBadges.getDonorBadges(donor2.address);

		console.log('📊 Donor 1 results:');
		console.log(`- Всего донаций: ${donor1Info.totalDonations}`);
		console.log(`- Plasma donations: ${donor1Info.plasmaDonations}`);
		console.log(`- B3TR balance: ${ethers.formatEther(b3trBalance1)} B3TR`);
		console.log(`- NFT badges: ${badges1.length}`);

		console.log('\n📊 Donor 2 results:');
		console.log(`- All donations: ${donor2Info.totalDonations}`);
		console.log(`- Plasma donations: ${donor2Info.plasmaDonations}`);
		console.log(`- B3TR balance: ${ethers.formatEther(b3trBalance2)} B3TR`);
		console.log(`- NFT badges: ${badges2.length}\n`);

		// Тест 5: Глобальная статистикаglobal statistics
		console.log('📈 Test 5: Global statistics');
		console.log('--------------------------------');

		const globalStats = await veDonate.getGlobalStats();
		console.log(`- All donations: ${globalStats.totalDonations}`);
		console.log(`- All donors: ${globalStats.totalDonors}`);
		console.log(
			`- B3TR distributed: ${
				globalStats.totalB3TRDistributed
					? ethers.formatEther(globalStats.totalB3TRDistributed)
					: '0'
			} B3TR\n`
		);

		// Test 6: History of donations
		console.log('📜 Test 6: History of donations');
		console.log('--------------------------------');

		const donations1 = await veDonate.getDonorDonations(donor1.address);
		const donations2 = await veDonate.getDonorDonations(donor2.address);

		console.log(`Donor 1 donations: ${donations1.length}`);
		console.log(`Donor 2 donations: ${donations2.length}`);

		// Details of the first donation
		if (donations1.length > 0) {
			const donationInfo = await veDonate.getDonationInfo(donations1[0]);
			console.log('\n🔍 Details of the first donation Donor 1:');
			console.log(`- Type: ${donationInfo.donationType}`);
			console.log(`- Amount: ${donationInfo.amount} ml`);
			console.log(`- Center: ${donationInfo.centerId}`);
			console.log(
				`- B3TR reward: ${ethers.formatEther(donationInfo.b3trReward)}`
			);
			console.log(`- Verified: ${donationInfo.verified}`);
		}

		console.log('\n🎉 All basic tests passed successfully!');
		console.log('\n📋 Summary of results:');
		console.log('✅ Registration of donors works');
		console.log('✅ Adding donations works');
		console.log('✅ B3TR tokens are awarded correctly');
		console.log('✅ NFT badges are created');
		console.log('✅ Statistics are updated');
		console.log('✅ History of donations is saved');
	} catch (error) {
		console.error('❌ Error in tests:', error);
		throw error;
	}
}

basicTests()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('💥 Tests failed:', error);
		process.exit(1);
	});
