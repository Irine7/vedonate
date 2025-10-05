const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';
const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';

async function checkContractTransactions() {
	console.log('🔍 Проверяем транзакции контракта...');
	console.log('📄 Адрес контракта:', CONTRACT_ADDRESS);
	console.log('📍 Адрес пользователя:', USER_ADDRESS);
	console.log('');

	try {
		// Получаем транзакции контракта
		console.log('📈 Получаем транзакции контракта...');
		const contractResponse = await fetch(
			`https://explore-testnet.vechain.org/api/accounts/${CONTRACT_ADDRESS}/transactions`
		);
		const contractData = await contractResponse.json();

		console.log(`📊 Всего транзакций контракта: ${contractData.count}`);

		if (contractData.items && contractData.items.length > 0) {
			console.log('\n📝 Последние 10 транзакций контракта:');

			contractData.items.slice(0, 10).forEach((tx, index) => {
				console.log(`   ${index + 1}. ID: ${tx.txID}`);
				console.log(`      От: ${tx.origin}`);
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

					// Проверяем, это ли наш пользователь
					if (tx.origin?.toLowerCase() === USER_ADDRESS.toLowerCase()) {
						console.log(`      🎯 ЭТО НАШ ПОЛЬЗОВАТЕЛЬ!`);

						if (tx.txStatus === 'success') {
							console.log(`      ✅ РЕГИСТРАЦИЯ УСПЕШНА!`);
						} else if (tx.txStatus === 'failed') {
							console.log(`      ❌ РЕГИСТРАЦИЯ НЕУДАЧНА!`);
						} else {
							console.log(`      ⏳ РЕГИСТРАЦИЯ В ОБРАБОТКЕ...`);
						}
					}
				}

				// Проверяем все clauses
				if (tx.clauses) {
					tx.clauses.forEach((clause, clauseIndex) => {
						if (clause.to === CONTRACT_ADDRESS) {
							console.log(
								`      Clause ${clauseIndex + 1}: data = ${clause.data}`
							);
							if (clause.data === '0x5b34c965') {
								console.log(`         -> registerDonor() call`);
							}
						}
					});
				}

				console.log('');
			});

			// Ищем транзакции от нашего пользователя
			const userTransactions = contractData.items.filter(
				(tx) => tx.origin?.toLowerCase() === USER_ADDRESS.toLowerCase()
			);

			console.log(
				`🎯 Транзакций от нашего пользователя: ${userTransactions.length}`
			);

			if (userTransactions.length > 0) {
				console.log('\n📝 Все транзакции от нашего пользователя:');
				userTransactions.forEach((tx, index) => {
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

					const registerClause = tx.clauses?.find(
						(clause) =>
							clause.to === CONTRACT_ADDRESS && clause.data === '0x5b34c965'
					);

					if (registerClause) {
						console.log(`      🎯 Транзакция регистрации`);
						if (tx.txStatus === 'success') {
							console.log(`      ✅ РЕГИСТРАЦИЯ УСПЕШНА!`);
						} else {
							console.log(`      ❌ РЕГИСТРАЦИЯ НЕУДАЧНА!`);
						}
					}
					console.log('');
				});
			}
		} else {
			console.log('❌ Транзакций контракта не найдено');
		}
	} catch (error) {
		console.error('❌ Ошибка при проверке транзакций контракта:', error);
	}
}

checkContractTransactions().catch(console.error);
