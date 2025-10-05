const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

async function checkUserRegistrationStatus() {
	console.log('🔍 Проверяем статус регистрации пользователя...');
	console.log('📍 Адрес пользователя:', USER_ADDRESS);
	console.log('📄 Адрес контракта:', CONTRACT_ADDRESS);
	console.log('');

	try {
		// Создаем простой вызов к контракту через VeChain RPC
		const rpcUrl = 'https://testnet.veblocks.net/accounts/';

		// ABI для функции isDonorRegistered
		const isDonorRegisteredABI = {
			inputs: [{ internalType: 'address', name: 'donor', type: 'address' }],
			name: 'isDonorRegistered',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'view',
			type: 'function',
		};

		// Кодируем вызов функции
		const functionSelector = '0x' + 'isDonorRegistered(address)'.slice(0, 4);
		const encodedAddress = USER_ADDRESS.slice(2).padStart(64, '0');
		const callData = functionSelector + encodedAddress;

		console.log('📞 Вызываем функцию isDonorRegistered через RPC...');
		console.log('   Call data:', callData);

		const rpcRequest = {
			method: 'eth_call',
			params: [
				{
					to: CONTRACT_ADDRESS,
					data: callData,
				},
				'latest',
			],
			id: 1,
			jsonrpc: '2.0',
		};

		const response = await fetch(rpcUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(rpcRequest),
		});

		console.log('📡 HTTP статус:', response.status);
		console.log(
			'📡 HTTP заголовки:',
			Object.fromEntries(response.headers.entries())
		);

		const responseText = await response.text();
		console.log('📡 Сырой ответ:', responseText.substring(0, 500));

		if (!responseText) {
			throw new Error('Пустой ответ от сервера');
		}

		const result = JSON.parse(responseText);

		if (result.error) {
			console.error('❌ Ошибка RPC:', result.error);
			return;
		}

		console.log('📊 Результат RPC вызова:', result);

		// Декодируем результат
		const resultData = result.result;
		if (
			resultData ===
			'0x0000000000000000000000000000000000000000000000000000000000000000'
		) {
			console.log('❌ Пользователь НЕ зарегистрирован (false)');
		} else if (
			resultData ===
			'0x0000000000000000000000000000000000000000000000000000000000000001'
		) {
			console.log('✅ Пользователь УЖЕ ЗАРЕГИСТРИРОВАН (true)');
		} else {
			console.log('⚠️ Неожиданный результат:', resultData);
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
