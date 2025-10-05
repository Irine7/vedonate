const { ThorClient, SimpleWallet } = require('@vechain/sdk-core');
const { WebSocketConnector } = require('@vechain/sdk-network');

async function checkRegistrationStatus() {
	console.log('🔍 Проверяем статус регистрации пользователя...');
	console.log('📍 Адрес пользователя:', USER_ADDRESS);
	console.log('📄 Адрес контракта:', CONTRACT_ADDRESS);
	console.log('');

	try {
		// Подключаемся к VeChain Testnet
		const thorClient = new ThorClient(
			new WebSocketConnector('wss://testnet.vechain.org')
		);

		console.log('✅ Подключение к VeChain Testnet установлено');

		// ABI для функции isDonorRegistered
		const isDonorRegisteredABI = [
			{
				inputs: [{ internalType: 'address', name: 'donor', type: 'address' }],
				name: 'isDonorRegistered',
				outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
				stateMutability: 'view',
				type: 'function',
			},
		];

		// Создаем экземпляр контракта
		const contract = thorClient.contract(
			CONTRACT_ADDRESS,
			isDonorRegisteredABI
		);

		console.log('📞 Вызываем функцию isDonorRegistered...');

		// Вызываем функцию isDonorRegistered
		const result = await contract.read('isDonorRegistered', [USER_ADDRESS]);

		console.log('📊 Результат проверки:');
		console.log('   Пользователь зарегистрирован:', result);

		if (result) {
			console.log('✅ ПОЛЬЗОВАТЕЛЬ УЖЕ ЗАРЕГИСТРИРОВАН!');
		} else {
			console.log('❌ Пользователь НЕ зарегистрирован');
		}

		// Также проверим последние транзакции
		console.log('\n🔍 Проверяем последние транзакции...');

		try {
			const response = await fetch(
				`https://explore-testnet.vechain.org/api/accounts/${USER_ADDRESS}/transactions`
			);
			const data = await response.json();

			console.log(`📈 Всего транзакций: ${data.count}`);

			// Ищем транзакции к нашему контракту
			const contractTxs =
				data.items?.filter((tx) =>
					tx.clauses?.some((clause) => clause.to === CONTRACT_ADDRESS)
				) || [];

			console.log(`📋 Транзакций к контракту: ${contractTxs.length}`);

			if (contractTxs.length > 0) {
				console.log('\n📝 Последние транзакции к контракту:');
				contractTxs.slice(0, 3).forEach((tx, index) => {
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
					console.log('');
				});
			} else {
				console.log('❌ Транзакций к контракту не найдено');
			}
		} catch (fetchError) {
			console.warn(
				'⚠️ Не удалось получить транзакции через API:',
				fetchError.message
			);
		}
	} catch (error) {
		console.error('❌ Ошибка при проверке регистрации:', error);
	}
}

// Константы
const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

// Запускаем проверку
checkRegistrationStatus().catch(console.error);
