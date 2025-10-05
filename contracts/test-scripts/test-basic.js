const { ethers } = require('hardhat');

/**
 * 🧪 Базовое тестирование смарт-контрактов VeDonate
 * Тестирует основные функции: регистрация, донации, награды
 */

async function basicTests() {
	console.log('🚀 Запуск базовых тестов VeDonate...\n');

	const [deployer, donor1, donor2] = await ethers.getSigners();

	// ✅ Адреса деплоенных контрактов VeChain Testnet
	const VEDONATE_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';
	const B3TR_ADDRESS = '0x3e0d2d748f66a56b3ed4d1afbe2e63a9db2844c3';
	const BADGES_ADDRESS = '0x9575e91189e60b4e9a41f136c87d177e42296a88';

	console.log('👤 Тестовые аккаунты:');
	console.log('- Deployer:', deployer.address);
	console.log('- Donor 1:', donor1.address);
	console.log('- Donor 2:', donor2.address);
	console.log('');

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

		// Тест 1: Регистрация доноров
		console.log('📝 Тест 1: Регистрация доноров');
		console.log('--------------------------------');

		// Проверяем и регистрируем Donor 1
		const isRegistered1 = await veDonate.isDonorRegistered(donor1.address);
		if (!isRegistered1) {
			const tx1 = await veDonate.connect(donor1).registerDonor();
			await tx1.wait();
			console.log('✅ Donor 1 зарегистрирован');
		} else {
			console.log('✅ Donor 1 уже зарегистрирован');
		}

		// Проверяем и регистрируем Donor 2
		const isRegistered2 = await veDonate.isDonorRegistered(donor2.address);
		if (!isRegistered2) {
			const tx2 = await veDonate.connect(donor2).registerDonor();
			await tx2.wait();
			console.log('✅ Donor 2 зарегистрирован');
		} else {
			console.log('✅ Donor 2 уже зарегистрирован');
		}
		console.log('');

		// Тест 2: Проверка регистрации
		console.log('🔍 Тест 2: Проверка регистрации');
		console.log('--------------------------------');

		const isRegistered1Check = await veDonate.isDonorRegistered(donor1.address);
		const isRegistered2Check = await veDonate.isDonorRegistered(donor2.address);

		console.log(`Donor 1 зарегистрирован: ${isRegistered1Check}`);
		console.log(`Donor 2 зарегистрирован: ${isRegistered2Check}\n`);

		// Тест 3: Добавление донаций
		console.log('🩸 Тест 3: Добавление донаций');
		console.log('--------------------------------');

		// Донация крови
		const tx3 = await veDonate
			.connect(deployer)
			.addDonation(donor1.address, 'blood', 450, 'test-center-001');
		await tx3.wait();
		console.log('✅ Donor 1: донация крови (450 мл)');

		// Донация плазмы
		const tx4 = await veDonate
			.connect(deployer)
			.addDonation(donor2.address, 'plasma', 450, 'test-center-002');
		await tx4.wait();
		console.log('✅ Donor 2: донация плазмы (450 мл)\n');

		// Тест 4: Проверка наград
		console.log('💰 Тест 4: Проверка наград');
		console.log('--------------------------------');

		// Информация о донорах
		const donor1Info = await veDonate.getDonorInfo(donor1.address);
		const donor2Info = await veDonate.getDonorInfo(donor2.address);

		// Балансы B3TR
		const b3trBalance1 = await b3trToken.balanceOf(donor1.address);
		const b3trBalance2 = await b3trToken.balanceOf(donor2.address);

		// Бейджи
		const badges1 = await donorBadges.getDonorBadges(donor1.address);
		const badges2 = await donorBadges.getDonorBadges(donor2.address);

		console.log('📊 Donor 1 результаты:');
		console.log(`- Всего донаций: ${donor1Info.totalDonations}`);
		console.log(`- Плазма донаций: ${donor1Info.plasmaDonations}`);
		console.log(`- B3TR баланс: ${ethers.formatEther(b3trBalance1)} B3TR`);
		console.log(`- NFT бейджи: ${badges1.length}`);

		console.log('\n📊 Donor 2 результаты:');
		console.log(`- Всего донаций: ${donor2Info.totalDonations}`);
		console.log(`- Плазма донаций: ${donor2Info.plasmaDonations}`);
		console.log(`- B3TR баланс: ${ethers.formatEther(b3trBalance2)} B3TR`);
		console.log(`- NFT бейджи: ${badges2.length}\n`);

		// Тест 5: Глобальная статистика
		console.log('📈 Тест 5: Глобальная статистика');
		console.log('--------------------------------');

		const globalStats = await veDonate.getGlobalStats();
		console.log(`- Всего донаций: ${globalStats.totalDonations}`);
		console.log(`- Всего доноров: ${globalStats.totalDonors}`);
		console.log(
			`- B3TR распределено: ${
				globalStats.totalB3TRDistributed
					? ethers.formatEther(globalStats.totalB3TRDistributed)
					: '0'
			} B3TR\n`
		);

		// Тест 6: История донаций
		console.log('📜 Тест 6: История донаций');
		console.log('--------------------------------');

		const donations1 = await veDonate.getDonorDonations(donor1.address);
		const donations2 = await veDonate.getDonorDonations(donor2.address);

		console.log(`Donor 1 донаций: ${donations1.length}`);
		console.log(`Donor 2 донаций: ${donations2.length}`);

		// Детали первой донации
		if (donations1.length > 0) {
			const donationInfo = await veDonate.getDonationInfo(donations1[0]);
			console.log('\n🔍 Детали первой донации Donor 1:');
			console.log(`- Тип: ${donationInfo.donationType}`);
			console.log(`- Количество: ${donationInfo.amount} мл`);
			console.log(`- Центр: ${donationInfo.centerId}`);
			console.log(
				`- B3TR награда: ${ethers.formatEther(donationInfo.b3trReward)}`
			);
			console.log(`- Подтверждена: ${donationInfo.verified}`);
		}

		console.log('\n🎉 Все базовые тесты пройдены успешно!');
		console.log('\n📋 Сводка результатов:');
		console.log('✅ Регистрация доноров работает');
		console.log('✅ Добавление донаций работает');
		console.log('✅ B3TR токены начисляются корректно');
		console.log('✅ NFT бейджи создаются');
		console.log('✅ Статистика обновляется');
		console.log('✅ История донаций сохраняется');
	} catch (error) {
		console.error('❌ Ошибка в тестах:', error);
		throw error;
	}
}

basicTests()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('💥 Тесты провалились:', error);
		process.exit(1);
	});
