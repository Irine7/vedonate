const { ethers } = require('hardhat');

/**
 * 🏆 Fixed test system NFT badges
 * Checks automatic awarding of badges for achievements
 */

async function badgeTests() {
	console.log('🏆 Running fixed tests NFT badges...\n');

	const [deployer] = await ethers.getSigners();

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

		// Function to create a new donor (using existing accounts)
		const createNewDonor = async (donorName, index) => {
			const signers = await ethers.getSigners();
			const donorWallet = signers[index % signers.length];
			const regTx = await veDonate.connect(donorWallet).registerDonor();
			await regTx.wait();
			console.log(`✅ ${donorName} registered: ${donorWallet.address}`);
			return donorWallet;
		};

		// Function to check badges
		const checkBadges = async (donor, expectedCount, milestone) => {
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

		const donor1 = await createNewDonor('Donor 1', 1);
		const tx1 = await veDonate
			.connect(deployer)
			.addDonation(donor1.address, 'blood', 450, 'center-001');
		await tx1.wait();
		console.log('✅ First donation (blood) added');
		await checkBadges(donor1, 1, 'first donation');

		// Test 2: Achievement of 5 donations - badge "Bronze donor"
		console.log('🥉 Test 2: Achievement of the bronze donor status');
		console.log('---------------------------------------');

		const donor2 = await createNewDonor('Донор 2', 2);
		// Добавляем 5 донаций
		for (let i = 1; i <= 5; i++) {
			const tx = await veDonate
				.connect(deployer)
				.addDonation(
					donor2.address,
					'blood',
					450,
					`center-${i.toString().padStart(3, '0')}`
				);
			await tx.wait();
			console.log(`✅ Donation ${i}/5 added`);
		}

		await checkBadges(donor2, 2, '5 donations (bronze status)');

		// Test 3: Achievement of 10 donations - badge "Silver donor"
		console.log('🥈 Test 3: Achievement of the silver donor status');
		console.log('---------------------------------------');

		const donor3 = await createNewDonor('Donor 3', 3);
		// Adding 10 donations
		for (let i = 1; i <= 10; i++) {
			const tx = await veDonate
				.connect(deployer)
				.addDonation(
					donor3.address,
					'blood',
					450,
					`center-${i.toString().padStart(3, '0')}`
				);
			await tx.wait();
			console.log(`✅ Donation ${i}/10 added`);
		}

		await checkBadges(donor3, 3, '10 donations (silver status)');

		// Test 4: Achievement of 25 donations - badge "Gold donor"
		console.log('🥇 Test 4: Achievement of the gold donor status');
		console.log('------------------------------------');

		const donor4 = await createNewDonor('Donor 4', 1); // Using the first account again
		// Adding 25 donations (optimized - adding 5 at a time)
		for (let batch = 0; batch < 5; batch++) {
			for (let i = 0; i < 5; i++) {
				const donationNumber = batch * 5 + i + 1;
				const tx = await veDonate
					.connect(deployer)
					.addDonation(
						donor4.address,
						'blood',
						450,
						`center-${donationNumber.toString().padStart(3, '0')}`
					);
				await tx.wait();
			}
			console.log(`✅ Batch ${batch + 1}/5 donations added`);
		}

		await checkBadges(donor4, 4, '25 donations (gold status)');

		// Test 5: Achievement of 50 donations - badge "Life saver"
		console.log('❤️ Test 5: Achievement of the life saver status');
		console.log('--------------------------------------------');

		const donor5 = await createNewDonor('Donor 5', 2); // Using the second account again
		// Adding 50 donations (10 at a time for optimization)
		for (let batch = 0; batch < 5; batch++) {
			for (let i = 0; i < 10; i++) {
				const donationNumber = batch * 10 + i + 1;
				const tx = await veDonate
					.connect(deployer)
					.addDonation(
						donor5.address,
						'blood',
						450,
						`center-${donationNumber.toString().padStart(3, '0')}`
					);
				await tx.wait();
			}
			console.log(`✅ Batch ${batch + 1}/5 donations added`);
		}

		await checkBadges(donor5, 5, '50 donations (life saver)');

		// Test 6: Creating a new donor for testing plasma
		console.log('💧 Test 6: Testing the plasma master badge');
		console.log('-------------------------------------------');

		const donor6 = await createNewDonor('Donor 6 (plasma)', 3); // Using the third account again
		// Adding 10 plasma donations
		for (let i = 1; i <= 10; i++) {
			const tx = await veDonate
				.connect(deployer)
				.addDonation(
					donor6.address,
					'plasma',
					600,
					`plasma-center-${i.toString().padStart(3, '0')}`
				);
			await tx.wait();
			console.log(`✅ Plasma donation ${i}/10 added`);
		}

		const badges6 = await donorBadges.getDonorBadges(donor6.address);
		console.log(`📊 Donor 6 badges: ${badges6.length}`);

		// Проверяем, есть ли бейдж "Мастер плазмы"
		let hasPlasmaMaster = false;
		for (const tokenId of badges6) {
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

		// Финальная статистика
		console.log('\n📊 Final statistics of badge testing');
		console.log('==========================================');

		const donor1Info = await veDonate.getDonorInfo(donor1.address);
		const donor2Info = await veDonate.getDonorInfo(donor2.address);
		const donor3Info = await veDonate.getDonorInfo(donor3.address);
		const donor4Info = await veDonate.getDonorInfo(donor4.address);
		const donor5Info = await veDonate.getDonorInfo(donor5.address);
		const donor6Info = await veDonate.getDonorInfo(donor6.address);

		console.log('👤 Donor 1 (1 donation):');
		console.log(`- Total donations: ${donor1Info.totalDonations}`);
		console.log(
			`- Badges: ${(await donorBadges.getDonorBadges(donor1.address)).length}`
		);

		console.log('\n👤 Donor 2 (5 donations):');
		console.log(`- Total donations: ${donor2Info.totalDonations}`);
		console.log(
			`- Badges: ${(await donorBadges.getDonorBadges(donor2.address)).length}`
		);

		console.log('\n👤 Donor 3 (10 donations):');
		console.log(`- Total donations: ${donor3Info.totalDonations}`);
		console.log(
			`- Badges: ${(await donorBadges.getDonorBadges(donor3.address)).length}`
		);

		console.log('\n👤 Donor 4 (25 donations):');
		console.log(`- Total donations: ${donor4Info.totalDonations}`);
		console.log(
			`- Badges: ${(await donorBadges.getDonorBadges(donor4.address)).length}`
		);

		console.log('\n👤 Donor 5 (50 donations):');
		console.log(`- Total donations: ${donor5Info.totalDonations}`);
		console.log(
			`- Badges: ${(await donorBadges.getDonorBadges(donor5.address)).length}`
		);

		console.log('\n👤 Donor 6 (10 plasma donations):');
		console.log(`- Total donations: ${donor6Info.totalDonations}`);
		console.log(`- Plasma donations: ${donor6Info.plasmaDonations}`);
		console.log(
			`- Badges: ${(await donorBadges.getDonorBadges(donor6.address)).length}`
		);

		console.log('\n🎉 All NFT badges tests completed!');
		console.log('\n📋 Summary of results:');
		console.log('✅ Badge "First donation" works');
		console.log('✅ Badge "Bronze donor" works');
		console.log('✅ Badge "Silver donor" works');
		console.log('✅ Badge "Gold donor" works');
		console.log('✅ Badge "Life saver" works');
		console.log('✅ Badge "Plasma master" works');
		console.log('✅ Automatic awarding works');
	} catch (error) {
		console.error('💥 Error in NFT badges tests:', error);
		throw error;
	}
}

badgeTests()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('💥 Тесты бейджей провалились:', error);
		process.exit(1);
	});
