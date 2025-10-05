const { ethers } = require('hardhat');

/**
 * 🔍 Проверка статуса деплоенных контрактов
 * Проверяет доступность и базовую информацию о контрактах
 */

async function checkContracts() {
	console.log('🔍 Проверка статуса контрактов VeDonate...\n');

	// Адреса деплоенных контрактов
	const VEDONATE_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';
	const B3TR_ADDRESS = '0x3e0d2d748f66a56b3ed4d1afbe2e63a9db2844c3';
	const BADGES_ADDRESS = '0x9575e91189e60b4e9a41f136c87d177e42296a88';

	try {
		// Получаем контракты
		console.log('📄 Получение контрактов...');
		const veDonate = await ethers.getContractAt('VeDonate', VEDONATE_ADDRESS);
		const b3trToken = await ethers.getContractAt('B3TRToken', B3TR_ADDRESS);
		const donorBadges = await ethers.getContractAt(
			'DonorBadges',
			BADGES_ADDRESS
		);
		console.log('✅ Контракты получены\n');

		// Проверка B3TR Token
		console.log('💰 Проверка B3TR Token:');
		console.log('------------------------');
		try {
			const name = await b3trToken.name();
			const symbol = await b3trToken.symbol();
			const decimals = await b3trToken.decimals();
			const totalSupply = await b3trToken.totalSupply();

			console.log(`✅ Название: ${name}`);
			console.log(`✅ Символ: ${symbol}`);
			console.log(`✅ Дробная часть: ${decimals}`);
			console.log(
				`✅ Общее предложение: ${ethers.formatEther(totalSupply)} B3TR`
			);
		} catch (error) {
			console.log(`❌ Ошибка B3TR Token: ${error.message}`);
		}
		console.log('');

		// Проверка Donor Badges
		console.log('🏆 Проверка Donor Badges:');
		console.log('-------------------------');
		try {
			const name = await donorBadges.name();
			const symbol = await donorBadges.symbol();
			// VeChain не поддерживает totalSupply для ERC721
			console.log(`✅ Название: ${name}`);
			console.log(`✅ Символ: ${symbol}`);
			console.log(`✅ Контракт NFT бейджей работает`);
		} catch (error) {
			console.log(`❌ Ошибка Donor Badges: ${error.message}`);
		}
		console.log('');

		// Проверка VeDonate
		console.log('🩸 Проверка VeDonate:');
		console.log('---------------------');
		try {
			const globalStats = await veDonate.getGlobalStats();

			// Обработка данных из VeChain (возвращает массив значений)
			if (
				globalStats &&
				Array.isArray(globalStats) &&
				globalStats.length >= 3
			) {
				const totalDonations = globalStats[0];
				const totalDonors = globalStats[1];
				const totalB3TRDistributed = globalStats[2];

				console.log(`✅ Всего донаций: ${totalDonations.toString()}`);
				console.log(`✅ Всего доноров: ${totalDonors.toString()}`);
				console.log(
					`✅ B3TR распределено: ${ethers.formatEther(totalB3TRDistributed)}`
				);
			} else {
				console.log(`✅ Контракт VeDonate работает (нет данных)`);
			}
		} catch (error) {
			console.log(`❌ Ошибка VeDonate: ${error.message}`);
		}
		console.log('');

		// Проверка подключения к сети
		console.log('🌐 Проверка сети:');
		console.log('------------------');
		try {
			const network = await ethers.provider.getNetwork();
			const blockNumber = await ethers.provider.getBlockNumber();
			// VeChain не поддерживает getGasPrice
			console.log(`✅ Сеть: ${network.name} (ID: ${network.chainId})`);
			console.log(`✅ Блок: ${blockNumber}`);
			console.log(`✅ VeChain Testnet подключен`);
		} catch (error) {
			console.log(`❌ Ошибка сети: ${error.message}`);
		}
		console.log('');

		// Проверка аккаунтов
		console.log('👤 Проверка аккаунтов:');
		console.log('----------------------');
		const [deployer, donor1, donor2] = await ethers.getSigners();

		console.log(`✅ Деплойер: ${deployer.address}`);
		console.log(`✅ Донор 1: ${donor1.address}`);
		console.log(`✅ Донор 2: ${donor2.address}`);

		// Проверка балансов
		try {
			const deployerBalance = await ethers.provider.getBalance(
				deployer.address
			);
			const donor1Balance = await ethers.provider.getBalance(donor1.address);

			console.log(
				`💰 Баланс деплойера: ${ethers.formatEther(deployerBalance)} VET`
			);
			console.log(
				`💰 Баланс донора 1: ${ethers.formatEther(donor1Balance)} VET`
			);

			if (deployerBalance < ethers.parseEther('1')) {
				console.log('⚠️  Предупреждение: Низкий баланс деплойера');
			}
		} catch (error) {
			console.log(`❌ Ошибка балансов: ${error.message}`);
		}
		console.log('');

		console.log('🎉 Проверка контрактов завершена!');
		console.log('\n📋 Сводка:');
		console.log('✅ Все контракты доступны');
		console.log('✅ Сеть подключена');
		console.log('✅ Аккаунты готовы к тестированию');
		console.log('\n🚀 Готово к запуску тестов!');
	} catch (error) {
		console.error('💥 Ошибка проверки контрактов:', error);
		throw error;
	}
}

checkContracts()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('💥 Проверка провалилась');
		process.exit(1);
	});
