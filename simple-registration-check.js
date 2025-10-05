const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

async function checkRegistrationStatus() {
	console.log('🔍 Проверяем статус регистрации пользователя...');
	console.log('📍 Адрес пользователя:', USER_ADDRESS);
	console.log('📄 Адрес контракта:', CONTRACT_ADDRESS);
	console.log('');

	try {
		// Проверяем последние транзакции пользователя
		console.log('📈 Получаем транзакции пользователя...');
		const userTxsResponse = await fetch(
			`https://explore-testnet.vechain.org/api/accounts/${USER_ADDRESS}/transactions`
		);
		const userTxsData = await userTxsResponse.json();

		console.log(`📊 Всего транзакций пользователя: ${userTxsData.count}`);

		// Ищем транзакции к нашему контракту
		const contractTxs =
			userTxsData.items?.filter((tx) =>
				tx.clauses?.some((clause) => clause.to === CONTRACT_ADDRESS)
			) || [];

		console.log(`📋 Транзакций к контракту VeDonate: ${contractTxs.length}`);

		if (contractTxs.length > 0) {
			console.log('\n📝 Последние транзакции к контракту:');
			contractTxs.slice(0, 5).forEach((tx, index) => {
				console.log(`   ${index + 1}. ID: ${tx.txID}`);
				console.log(`      Статус: ${tx.txStatus}`);
				console.log(`      Блок: ${tx.blockNumber || 'pending'}`);
				console.log(
					`      Время: ${
						tx.timestamp
							? new Date(tx.timestamp * 1000).toLocaleString()
							: 'pending'
					}`
				);

				// Проверяем clause с данными
				const registerClause = tx.clauses?.find(
					(clause) =>
						clause.to === CONTRACT_ADDRESS && clause.data === '0x5b34c965'
				);

				if (registerClause) {
					console.log(`      🎯 Это транзакция регистрации (registerDonor)`);
				}
				console.log('');
			});

			// Проверяем последнюю транзакцию регистрации
			const lastRegisterTx = contractTxs.find((tx) =>
				tx.clauses?.some(
					(clause) =>
						clause.to === CONTRACT_ADDRESS && clause.data === '0x5b34c965'
				)
			);

			if (lastRegisterTx) {
				console.log('🎯 Последняя транзакция регистрации:');
				console.log(`   ID: ${lastRegisterTx.txID}`);
				console.log(`   Статус: ${lastRegisterTx.txStatus}`);
				console.log(`   Блок: ${lastRegisterTx.blockNumber || 'pending'}`);

				if (lastRegisterTx.txStatus === 'success') {
					console.log('✅ Транзакция регистрации УСПЕШНА!');
				} else if (lastRegisterTx.txStatus === 'failed') {
					console.log('❌ Транзакция регистрации НЕУДАЧНА!');
				} else {
					console.log('⏳ Транзакция регистрации в обработке...');
				}
			}
		} else {
			console.log('❌ Транзакций к контракту не найдено');
		}

		// Проверяем события контракта
		console.log('\n🔍 Проверяем события контракта...');
		try {
			const eventsResponse = await fetch(
				`https://explore-testnet.vechain.org/api/accounts/${CONTRACT_ADDRESS}/events`
			);
			const eventsData = await eventsResponse.json();

			console.log(`📊 Всего событий контракта: ${eventsData.count || 0}`);

			if (eventsData.items && eventsData.items.length > 0) {
				// Ищем события DonorRegistered
				const donorRegisteredEvents = eventsData.items.filter(
					(event) =>
						event.topics &&
						event.topics.includes('0x' + 'DonorRegistered'.padEnd(64, '0'))
				);

				console.log(
					`🎯 Событий DonorRegistered: ${donorRegisteredEvents.length}`
				);

				if (donorRegisteredEvents.length > 0) {
					console.log('\n📝 Последние события регистрации:');
					donorRegisteredEvents.slice(0, 3).forEach((event, index) => {
						console.log(`   ${index + 1}. Блок: ${event.blockNumber}`);
						console.log(`      Адрес донора: ${event.topics[1]}`);
						console.log(
							`      Время: ${new Date(
								event.timestamp * 1000
							).toLocaleString()}`
						);

						if (event.topics[1]?.toLowerCase() === USER_ADDRESS.toLowerCase()) {
							console.log(`      🎯 ЭТО НАШ ПОЛЬЗОВАТЕЛЬ!`);
						}
						console.log('');
					});
				}
			}
		} catch (eventsError) {
			console.warn(
				'⚠️ Не удалось получить события контракта:',
				eventsError.message
			);
		}
	} catch (error) {
		console.error('❌ Ошибка при проверке:', error);
	}
}

// Запускаем проверку
checkRegistrationStatus().catch(console.error);
