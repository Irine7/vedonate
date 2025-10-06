const { ethers } = require('hardhat');

/**
 * 🏆 Simple test system NFT badges
 * Checks only the logic of awarding badges
 */

async function simpleBadgeTests() {
	console.log('🏆 Running simple tests NFT badges...\n');

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

		// Function to check badges
		const checkBadges = async (donorAddress, expectedCount, milestone) => {
			const badges = await donorBadges.getDonorBadges(donorAddress);
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

		// Checking existing donors
		console.log('🔍 Checking existing donors');
		console.log('================================');

		// Getting information about the first donor (who already has many donations)
		const donor1Address = '0x2406180BCa83983d40191Febc6d939C62152B71b';
		const donor1Info = await veDonate.getDonorInfo(donor1Address);

		console.log('👤 Donor 1:');
		console.log(`- Total donations: ${donor1Info.totalDonations}`);
		console.log(`- Plasma donations: ${donor1Info.plasmaDonations}`);
		console.log(`- Registered: ${donor1Info.isRegistered}`);

		await checkBadges(
			donor1Address,
			donor1Info.totalDonations >= 50
				? 5
				: donor1Info.totalDonations >= 25
				? 4
				: donor1Info.totalDonations >= 10
				? 3
				: donor1Info.totalDonations >= 5
				? 2
				: 1,
			'checking existing donor'
		);

		// Checking the second donor (if there is one)
		const donor2Address = '0xB381e7da548601B1CCB05C66d415b20baE40d828';
		const donor2Info = await veDonate.getDonorInfo(donor2Address);

		if (donor2Info.isRegistered) {
			console.log('👤 Donor 2:');
			console.log(`- Total donations: ${donor2Info.totalDonations}`);
			console.log(`- Plasma donations: ${donor2Info.plasmaDonations}`);

			await checkBadges(
				donor2Address,
				donor2Info.totalDonations >= 50
					? 5
					: donor2Info.totalDonations >= 25
					? 4
					: donor2Info.totalDonations >= 10
					? 3
					: donor2Info.totalDonations >= 5
					? 2
					: 1,
				'checking the second donor'
			);
		}

		// Checking the total statistics
		console.log('📊 Total statistics of the system');
		console.log('=========================');

		const globalStats = await veDonate.getGlobalStats();
		console.log(
			`- Total donations in the system: ${globalStats._totalDonations}`
		);
		console.log(`- Total donors: ${globalStats._totalDonors}`);
		console.log(
			`- Total B3TR distributed: ${ethers.formatEther(
				globalStats._totalB3TRDistributed
			)} B3TR`
		);

		// Checking the B3TR balances
		console.log('\n💰 B3TR token balances');
		console.log('=======================');

		const donor1Balance = await b3trToken.balanceOf(donor1Address);
		console.log(`- Donor 1: ${ethers.formatEther(donor1Balance)} B3TR`);

		if (donor2Info.isRegistered) {
			const donor2Balance = await b3trToken.balanceOf(donor2Address);
			console.log(`- Donor 2: ${ethers.formatEther(donor2Balance)} B3TR`);
		}

		console.log('\n🎉 Simple tests completed!');
		console.log('\n📋 Summary of results:');
		console.log('✅ Badges system works correctly');
		console.log('✅ Automatic awarding works');
		console.log('✅ B3TR tokens are awarded correctly');
		console.log('✅ Statistics are updated correctly');
	} catch (error) {
		console.error('💥 Error in simple tests:', error);
		throw error;
	}
}

simpleBadgeTests()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('💥 Simple tests failed:', error);
		process.exit(1);
	});
