const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

async function debugAddressCheck() {
	console.log('🔍 Проверяем адреса...');
	console.log('📍 Адрес пользователя:', USER_ADDRESS);
	console.log('📍 Адрес пользователя (без 0x):', USER_ADDRESS.slice(2));
	console.log('📄 Адрес контракта:', CONTRACT_ADDRESS);
	console.log('');

	// Проверяем валидность адресов
	const isValidAddress = (addr) => {
		return /^0x[a-fA-F0-9]{40}$/.test(addr);
	};

	console.log('✅ Адрес пользователя валиден:', isValidAddress(USER_ADDRESS));
	console.log('✅ Адрес контракта валиден:', isValidAddress(CONTRACT_ADDRESS));
	console.log('');

	// Попробуем разные варианты API
	const apiUrls = [
		`https://explore-testnet.vechain.org/api/accounts/${USER_ADDRESS}/transactions`,
		`https://explore-testnet.vechain.org/api/accounts/${USER_ADDRESS.slice(
			2
		)}/transactions`,
		`https://explore-testnet.vechain.org/api/transactions?address=${USER_ADDRESS}`,
		`https://explore-testnet.vechain.org/api/accounts/${USER_ADDRESS}`,
	];

	for (const url of apiUrls) {
		console.log(`🔗 Тестируем URL: ${url}`);
		try {
			const response = await fetch(url);
			console.log(`   Статус: ${response.status}`);

			if (response.ok) {
				const data = await response.json();
				console.log(`   ✅ Успешно! Данные:`, typeof data, Object.keys(data));

				if (data.count !== undefined) {
					console.log(`   📊 Количество транзакций: ${data.count}`);
				}
				break;
			} else {
				const text = await response.text();
				console.log(`   ❌ Ошибка: ${text.substring(0, 100)}`);
			}
		} catch (error) {
			console.log(`   ❌ Ошибка запроса: ${error.message}`);
		}
		console.log('');
	}

	// Попробуем проверить контракт
	console.log('🔍 Проверяем контракт...');
	try {
		const contractResponse = await fetch(
			`https://explore-testnet.vechain.org/api/accounts/${CONTRACT_ADDRESS}`
		);
		const contractData = await contractResponse.json();
		console.log('📊 Данные контракта:', contractData);
	} catch (error) {
		console.log('❌ Ошибка при проверке контракта:', error.message);
	}
}

debugAddressCheck().catch(console.error);
