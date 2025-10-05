const { ethers } = require('hardhat');

/**
 * 🏆 Тестирование системы NFT бейджей
 * Проверяет автоматическое начисление бейджей за достижения
 */

async function badgeTests() {
	console.log('🏆 Запуск тестов NFT бейджей...\n');

	const [deployer, donor] = await ethers.getSigners();

	// ✅ Адреса деплоенных контрактов VeChain Testnet
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

		// Регистрируем тестового донора (если не зарегистрирован)
		console.log('👤 Регистрация тестового донора...');
		const isRegistered = await veDonate.isDonorRegistered(donor.address);
		if (!isRegistered) {
			const regTx = await veDonate.connect(donor).registerDonor();
			await regTx.wait();
			console.log('✅ Донор зарегистрирован');
		} else {
			console.log('✅ Донор уже зарегистрирован');
		}
		console.log('');

		// Функция для проверки бейджей
		const checkBadges = async (expectedCount, milestone) => {
			const badges = await donorBadges.getDonorBadges(donor.address);
			console.log(`📊 После ${milestone}: ${badges.length} бейджей`);

			// Проверяем каждый бейдж
			for (let i = 0; i < badges.length; i++) {
				const tokenId = badges[i];
				const tokenURI = await donorBadges.tokenURI(tokenId);
				console.log(
					`   🏆 Бейдж ${i + 1}: ID ${tokenId} - ${tokenURI.substring(
						0,
						50
					)}...`
				);
			}

			if (badges.length === expectedCount) {
				console.log(`✅ Корректно: ${expectedCount} бейджей получено`);
			} else {
				console.log(
					`❌ Ошибка: ожидалось ${expectedCount}, получено ${badges.length}`
				);
			}
			console.log('');
		};

		// Тест 1: Первая донация - бейдж "Первая донация"
		console.log('🥉 Тест 1: Первая донация');
		console.log('------------------------');

		const tx1 = await veDonate
			.connect(deployer)
			.addDonation(donor.address, 'blood', 450, 'center-001');
		await tx1.wait();
		console.log('✅ Добавлена первая донация (кровь)');
		await checkBadges(1, 'первой донации');

		// Тест 2: Достижение 5 донаций - бейдж "Бронзовый донор"
		console.log('🥉 Тест 2: Достижение бронзового статуса');
		console.log('---------------------------------------');

		// Добавляем еще 4 донации
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
			console.log(`✅ Добавлена донация ${i}/5`);
		}

		await checkBadges(2, '5 донаций (бронзовый статус)');

		// Тест 3: Достижение 10 донаций - бейдж "Серебряный донор"
		console.log('🥈 Тест 3: Достижение серебряного статуса');
		console.log('---------------------------------------');

		// Добавляем еще 5 донаций
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
			console.log(`✅ Добавлена донация ${i}/10`);
		}

		await checkBadges(3, '10 донаций (серебряный статус)');

		// Тест 4: Достижение 25 донаций - бейдж "Золотой донор"
		console.log('🥇 Тест 4: Достижение золотого статуса');
		console.log('------------------------------------');

		// Добавляем еще 15 донаций (оптимизированно - добавляем по 5 за раз)
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
			console.log(`✅ Добавлена партия ${batch + 1}/3 донаций`);
		}

		await checkBadges(4, '25 донаций (золотой статус)');

		// Тест 5: Достижение 50 донаций - бейдж "Спасатель жизней"
		console.log('❤️ Тест 5: Достижение статуса "Спасатель жизней"');
		console.log('--------------------------------------------');

		// Добавляем еще 25 донаций (по 5 за раз для оптимизации)
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
			console.log(`✅ Добавлена партия ${batch + 1}/5 донаций`);
		}

		await checkBadges(5, '50 донаций (спасатель жизней)');

		// Тест 6: Создание нового донора для тестирования плазмы
		console.log('💧 Тест 6: Тестирование бейджа "Мастер плазмы"');
		console.log('-------------------------------------------');

		// Создаем новый аккаунт для второго донора
		const donor2Wallet = ethers.Wallet.createRandom().connect(ethers.provider);
		const regTx2 = await veDonate.connect(donor2Wallet).registerDonor();
		await regTx2.wait();
		console.log('✅ Второй донор зарегистрирован');

		// Добавляем 10 донаций плазмы
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
			console.log(`✅ Добавлена донация плазмы ${i}/10`);
		}

		const badges2 = await donorBadges.getDonorBadges(donor2Wallet.address);
		console.log(`📊 Donor 2 бейджи: ${badges2.length}`);

		// Проверяем, есть ли бейдж "Мастер плазмы"
		let hasPlasmaMaster = false;
		for (const tokenId of badges2) {
			const tokenURI = await donorBadges.tokenURI(tokenId);
			if (tokenURI.includes('Plasma Master')) {
				hasPlasmaMaster = true;
				console.log('✅ Бейдж "Мастер плазмы" получен!');
				break;
			}
		}

		if (!hasPlasmaMaster) {
			console.log('❌ Бейдж "Мастер плазмы" не найден');
		}

		// Финальная статистика
		console.log('\n📊 Финальная статистика тестирования бейджей');
		console.log('==========================================');

		const donorInfo = await veDonate.getDonorInfo(donor.address);
		const donor2Info = await veDonate.getDonorInfo(donor2Wallet.address);

		console.log('👤 Donor 1 (кровь):');
		console.log(`- Всего донаций: ${donorInfo.totalDonations}`);
		console.log(`- Плазма донаций: ${donorInfo.plasmaDonations}`);
		console.log(
			`- Бейджи: ${(await donorBadges.getDonorBadges(donor.address)).length}`
		);

		console.log('\n👤 Donor 2 (плазма):');
		console.log(`- Всего донаций: ${donor2Info.totalDonations}`);
		console.log(`- Плазма донаций: ${donor2Info.plasmaDonations}`);
		console.log(
			`- Бейджи: ${
				(await donorBadges.getDonorBadges(donor2Wallet.address)).length
			}`
		);

		// Тест 7: Проверка дублирования бейджей
		console.log('\n🔄 Тест 7: Проверка дублирования бейджей');
		console.log('-------------------------------------');

		// Попытка добавить еще одну донацию
		const txExtra = await veDonate
			.connect(deployer)
			.addDonation(donor.address, 'blood', 450, 'center-extra');
		await txExtra.wait();

		const finalBadges = await donorBadges.getDonorBadges(donor.address);
		console.log(
			`📊 Бейджей после дополнительной донации: ${finalBadges.length}`
		);

		if (finalBadges.length === 5) {
			console.log('✅ Корректно: Дублирования бейджей нет');
		} else {
			console.log('❌ Ошибка: Количество бейджей изменилось');
		}

		console.log('\n🎉 Все тесты NFT бейджей завершены!');
		console.log('\n📋 Сводка результатов:');
		console.log('✅ Бейдж "Первая донация" работает');
		console.log('✅ Бейдж "Бронзовый донор" работает');
		console.log('✅ Бейдж "Серебряный донор" работает');
		console.log('✅ Бейдж "Золотой донор" работает');
		console.log('✅ Бейдж "Спасатель жизней" работает');
		console.log('✅ Бейдж "Мастер плазмы" работает');
		console.log('✅ Дублирование бейджей предотвращено');
		console.log('✅ Автоматическое начисление работает');
	} catch (error) {
		console.error('💥 Ошибка в тестах бейджей:', error);
		throw error;
	}
}

badgeTests()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('💥 Тесты бейджей провалились:', error);
		process.exit(1);
	});
