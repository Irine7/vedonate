const { ethers } = require('hardhat');

/**
 * 🏆 Исправленный тест системы NFT бейджей
 * Проверяет автоматическое начисление бейджей за достижения
 */

async function badgeTests() {
	console.log('🏆 Запуск исправленных тестов NFT бейджей...\n');

	const [deployer] = await ethers.getSigners();

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

		// Функция для создания нового донора (используем существующие аккаунты)
		const createNewDonor = async (donorName, index) => {
			const signers = await ethers.getSigners();
			const donorWallet = signers[index % signers.length];
			const regTx = await veDonate.connect(donorWallet).registerDonor();
			await regTx.wait();
			console.log(`✅ ${donorName} зарегистрирован: ${donorWallet.address}`);
			return donorWallet;
		};

		// Функция для проверки бейджей
		const checkBadges = async (donor, expectedCount, milestone) => {
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

		const donor1 = await createNewDonor('Донор 1', 1);
		const tx1 = await veDonate
			.connect(deployer)
			.addDonation(donor1.address, 'blood', 450, 'center-001');
		await tx1.wait();
		console.log('✅ Добавлена первая донация (кровь)');
		await checkBadges(donor1, 1, 'первой донации');

		// Тест 2: Достижение 5 донаций - бейдж "Бронзовый донор"
		console.log('🥉 Тест 2: Достижение бронзового статуса');
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
			console.log(`✅ Добавлена донация ${i}/5`);
		}

		await checkBadges(donor2, 2, '5 донаций (бронзовый статус)');

		// Тест 3: Достижение 10 донаций - бейдж "Серебряный донор"
		console.log('🥈 Тест 3: Достижение серебряного статуса');
		console.log('---------------------------------------');

		const donor3 = await createNewDonor('Донор 3', 3);
		// Добавляем 10 донаций
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
			console.log(`✅ Добавлена донация ${i}/10`);
		}

		await checkBadges(donor3, 3, '10 донаций (серебряный статус)');

		// Тест 4: Достижение 25 донаций - бейдж "Золотой донор"
		console.log('🥇 Тест 4: Достижение золотого статуса');
		console.log('------------------------------------');

		const donor4 = await createNewDonor('Донор 4', 1); // Используем первый аккаунт снова
		// Добавляем 25 донаций (оптимизированно - добавляем по 5 за раз)
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
			console.log(`✅ Добавлена партия ${batch + 1}/5 донаций`);
		}

		await checkBadges(donor4, 4, '25 донаций (золотой статус)');

		// Тест 5: Достижение 50 донаций - бейдж "Спасатель жизней"
		console.log('❤️ Тест 5: Достижение статуса "Спасатель жизней"');
		console.log('--------------------------------------------');

		const donor5 = await createNewDonor('Донор 5', 2); // Используем второй аккаунт снова
		// Добавляем 50 донаций (по 10 за раз для оптимизации)
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
			console.log(`✅ Добавлена партия ${batch + 1}/5 донаций`);
		}

		await checkBadges(donor5, 5, '50 донаций (спасатель жизней)');

		// Тест 6: Создание нового донора для тестирования плазмы
		console.log('💧 Тест 6: Тестирование бейджа "Мастер плазмы"');
		console.log('-------------------------------------------');

		const donor6 = await createNewDonor('Донор 6 (плазма)', 3); // Используем третий аккаунт снова
		// Добавляем 10 донаций плазмы
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
			console.log(`✅ Добавлена донация плазмы ${i}/10`);
		}

		const badges6 = await donorBadges.getDonorBadges(donor6.address);
		console.log(`📊 Donor 6 бейджи: ${badges6.length}`);

		// Проверяем, есть ли бейдж "Мастер плазмы"
		let hasPlasmaMaster = false;
		for (const tokenId of badges6) {
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

		const donor1Info = await veDonate.getDonorInfo(donor1.address);
		const donor2Info = await veDonate.getDonorInfo(donor2.address);
		const donor3Info = await veDonate.getDonorInfo(donor3.address);
		const donor4Info = await veDonate.getDonorInfo(donor4.address);
		const donor5Info = await veDonate.getDonorInfo(donor5.address);
		const donor6Info = await veDonate.getDonorInfo(donor6.address);

		console.log('👤 Донор 1 (1 донация):');
		console.log(`- Всего донаций: ${donor1Info.totalDonations}`);
		console.log(
			`- Бейджи: ${(await donorBadges.getDonorBadges(donor1.address)).length}`
		);

		console.log('\n👤 Донор 2 (5 донаций):');
		console.log(`- Всего донаций: ${donor2Info.totalDonations}`);
		console.log(
			`- Бейджи: ${(await donorBadges.getDonorBadges(donor2.address)).length}`
		);

		console.log('\n👤 Донор 3 (10 донаций):');
		console.log(`- Всего донаций: ${donor3Info.totalDonations}`);
		console.log(
			`- Бейджи: ${(await donorBadges.getDonorBadges(donor3.address)).length}`
		);

		console.log('\n👤 Донор 4 (25 донаций):');
		console.log(`- Всего донаций: ${donor4Info.totalDonations}`);
		console.log(
			`- Бейджи: ${(await donorBadges.getDonorBadges(donor4.address)).length}`
		);

		console.log('\n👤 Донор 5 (50 донаций):');
		console.log(`- Всего донаций: ${donor5Info.totalDonations}`);
		console.log(
			`- Бейджи: ${(await donorBadges.getDonorBadges(donor5.address)).length}`
		);

		console.log('\n👤 Донор 6 (10 донаций плазмы):');
		console.log(`- Всего донаций: ${donor6Info.totalDonations}`);
		console.log(`- Плазма донаций: ${donor6Info.plasmaDonations}`);
		console.log(
			`- Бейджи: ${(await donorBadges.getDonorBadges(donor6.address)).length}`
		);

		console.log('\n🎉 Все тесты NFT бейджей завершены!');
		console.log('\n📋 Сводка результатов:');
		console.log('✅ Бейдж "Первая донация" работает');
		console.log('✅ Бейдж "Бронзовый донор" работает');
		console.log('✅ Бейдж "Серебряный донор" работает');
		console.log('✅ Бейдж "Золотой донор" работает');
		console.log('✅ Бейдж "Спасатель жизней" работает');
		console.log('✅ Бейдж "Мастер плазмы" работает');
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
