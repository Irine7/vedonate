const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

async function checkUserRegistrationStatus() {
	console.log('🔍 Проверяем статус регистрации пользователя через RPC proxy...');
	console.log('📍 Адрес пользователя:', USER_ADDRESS);
	console.log('📄 Адрес контракта:', CONTRACT_ADDRESS);
	console.log('');

	try {
		// Используем локальный RPC proxy
		const rpcUrl = 'http://127.0.0.1:8545';

		console.log('📞 Вызываем функцию isDonorRegistered через RPC proxy...');

		// Попробуем вызвать функцию getDonorInfo(address) для получения полной информации
		// Selector: keccak256('getDonorInfo(address)') = 0x8da5cb5b
		const functionSelector = '0x8da5cb5b';
		const encodedAddress = USER_ADDRESS.slice(2).padStart(64, '0');
		const callData = functionSelector + encodedAddress;

		console.log('📡 Call data для getDonorInfo:', callData);

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

		console.log('📡 Отправляем RPC запрос:', JSON.stringify(rpcRequest, null, 2));

		const response = await fetch(rpcUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(rpcRequest),
		});

		console.log('📡 HTTP статус:', response.status);
		console.log('📡 HTTP заголовки:', Object.fromEntries(response.headers.entries()));
		
		const responseText = await response.text();
		console.log('📡 Сырой ответ:', responseText);
		
		if (!responseText) {
			throw new Error('Пустой ответ от сервера');
		}
		
		const result = JSON.parse(responseText);

		if (result.error) {
			console.error('❌ Ошибка RPC:', result.error);
			
			// Попробуем альтернативный способ - вызвать isDonorRegistered
			console.log('\n📞 Пробуем альтернативный способ - isDonorRegistered...');
			const altSelector = '0x5b34c965';
			const altCallData = altSelector + encodedAddress;
			
			const altRequest = {
				method: 'eth_call',
				params: [
					{
						to: CONTRACT_ADDRESS,
						data: altCallData,
					},
					'latest',
				],
				id: 2,
				jsonrpc: '2.0',
			};

			const altResponse = await fetch(rpcUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(altRequest),
			});

			const altResult = await altResponse.json();
			console.log('📊 Альтернативный результат:', altResult);
			
			if (!altResult.error) {
				const altData = altResult.result;
				if (altData === '0x0000000000000000000000000000000000000000000000000000000000000000') {
					console.log('❌ Пользователь НЕ зарегистрирован (false)');
				} else if (altData === '0x0000000000000000000000000000000000000000000000000000000000000001') {
					console.log('✅ Пользователь УЖЕ ЗАРЕГИСТРИРОВАН (true)');
				} else {
					console.log('⚠️ Неожиданный результат:', altData);
				}
			}
			return;
		}

		console.log('📊 Результат RPC вызова getDonorInfo:', result);

		// Декодируем результат getDonorInfo (возвращает tuple)
		const resultData = result.result;
		console.log('📊 Данные пользователя:', resultData);
		
		// getDonorInfo возвращает tuple: (address wallet, uint256 totalDonations, uint256 plasmaDonations, uint256 totalB3TR, bool isRegistered, uint256 lastDonation)
		// Нужно декодировать этот tuple
		if (resultData && resultData.length > 130) {
			// Извлекаем isRegistered (5-й элемент tuple, bool)
			const isRegisteredHex = resultData.slice(64 * 4, 64 * 5); // 5-й элемент
			console.log('📊 isRegistered hex:', isRegisteredHex);
			
			if (isRegisteredHex === '0000000000000000000000000000000000000000000000000000000000000000') {
				console.log('❌ Пользователь НЕ зарегистрирован (false)');
			} else if (isRegisteredHex === '0000000000000000000000000000000000000000000000000000000000000001') {
				console.log('✅ Пользователь УЖЕ ЗАРЕГИСТРИРОВАН (true)');
			} else {
				console.log('⚠️ Неожиданный результат isRegistered:', isRegisteredHex);
			}
		}

		// Также попробуем получить информацию о контракте
		console.log('\n📞 Получаем информацию о контракте...');
		
		const contractInfoRequest = {
			method: 'eth_getCode',
			params: [CONTRACT_ADDRESS, 'latest'],
			id: 2,
			jsonrpc: '2.0',
		};

		const contractResponse = await fetch(rpcUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(contractInfoRequest),
		});

		const contractResult = await contractResponse.json();
		console.log('📊 Код контракта:', contractResult.result ? 'Найден' : 'Не найден');

		// Попробуем получить баланс пользователя
		console.log('\n📞 Получаем баланс пользователя...');
		
		const balanceRequest = {
			method: 'eth_getBalance',
			params: [USER_ADDRESS, 'latest'],
			id: 3,
			jsonrpc: '2.0',
		};

		const balanceResponse = await fetch(rpcUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(balanceRequest),
		});

		const balanceResult = await balanceResponse.json();
		console.log('📊 Баланс пользователя:', balanceResult.result);

	} catch (error) {
		console.error('❌ Ошибка при проверке статуса:', error);
	}
}

// Ждем немного, чтобы RPC proxy успел запуститься
setTimeout(() => {
	checkUserRegistrationStatus().catch(console.error);
}, 3000);
