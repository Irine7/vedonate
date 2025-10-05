const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

async function checkUserRegistrationStatus() {
	console.log('🔍 Проверяем статус регистрации пользователя...');
	console.log('📍 Адрес пользователя:', USER_ADDRESS);
	console.log('📄 Адрес контракта:', CONTRACT_ADDRESS);
	console.log('');

	try {
		// Используем VeChain REST API для получения информации о контракте
		const apiUrl = 'https://testnet.veblocks.net';

		console.log(
			'📞 Проверяем информацию о контракте через VeChain REST API...'
		);

		// Сначала проверим, что контракт существует
		const contractResponse = await fetch(
			`${apiUrl}/accounts/${CONTRACT_ADDRESS}`
		);

		console.log('📡 HTTP статус:', contractResponse.status);
		console.log(
			'📡 HTTP заголовки:',
			Object.fromEntries(contractResponse.headers.entries())
		);

		const responseText = await contractResponse.text();
		console.log('📡 Сырой ответ:', responseText.substring(0, 500));

		if (!responseText) {
			throw new Error('Пустой ответ от сервера');
		}

		const contractInfo = JSON.parse(responseText);

		console.log('📊 Информация о контракте:', contractInfo);

		if (contractInfo.balance !== undefined) {
			console.log('✅ Контракт существует и активен');
			console.log('💰 Баланс контракта:', contractInfo.balance);
			console.log('🔢 Энергия контракта:', contractInfo.energy || 'N/A');
		} else {
			console.log('⚠️ Контракт не найден или не активен');
		}

		// Теперь попробуем получить код контракта
		console.log('\n📞 Получаем код контракта...');
		const codeResponse = await fetch(
			`${apiUrl}/accounts/${CONTRACT_ADDRESS}/code`
		);

		if (codeResponse.ok) {
			const codeInfo = await codeResponse.json();
			console.log(
				'📊 Код контракта получен, длина:',
				codeInfo.code ? codeInfo.code.length : 0
			);
		} else {
			console.log('⚠️ Не удалось получить код контракта');
		}

		// Попробуем альтернативный способ - проверим события контракта
		console.log('\n📞 Проверяем события контракта...');
		const eventsResponse = await fetch(
			`${apiUrl}/logs/event?address=${CONTRACT_ADDRESS}&topic0=0x5b34c965`
		);

		if (eventsResponse.ok) {
			const eventsInfo = await eventsResponse.json();
			console.log('📊 События контракта:', eventsInfo);
		} else {
			console.log('⚠️ Не удалось получить события контракта');
		}

		// Попробуем проверить storage контракта
		console.log('\n📞 Проверяем storage контракта...');
		const storageResponse = await fetch(
			`${apiUrl}/accounts/${CONTRACT_ADDRESS}/storage`
		);

		if (storageResponse.ok) {
			const storageInfo = await storageResponse.json();
			console.log('📊 Storage контракта:', storageInfo);
		} else {
			console.log('⚠️ Не удалось получить storage контракта');
		}

		// Попробуем использовать VeChain REST API для вызова функций контракта
		console.log('\n📞 Пробуем вызвать функцию контракта через REST API...');

		// Создаем транзакцию для вызова функции
		const callRequest = {
			clauses: [
				{
					to: CONTRACT_ADDRESS,
					value: '0x0',
					data: '0x5b34c965' + USER_ADDRESS.slice(2).padStart(64, '0'), // isDonorRegistered(address)
				},
			],
		};

		console.log('📡 Отправляем запрос:', JSON.stringify(callRequest, null, 2));

		const callResponse = await fetch(`${apiUrl}/accounts/${CONTRACT_ADDRESS}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(callRequest),
		});

		console.log('📡 HTTP статус:', callResponse.status);
		console.log(
			'📡 HTTP заголовки:',
			Object.fromEntries(callResponse.headers.entries())
		);

		const callResponseText = await callResponse.text();
		console.log('📡 Сырой ответ:', callResponseText.substring(0, 500));

		if (
			callResponseText &&
			callResponseText !== 'This endpoint is no longer supported.'
		) {
			try {
				const callResult = JSON.parse(callResponseText);
				console.log('📊 Результат вызова:', callResult);
			} catch (e) {
				console.log('⚠️ Не удалось распарсить ответ как JSON');
			}
		}

		// Также проверим последние транзакции пользователя
		console.log('\n🔍 Проверяем последние транзакции...');

		try {
			// Попробуем получить транзакции через другой эндпоинт
			const txResponse = await fetch(
				`https://explore-testnet.vechain.org/api/transactions?address=${USER_ADDRESS}`
			);

			if (txResponse.ok) {
				const txData = await txResponse.json();
				console.log(
					`📈 Транзакций пользователя найдено: ${txData.length || 0}`
				);

				// Ищем транзакции к нашему контракту
				const contractTxs = txData.filter((tx) =>
					tx.clauses?.some((clause) => clause.to === CONTRACT_ADDRESS)
				);

				console.log(
					`📋 Транзакций к контракту VeDonate: ${contractTxs.length}`
				);

				if (contractTxs.length > 0) {
					console.log('\n📝 Последние транзакции к контракту:');
					contractTxs.slice(0, 3).forEach((tx, index) => {
						console.log(`   ${index + 1}. ID: ${tx.txID || tx.id}`);
						console.log(`      Статус: ${tx.txStatus || tx.status}`);
						console.log(`      Блок: ${tx.blockNumber || tx.block}`);
						console.log(
							`      Время: ${
								tx.timestamp
									? new Date(tx.timestamp * 1000).toLocaleString()
									: 'unknown'
							}`
						);

						const registerClause = tx.clauses?.find(
							(clause) =>
								clause.to === CONTRACT_ADDRESS && clause.data === '0x5b34c965'
						);

						if (registerClause) {
							console.log(
								`      🎯 Это транзакция регистрации (registerDonor)`
							);
						}
						console.log('');
					});
				}
			} else {
				console.log('⚠️ Не удалось получить транзакции пользователя');
			}
		} catch (txError) {
			console.warn('⚠️ Ошибка при получении транзакций:', txError.message);
		}
	} catch (error) {
		console.error('❌ Ошибка при проверке статуса:', error);
	}
}

checkUserRegistrationStatus().catch(console.error);
