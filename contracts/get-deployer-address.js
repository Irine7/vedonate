const { ethers } = require('hardhat');

/**
 * 🔍 Получение адреса деплойера для получения тестовых VET токенов
 */

async function getDeployerAddress() {
	console.log('🔍 Определение адреса деплойера...\n');

	try {
		// Получаем аккаунты из hardhat конфигурации
		const [deployer, donor1, donor2] = await ethers.getSigners();

		console.log('📋 Аккаунты для тестирования:');
		console.log('=============================');
		console.log(`👤 Деплойер (index 0): ${deployer.address}`);
		console.log(`👤 Донор 1 (index 1):  ${donor1.address}`);
		console.log(`👤 Донор 2 (index 2):  ${donor2.address}`);
		console.log('');

		console.log('💰 Проверка балансов:');
		console.log('=====================');

		const deployerBalance = await ethers.provider.getBalance(deployer.address);
		const donor1Balance = await ethers.provider.getBalance(donor1.address);
		const donor2Balance = await ethers.provider.getBalance(donor2.address);

		console.log(`💰 Деплойер: ${ethers.formatEther(deployerBalance)} VET`);
		console.log(`💰 Донор 1:  ${ethers.formatEther(donor1Balance)} VET`);
		console.log(`💰 Донор 2:  ${ethers.formatEther(donor2Balance)} VET`);
		console.log('');

		// Определяем, кому нужны токены
		const minBalance = ethers.parseEther('1'); // Минимум 1 VET для тестирования

		console.log('🎯 Рекомендации:');
		console.log('================');

		if (deployerBalance < minBalance) {
			console.log(`⚠️  Деплойеру нужны VET токены!`);
			console.log(`📍 Адрес для faucet: ${deployer.address}`);
			console.log('');
		}

		if (donor1Balance < minBalance) {
			console.log(`⚠️  Донору 1 нужны VET токены!`);
			console.log(`📍 Адрес для faucet: ${donor1.address}`);
			console.log('');
		}

		if (donor2Balance < minBalance) {
			console.log(`⚠️  Донору 2 нужны VET токены!`);
			console.log(`📍 Адрес для faucet: ${donor2.address}`);
			console.log('');
		}

		if (
			deployerBalance >= minBalance &&
			donor1Balance >= minBalance &&
			donor2Balance >= minBalance
		) {
			console.log('✅ Все аккаунты имеют достаточный баланс VET!');
			console.log('🚀 Готово к тестированию!');
		} else {
			console.log('📝 Инструкции:');
			console.log('==============');
			console.log('1. Откройте https://faucet.vechain.org/');
			console.log('2. Введите адрес(а) выше');
			console.log('3. Получите тестовые VET токены');
			console.log('4. Запустите тесты: npm run test:all');
		}

		console.log('');
		console.log('🔗 Ссылки:');
		console.log('==========');
		console.log('• VeChain Faucet: https://faucet.vechain.org/');
		console.log(
			'• VeChain Testnet Explorer: https://explore-testnet.vechain.org/'
		);

		// Выводим адрес деплойера для копирования
		console.log('');
		console.log('📋 КОПИРУЙТЕ ЭТОТ АДРЕС ДЛЯ FAUCET:');
		console.log('=====================================');
		console.log(deployer.address);
		console.log('=====================================');
	} catch (error) {
		console.error('💥 Ошибка получения адресов:', error);
		throw error;
	}
}

getDeployerAddress()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('💥 Ошибка выполнения');
		process.exit(1);
	});
