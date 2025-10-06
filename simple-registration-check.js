const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

async function checkRegistrationStatus() {
	console.log('🔍 Checking user registration status...');
	console.log('📍 User address:', USER_ADDRESS);
	console.log('📄 Contract address:', CONTRACT_ADDRESS);
	console.log('');

	try {
		// Check the last transactions of the user
		console.log('📈 Getting user transactions...');
		const userTxsResponse = await fetch(
			`https://explore-testnet.vechain.org/api/accounts/${USER_ADDRESS}/transactions`
		);
		const userTxsData = await userTxsResponse.json();

		console.log(`📊 Total user transactions: ${userTxsData.count}`);

		// Find transactions to our contract
		const contractTxs =
			userTxsData.items?.filter((tx) =>
				tx.clauses?.some((clause) => clause.to === CONTRACT_ADDRESS)
			) || [];

		console.log(`📋 Transactions to VeDonate contract: ${contractTxs.length}`);

		if (contractTxs.length > 0) {
			console.log('\n📝 Last transactions to contract:');
			contractTxs.slice(0, 5).forEach((tx, index) => {
				console.log(`   ${index + 1}. ID: ${tx.txID}`);
				console.log(`      Status: ${tx.txStatus}`);
				console.log(`      Блок: ${tx.blockNumber || 'pending'}`);
				console.log(
					`      Time: ${
						tx.timestamp
							? new Date(tx.timestamp * 1000).toLocaleString()
							: 'pending'
					}`
				);

				// Check the clause with the data
				const registerClause = tx.clauses?.find(
					(clause) =>
						clause.to === CONTRACT_ADDRESS && clause.data === '0x5b34c965'
				);

				if (registerClause) {
					console.log(`      🎯 This is the registration transaction (registerDonor)`);
				}
				console.log('');
			});

			// Check the last registration transaction
			const lastRegisterTx = contractTxs.find((tx) =>
				tx.clauses?.some(
					(clause) =>
						clause.to === CONTRACT_ADDRESS && clause.data === '0x5b34c965'
				)
			);

			if (lastRegisterTx) {
				console.log('🎯 Last registration transaction:');
				console.log(`   ID: ${lastRegisterTx.txID}`);
				console.log(`   Status: ${lastRegisterTx.txStatus}`);
				console.log(`   Block: ${lastRegisterTx.blockNumber || 'pending'}`);

				if (lastRegisterTx.txStatus === 'success') {
					console.log('✅ Registration transaction SUCCESSFUL!');
				} else if (lastRegisterTx.txStatus === 'failed') {
					console.log('❌ Registration transaction FAILED!');
				} else {
					console.log('⏳ Registration transaction in processing...');
				}
			}
		} else {
			console.log('❌ No transactions to contract found');
		}

		// Check the events of the contract
		console.log('\n🔍 Checking the events of the contract...');
		try {
			const eventsResponse = await fetch(
				`https://explore-testnet.vechain.org/api/accounts/${CONTRACT_ADDRESS}/events`
			);
			const eventsData = await eventsResponse.json();

			console.log(`📊 Total events of the contract: ${eventsData.count || 0}`);

			if (eventsData.items && eventsData.items.length > 0) {
				// Find DonorRegistered events
				const donorRegisteredEvents = eventsData.items.filter(
					(event) =>
						event.topics &&
						event.topics.includes('0x' + 'DonorRegistered'.padEnd(64, '0'))
				);

				console.log(
					`🎯 DonorRegistered events: ${donorRegisteredEvents.length}`
				);

				if (donorRegisteredEvents.length > 0) {
					console.log('\n📝 Last registration events:');
					donorRegisteredEvents.slice(0, 3).forEach((event, index) => {
						console.log(`   ${index + 1}. Блок: ${event.blockNumber}`);
						console.log(`      Donor address: ${event.topics[1]}`);
						console.log(
							`      Время: ${new Date(
								event.timestamp * 1000
							).toLocaleString()}`
						);

						if (event.topics[1]?.toLowerCase() === USER_ADDRESS.toLowerCase()) {
							console.log(`      🎯 THIS IS OUR USER!`);
						}
						console.log('');
					});
				}
			}
		} catch (eventsError) {
			console.warn(
				'⚠️ Unable to get events of the contract:',
				eventsError.message
			);
		}
	} catch (error) {
		console.error('❌ Error during check:', error);
	}
}

// Start the check
checkRegistrationStatus().catch(console.error);
