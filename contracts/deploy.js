const { ethers } = require('hardhat');

async function main() {
	console.log('🚀 Деплой контрактов VeDonate в VeChain Testnet...');

	// Получаем деплойера
	const [deployer] = await ethers.getSigners();
	console.log('Деплой с адреса:', deployer.address);
	console.log(
		'Баланс:',
		ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
		'VET'
	);

	// 1. Деплой B3TR Token
	console.log('\n📄 Деплой B3TR Token...');
	const B3TRToken = await ethers.getContractFactory('B3TRToken');
	const b3trToken = await B3TRToken.deploy();
	await b3trToken.waitForDeployment();
	const b3trAddress = await b3trToken.getAddress();
	console.log('✅ B3TR Token деплоен по адресу:', b3trAddress);

	// 2. Деплой Donor Badges NFT
	console.log('\n🏆 Деплой Donor Badges NFT...');
	const DonorBadges = await ethers.getContractFactory('DonorBadges');
	const donorBadges = await DonorBadges.deploy();
	await donorBadges.waitForDeployment();
	const badgesAddress = await donorBadges.getAddress();
	console.log('✅ Donor Badges деплоен по адресу:', badgesAddress);

	// 3. Деплой основного контракта VeDonate
	console.log('\n🩸 Деплой основного контракта VeDonate...');
	const VeDonate = await ethers.getContractFactory('VeDonate');
	const veDonate = await VeDonate.deploy(b3trAddress, badgesAddress);
	await veDonate.waitForDeployment();
	const veDonateAddress = await veDonate.getAddress();
	console.log('✅ VeDonate деплоен по адресу:', veDonateAddress);

	// 4. Настройка прав доступа
	console.log('\n🔐 Настройка прав доступа...');

	// Даем права VeDonate контракту на минт токенов
	const setB3TROwner = await b3trToken.transferOwnership(veDonateAddress);
	await setB3TROwner.wait();
	console.log('✅ B3TR Token ownership передан VeDonate контракту');

	// Даем права VeDonate контракту на минт NFT
	const setBadgesOwner = await donorBadges.transferOwnership(veDonateAddress);
	await setBadgesOwner.wait();
	console.log('✅ Donor Badges ownership передан VeDonate контракту');

	// 5. Вывод информации для фронтенда
	console.log('\n📋 Конфигурация для фронтенда:');
	console.log('const CONTRACT_ADDRESSES = {');
	console.log(`  B3TR_TOKEN: "${b3trAddress}",`);
	console.log(`  DONOR_BADGES: "${badgesAddress}",`);
	console.log(`  VEDONATE: "${veDonateAddress}"`);
	console.log('};');

	console.log('\n🎉 Деплой завершен успешно!');
	console.log('\n📊 Статистика деплоя:');
	console.log('- B3TR Token:', b3trAddress);
	console.log('- Donor Badges:', badgesAddress);
	console.log('- VeDonate:', veDonateAddress);
	console.log('- Network: VeChain Testnet');
	console.log('- Deployer:', deployer.address);

	// Проверяем начальный баланс B3TR
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
		console.error('❌ Ошибка деплоя:', error);
		process.exit(1);
	});
