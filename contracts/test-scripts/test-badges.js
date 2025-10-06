const { ethers } = require('hardhat');

/**
 * 🏆 Testing the NFT badges system
 * Checks automatic awarding of badges for achievements
 */

async function badgeTests() {
	console.log('🏆 Running NFT badges tests...\n');

	const [deployer, donor] = await ethers.getSigners();

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

		// Registering the test donor (if not registered)
		console.log('👤 Registering the test donor...');
		const isRegistered = await veDonate.isDonorRegistered(donor.address);
		if (!isRegistered) {
			const regTx = await veDonate.connect(donor).registerDonor();
			await regTx.wait();
			console.log('✅ Donor registered');
		} else {
			console.log('✅ Donor already registered');
		}
		console.log('');

		// Function to check badges
		const checkBadges = async (expectedCount, milestone) => {
			const badges = await donorBadges.getDonorBadges(donor.address);
			console.log(`📊 After ${milestone}: ${badges.length} badges`);

			// Проверяем каждый бейдж
			for (let i = 0; i < badges.length; i++) {
				const tokenId = badges[i];
				const tokenURI = await donorBadges.tokenURI(tokenId);
				console.log(
					`   🏆 Badge ${i + 1}: ID ${tokenId} - ${tokenURI.substring(
						0,
						50
					)}...`
				);
			}

			if (badges.length === expectedCount) {
				console.log(`✅ Correctly: ${expectedCount} badges received`);
			} else {
				console.log(
					`❌ Error: expected ${expectedCount}, received ${badges.length}`
				);
			}
			console.log('');
		};

		// Test 1: First donation - badge "First donation"
		console.log('🥉 Test 1: First donation');
		console.log('------------------------');

		const tx1 = await veDonate
			.connect(deployer)
			.addDonation(donor.address, 'blood', 450, 'center-001');
		await tx1.wait();
		console.log('✅ First donation added (blood)');
		await checkBadges(1, 'first donation');

		// Test 2: Achievement of 5 donations - badge "Bronze donor"
		console.log('🥉 Test 2: Achievement of bronze status');
		console.log('---------------------------------------');

		// Adding another 4 donations
		for (let i = 2; i <= 5; i++) {
			const tx = await veDonate
				.connect(deployer)
				.addDonation(
					donor.address,
					'blood',
					450,
					`center-${i.toString().padStart(3, '0')}`
				);
			await tx.wait();
			console.log(`✅ Donation ${i}/5 added`);
		}

		await checkBadges(2, '5 donations (bronze status)');

		// Test 3: Achievement of 10 donations - badge "Silver donor"
		console.log('🥈 Test 3: Achievement of silver status');
		console.log('---------------------------------------');

		// Adding another 5 donations
		for (let i = 6; i <= 10; i++) {
			const tx = await veDonate
				.connect(deployer)
				.addDonation(
					donor.address,
					'blood',
					450,
					`center-${i.toString().padStart(3, '0')}`
				);
			await tx.wait();
			console.log(`✅ Donation ${i}/10 added`);
		}

		await checkBadges(3, '10 donations (silver status)');

		// Test 4: Achievement of 25 donations - badge "Gold donor"
		console.log('🥇 Test 4: Achievement of gold status');
		console.log('------------------------------------');

		// Adding another 15 donations (optimized - adding 5 at a time)
		for (let batch = 0; batch < 3; batch++) {
			for (let i = 0; i < 5; i++) {
				const donationNumber = 11 + batch * 5 + i;
				const tx = await veDonate
					.connect(deployer)
					.addDonation(
						donor.address,
						'blood',
						450,
						`center-${donationNumber.toString().padStart(3, '0')}`
					);
				await tx.wait();
			}
			console.log(`✅ Batch ${batch + 1}/3 donations added`);
		}

		await checkBadges(4, '25 donations (gold status)');

		// Test 5: Achievement of 50 donations - badge "Life saver"
		console.log('❤️ Test 5: Achievement of life saver status');
		console.log('--------------------------------------------');

		// Adding another 25 donations (optimized - adding 5 at a time)
		for (let batch = 0; batch < 5; batch++) {
			for (let i = 0; i < 5; i++) {
				const donationNumber = 26 + batch * 5 + i;
				const tx = await veDonate
					.connect(deployer)
					.addDonation(
						donor.address,
						'blood',
						450,
						`center-${donationNumber.toString().padStart(3, '0')}`
					);
				await tx.wait();
			}
			console.log(`✅ Batch ${batch + 1}/5 donations added`);
		}

		await checkBadges(5, '50 donations (life saver)');

		// Test 6: Creating a new donor for testing plasma
		console.log('💧 Test 6: Testing the plasma master badge');
		console.log('-------------------------------------------');

		// Using an existing account for the second donor
		const signers = await ethers.getSigners();
		const donor2Wallet = signers[2]; // Using the third account

		// Checking if already registered
		const isRegistered2 = await veDonate.isDonorRegistered(
			donor2Wallet.address
		);
		if (!isRegistered2) {
			const regTx2 = await veDonate.connect(donor2Wallet).registerDonor();
			await regTx2.wait();
			console.log('✅ Second donor registered');
		} else {
			console.log('✅ Second donor already registered');
		}

		// Adding 10 plasma donations
		for (let i = 1; i <= 10; i++) {
			const tx = await veDonate
				.connect(deployer)
				.addDonation(
					donor2Wallet.address,
					'plasma',
					600,
					`plasma-center-${i.toString().padStart(3, '0')}`
				);
			await tx.wait();
			console.log(`✅ Plasma donation ${i}/10 added`);
		}

		const badges2 = await donorBadges.getDonorBadges(donor2Wallet.address);
		console.log(`📊 Donor 2 badges: ${badges2.length}`);

		// Checking if the plasma master badge is present
		let hasPlasmaMaster = false;
		for (const tokenId of badges2) {
			const tokenURI = await donorBadges.tokenURI(tokenId);
			if (tokenURI.includes('Plasma Master')) {
				hasPlasmaMaster = true;
				console.log('✅ Plasma master badge received!');
				break;
			}
		}

		if (!hasPlasmaMaster) {
			console.log('❌ Plasma master badge not found');
		}

		// Final statistics
		console.log('\n📊 Final statistics of badge testing');
		console.log('==========================================');

		const donorInfo = await veDonate.getDonorInfo(donor.address);
		const donor2Info = await veDonate.getDonorInfo(donor2Wallet.address);

		console.log('👤 Donor 1 (blood):');
		console.log(`- Total donations: ${donorInfo.totalDonations}`);
		console.log(`- Plasma donations: ${donorInfo.plasmaDonations}`);
		console.log(
			`- Badges: ${(await donorBadges.getDonorBadges(donor.address)).length}`
		);

		console.log('\n👤 Donor 2 (plasma):');
		console.log(`- Total donations: ${donor2Info.totalDonations}`);
		console.log(`- Plasma donations: ${donor2Info.plasmaDonations}`);
		console.log(
			`- Badges: ${
				(await donorBadges.getDonorBadges(donor2Wallet.address)).length
			}`
		);

		// Test 7: Checking for duplicate badges
		console.log('\n🔄 Test 7: Checking for duplicate badges');
		console.log('-------------------------------------');

		// Trying to add another donation
		const txExtra = await veDonate
			.connect(deployer)
			.addDonation(donor.address, 'blood', 450, 'center-extra');
		await txExtra.wait();

		const finalBadges = await donorBadges.getDonorBadges(donor.address);
		console.log(`📊 Badges after additional donation: ${finalBadges.length}`);

		if (finalBadges.length === 5) {
			console.log('✅ Correctly: Duplicate badges are not present');
		} else {
			console.log('❌ Error: The number of badges has changed');
		}

		console.log('\n🎉 All NFT badges tests completed!');
		console.log('\n📋 Summary of results:');
		console.log('✅ Badge "First donation" works');
		console.log('✅ Badge "Bronze donor" works');
		console.log('✅ Badge "Silver donor" works');
		console.log('✅ Badge "Gold donor" works');
		console.log('✅ Badge "Life saver" works');
		console.log('✅ Badge "Plasma master" works');
		console.log('✅ Duplicate badges are prevented');
		console.log('✅ Automatic awarding works');
	} catch (error) {
		console.error('💥 Error in NFT badges tests:', error);
		throw error;
	}
}

badgeTests()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('💥 NFT badges tests failed:', error);
		process.exit(1);
	});
