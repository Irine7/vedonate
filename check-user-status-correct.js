const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

async function checkUserRegistrationStatus() {
	console.log('🔍 Проверяем статус регистрации пользователя...');
	console.log('📍 Адрес пользователя:', USER_ADDRESS);
	console.log('📄 Адрес контракта:', CONTRACT_ADDRESS);
	console.log('');

	try {
		// Используем официальный VeChain REST API эндпоинт
		const apiUrl = 'https://testnet.vechain.org';

		console.log('📞 Проверяем информацию о контракте через VeChain REST API...');

		// Сначала проверим, что контракт существует
		const contractResponse = await fetch(`${apiUrl}/accounts/${CONTRACT_ADDRESS}`);

		console.log('📡 HTTP статус:', contractResponse.status);
		console.log('📡 HTTP заголовки:', Object.fromEntries(contractResponse.headers.entries()));
		
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

		// Получаем код контракта
		console.log('\n📞 Получаем код контракта...');
		const codeResponse = await fetch(`${apiUrl}/accounts/${CONTRACT_ADDRESS}/code`);
		
		if (codeResponse.ok) {
			const codeInfo = await codeResponse.json();
			console.log('📊 Код контракта получен, длина:', codeInfo.code ? codeInfo.code.length : 0);
		} else {
			console.log('⚠️ Не удалось получить код контракта');
		}

		// Попробуем получить информацию о пользователе
		console.log('\n📞 Проверяем информацию о пользователе...');
		const userResponse = await fetch(`${apiUrl}/accounts/${USER_ADDRESS}`);
		
		if (userResponse.ok) {
			const userInfo = await userResponse.json();
			console.log('📊 Информация о пользователе:', userInfo);
		} else {
			console.log('⚠️ Не удалось получить информацию о пользователе');
		}

		// Попробуем получить события контракта (регистрации)
		console.log('\n📞 Проверяем события регистрации...');
		
		// Попробуем разные варианты эндпоинтов для событий
		const eventEndpoints = [
			`${apiUrl}/logs/event?address=${CONTRACT_ADDRESS}&topic0=0x5b34c965`,
			`${apiUrl}/logs/event?address=${CONTRACT_ADDRESS}`,
			`${apiUrl}/logs/event`,
			`${apiUrl}/logs`,
		];

		for (const endpoint of eventEndpoints) {
			console.log(`   Пробуем: ${endpoint}`);
			try {
				const eventsResponse = await fetch(endpoint);
				
				if (eventsResponse.ok) {
					const eventsInfo = await eventsResponse.json();
					console.log('📊 События получены:', eventsInfo);
					break;
				} else {
					console.log(`   ❌ Статус: ${eventsResponse.status}`);
				}
			} catch (e) {
				console.log(`   ❌ Ошибка: ${e.message}`);
			}
		}

		// Попробуем получить транзакции пользователя
		console.log('\n🔍 Проверяем транзакции пользователя...');

		// Попробуем разные варианты эндпоинтов для транзакций
		const txEndpoints = [
			`${apiUrl}/accounts/${USER_ADDRESS}/transactions?limit=10`,
			`${apiUrl}/accounts/${USER_ADDRESS}/transactions`,
			`${apiUrl}/transactions?account=${USER_ADDRESS}`,
			`${apiUrl}/transactions`,
		];

		for (const endpoint of txEndpoints) {
			console.log(`   Пробуем: ${endpoint}`);
			try {
				const txResponse = await fetch(endpoint);
				
				if (txResponse.ok) {
					const txData = await txResponse.json();
					console.log(`📈 Транзакций найдено: ${txData.length || 0}`);
					console.log('📊 Транзакции:', txData);
					break;
				} else {
					console.log(`   ❌ Статус: ${txResponse.status}`);
				}
			} catch (e) {
				console.log(`   ❌ Ошибка: ${e.message}`);
			}
		}

	} catch (error) {
		console.error('❌ Ошибка при проверке статуса:', error);
	}
}

checkUserRegistrationStatus().catch(console.error);
