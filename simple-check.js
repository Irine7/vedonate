// Простая проверка регистрации пользователя через VeChain Explorer API
const https = require('https');

// Конфигурация
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';
const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';

// Функция для получения данных о транзакциях контракта
async function checkUserRegistration() {
	console.log('🔍 Проверяем регистрацию пользователя...');
	console.log(`📍 Адрес пользователя: ${USER_ADDRESS}`);
	console.log(`📄 Адрес контракта: ${CONTRACT_ADDRESS}`);
	console.log('');

	try {
		// Проверяем события регистрации через VeChain Explorer API
		const eventsUrl = `https://explore-testnet.vechain.org/api/accounts/${CONTRACT_ADDRESS}/events`;

		console.log('🌐 Проверяем события через VeChain Explorer API...');
		console.log(`📡 URL: ${eventsUrl}`);
		console.log('');

		// Делаем запрос к API
		const response = await fetch(eventsUrl);
		const data = await response.json();

		if (data && data.items) {
			console.log(`📊 Найдено ${data.items.length} событий для контракта`);

			// Ищем события DonorRegistered
			const registrationEvents = data.items.filter(
				(event) =>
					event.topics &&
					event.topics.some(
						(topic) =>
							topic.includes('DonorRegistered') ||
							(topic &&
								topic
									.toLowerCase()
									.includes(USER_ADDRESS.toLowerCase().slice(2)))
					)
			);

			console.log(
				`🎯 Найдено ${registrationEvents.length} событий регистрации`
			);

			if (registrationEvents.length > 0) {
				console.log('✅ РЕЗУЛЬТАТ: Пользователь ЗАРЕГИСТРИРОВАН!');
				console.log('📝 События регистрации:');
				registrationEvents.forEach((event, index) => {
					console.log(
						`   ${index + 1}. Блок: ${event.blockNumber}, Транзакция: ${
							event.txId
						}`
					);
				});
			} else {
				console.log('❌ РЕЗУЛЬТАТ: Пользователь НЕ ЗАРЕГИСТРИРОВАН');
				console.log('💡 События регистрации не найдены');
			}
		} else {
			console.log('⚠️ Не удалось получить данные от API');
			console.log('💡 Попробуйте проверить вручную через VeChain Explorer');
		}
	} catch (error) {
		console.error('❌ Ошибка при проверке:', error.message);
		console.log('');
		console.log('💡 Альтернативные способы проверки:');
		console.log(
			'   1. Откройте: https://explore-testnet.vechain.org/accounts/' +
				CONTRACT_ADDRESS
		);
		console.log('   2. Перейдите на вкладку "Events"');
		console.log(
			'   3. Найдите событие DonorRegistered с адресом:',
			USER_ADDRESS
		);
	}

	console.log('');
	console.log('🔗 Прямые ссылки для проверки:');
	console.log(
		`   📄 Контракт: https://explore-testnet.vechain.org/accounts/${CONTRACT_ADDRESS}`
	);
	console.log(
		`   👤 Пользователь: https://explore-testnet.vechain.org/accounts/${USER_ADDRESS}`
	);
}

// Запускаем проверку
checkUserRegistration();
