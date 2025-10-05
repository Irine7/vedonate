const { ethers } = require('hardhat');

/**
 * ⚡ Быстрый тест основных функций VeDonate
 * Минимальный набор тестов для проверки работоспособности
 */

async function quickTest() {
	console.log('⚡ Быстрый тест VeDonate...\n');

	// ✅ Адреса деплоенных контрактов VeChain Testnet
	const VEDONATE_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';
	const B3TR_ADDRESS = '0x3e0d2d748f66a56b3ed4d1afbe2e63a9db2844c3';
	const BADGES_ADDRESS = '0x9575e91189e60b4e9a41f136c87d177e42296a88';

	const signers = await ethers.getSigners();
	const deployer = signers[0];
	const donor = signers[2]; // Используем третий аккаунт вместо второго

	console.log('👤 Тестовый донор:', donor.address);
	console.log('🔧 Деплойер:', deployer.address);
	console.log('');

	try {
		// Получаем контракты
		const veDonate = await ethers.getContractAt('VeDonate', VEDONATE_ADDRESS);
		const b3trToken = await ethers.getContractAt('B3TRToken', B3TR_ADDRESS);
		const donorBadges = await ethers.getContractAt(
			'DonorBadges',
			BADGES_ADDRESS
		);

		// Шаг 1: Регистрация донора (если не зарегистрирован)
		console.log('📝 1. Проверка регистрации донора...');
		try {
			const donorInfo = await veDonate.getDonorInfo(donor.address);
			if (donorInfo.isRegistered) {
				console.log('✅ Донор уже зарегистрирован');
			} else {
				const regTx = await veDonate.connect(donor).registerDonor();
				await regTx.wait();
				console.log('✅ Донор зарегистрирован');
			}
		} catch (error) {
			// Если донор не зарегистрирован, регистрируем
			const regTx = await veDonate.connect(donor).registerDonor();
			await regTx.wait();
			console.log('✅ Донор зарегистрирован');
		}

		// Шаг 2: Добавление донации (если нужно)
		console.log('🩸 2. Проверка донаций...');
		const currentDonorInfo = await veDonate.getDonorInfo(donor.address);
		const currentDonations = currentDonorInfo.totalDonations;

		if (currentDonations < 1) {
			console.log('   Добавляем новую донацию...');
			const donationTx = await veDonate
				.connect(deployer)
				.addDonation(donor.address, 'blood', 450, 'quick-test-center');
			await donationTx.wait();
			console.log('✅ Донация добавлена');
		} else {
			console.log(`✅ У донора уже есть ${currentDonations} донаций`);
		}

		// Шаг 3: Проверка результатов
		console.log('📊 3. Проверка результатов...');

		// Получаем обновленную информацию о доноре
		const updatedDonorInfo = await veDonate.getDonorInfo(donor.address);
		const b3trBalance = await b3trToken.balanceOf(donor.address);
		const badges = await donorBadges.getDonorBadges(donor.address);

		console.log('');
		console.log('🎯 Результаты теста:');
		console.log(`   👤 Донаций: ${updatedDonorInfo.totalDonations}`);
		console.log(`   💰 B3TR: ${ethers.formatEther(b3trBalance)}`);
		console.log(`   🏆 Бейджей: ${badges.length}`);

		// Проверка успешности - учитываем текущее состояние
		const expectedDonations = updatedDonorInfo.totalDonations.toString();
		const expectedB3TR = b3trBalance.toString();
		const expectedBadges = badges.length;

		// Проверяем, что донор зарегистрирован и имеет донации
		const isSuccess =
			updatedDonorInfo.isRegistered &&
			parseInt(expectedDonations) >= 1 &&
			parseInt(expectedB3TR) >= 10000000000000000000 && // минимум 10 B3TR
			expectedBadges >= 1;

		if (isSuccess) {
			console.log('');
			console.log('🎉 БЫСТРЫЙ ТЕСТ ПРОЙДЕН! ✅');
			console.log('Все основные функции работают корректно');
		} else {
			console.log('');
			console.log('❌ БЫСТРЫЙ ТЕСТ ПРОВАЛЕН!');
			console.log('Проверьте контракты и адреса');
		}
	} catch (error) {
		console.error('');
		console.error('💥 Ошибка в быстром тесте:', error.message);
		console.error('');
		console.error('🔧 Возможные причины:');
		console.error('   1. Неверные адреса контрактов');
		console.error('   2. Контракты не задеплоены');
		console.error('   3. Недостаточно VET для газа');
		console.error('   4. Неправильная сеть (должна быть VeChain Testnet)');
		console.error('');
		console.error('📖 Решение:');
		console.error('   1. Проверьте адреса в CONTRACT_ADDRESSES');
		console.error(
			'   2. Задеплойте контракты командой: npm run deploy:testnet'
		);
		console.error('   3. Получите тестовые VET: https://faucet.vecha.in/');
		throw error;
	}
}

quickTest()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('💥 Быстрый тест провалился');
		process.exit(1);
	});
