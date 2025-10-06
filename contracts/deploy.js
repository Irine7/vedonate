const { ethers } = require('hardhat');

async function main() {
	console.log('🚀 Deploying VeDonate contracts in VeChain Testnet...');

	// Получаем деплойера
	const [deployer] = await ethers.getSigners();
	console.log('Deploy from address:', deployer.address);
	console.log(
		'Balance:',
		ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
		'VET'
	);

	// 1. Деплой B3TR Token
	console.log('\n📄 Deploy B3TR Token...');
	const B3TRToken = await ethers.getContractFactory('B3TRToken');
	const b3trToken = await B3TRToken.deploy();
	await b3trToken.waitForDeployment();
	const b3trAddress = await b3trToken.getAddress();
	console.log('✅ B3TR Token deployed to address:', b3trAddress);

	// 2. Деплой Donor Badges NFT
	console.log('\n🏆 Deploy Donor Badges NFT...');
	const DonorBadges = await ethers.getContractFactory('DonorBadges');
	const donorBadges = await DonorBadges.deploy();
	await donorBadges.waitForDeployment();
	const badgesAddress = await donorBadges.getAddress();
	console.log('✅ Donor Badges deployed to address:', badgesAddress);

	// 3. Деплой основного контракта VeDonate
	console.log('\n🩸 Deploy main VeDonate contract...');
	const VeDonate = await ethers.getContractFactory('VeDonate');
	const veDonate = await VeDonate.deploy(b3trAddress, badgesAddress);
	await veDonate.waitForDeployment();
	const veDonateAddress = await veDonate.getAddress();
	console.log('✅ VeDonate deployed to address:', veDonateAddress);

	// 4. Настройка прав доступа
	console.log('\n🔐 Setting access rights...');

	// Даем права VeDonate контракту на минт токенов
	const setB3TROwner = await b3trToken.transferOwnership(veDonateAddress);
	await setB3TROwner.wait();
	console.log('✅ B3TR Token ownership transferred to VeDonate contract');

	// Даем права VeDonate контракту на минт NFT
	const setBadgesOwner = await donorBadges.transferOwnership(veDonateAddress);
	await setBadgesOwner.wait();
	console.log('✅ Donor Badges ownership transferred to VeDonate contract');

	// 5. Output information for frontend
	console.log('\n📋 Configuration for frontend:');
	console.log('const CONTRACT_ADDRESSES = {');
	console.log(`  B3TR_TOKEN: "${b3trAddress}",`);
	console.log(`  DONOR_BADGES: "${badgesAddress}",`);
	console.log(`  VEDONATE: "${veDonateAddress}"`);
	console.log('};');

	console.log('\n🎉 Deployment completed successfully!');
	console.log('\n📊 Deployment statistics:');
	console.log('- B3TR Token:', b3trAddress);
	console.log('- Donor Badges:', badgesAddress);
	console.log('- VeDonate:', veDonateAddress);
	console.log('- Network: VeChain Testnet');
	console.log('- Deployer:', deployer.address);

	// Check initial B3TR balance
	const b3trBalance = await b3trToken.balanceOf(deployer.address);
	console.log(
		'- Initial B3TR balance:',
		ethers.formatEther(b3trBalance),
		'B3TR'
	);

	return {
		b3trToken: b3trAddress,
		donorBadges: badgesAddress,
		veDonate: veDonateAddress,
	};
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ Deployment error:', error);
		process.exit(1);
	});
