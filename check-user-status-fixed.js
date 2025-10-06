const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

async function checkUserRegistrationStatus() {
	console.log('🔍 Checking user registration status...');
	console.log('📍 User address:', USER_ADDRESS);
	console.log('📄 Contract address:', CONTRACT_ADDRESS);
	console.log('');

	try {
		// Use VeChain REST API to get information about the contract
		const apiUrl = 'https://testnet.veblocks.net';

		console.log(
			'📞 Checking information about the contract through VeChain REST API...'
		);

		// First check that the contract exists
		const contractResponse = await fetch(
			`${apiUrl}/accounts/${CONTRACT_ADDRESS}`
		);

		console.log('📡 HTTP status:', contractResponse.status);
		console.log(
			'📡 HTTP headers:',
			Object.fromEntries(contractResponse.headers.entries())
		);

		const responseText = await contractResponse.text();
		console.log('📡 Raw response:', responseText.substring(0, 500));

		if (!responseText) {
			throw new Error('Empty response from server');
		}

		const contractInfo = JSON.parse(responseText);

		console.log('📊 Information about the contract:', contractInfo);

		if (contractInfo.balance !== undefined) {
			console.log('✅ Contract exists and is active');
			console.log('💰 Contract balance:', contractInfo.balance);
			console.log('🔢 Contract energy:', contractInfo.energy || 'N/A');
		} else {
			console.log('⚠️ Contract not found or not active');
		}

		// Now try to get the code of the contract
		console.log('\n📞 Getting code of the contract...');
		const codeResponse = await fetch(
			`${apiUrl}/accounts/${CONTRACT_ADDRESS}/code`
		);

		if (codeResponse.ok) {
			const codeInfo = await codeResponse.json();
			console.log(
				'📊 Code of the contract obtained, length:',
				codeInfo.code ? codeInfo.code.length : 0
			);
		} else {
			console.log('⚠️ Unable to get code of the contract');
		}

		// Try to check the events of the contract
		console.log('\n📞 Checking events of the contract...');
		const eventsResponse = await fetch(
			`${apiUrl}/logs/event?address=${CONTRACT_ADDRESS}&topic0=0x5b34c965`
		);

		if (eventsResponse.ok) {
			const eventsInfo = await eventsResponse.json();
			console.log('📊 Events of the contract:', eventsInfo);
		} else {
			console.log('⚠️ Unable to get events of the contract');
		}

		// Try to check the storage of the contract
		console.log('\n📞 Checking storage of the contract...');
		const storageResponse = await fetch(
			`${apiUrl}/accounts/${CONTRACT_ADDRESS}/storage`
		);

		if (storageResponse.ok) {
			const storageInfo = await storageResponse.json();
			console.log('📊 Storage of the contract:', storageInfo);
		} else {
			console.log('⚠️ Unable to get storage of the contract');
		}

		// Try to use VeChain REST API to call the functions of the contract
		console.log('\n📞 Trying to call the function of the contract through REST API...');

		// Create a transaction to call the function
		const callRequest = {
			clauses: [
				{
					to: CONTRACT_ADDRESS,
					value: '0x0',
					data: '0x5b34c965' + USER_ADDRESS.slice(2).padStart(64, '0'), // isDonorRegistered(address)
				},
			],
		};

		console.log('📡 Sending request:', JSON.stringify(callRequest, null, 2));

		const callResponse = await fetch(`${apiUrl}/accounts/${CONTRACT_ADDRESS}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(callRequest),
		});

		console.log('📡 HTTP статус:', callResponse.status);
		console.log(
			'📡 HTTP headers:',
			Object.fromEntries(callResponse.headers.entries())
		);

		const callResponseText = await callResponse.text();
		console.log('📡 Raw response:', callResponseText.substring(0, 500));

		if (
			callResponseText &&
			callResponseText !== 'This endpoint is no longer supported.'
		) {
			try {
				const callResult = JSON.parse(callResponseText);
				console.log('📊 Result of the call:', callResult);
			} catch (e) {
				console.log('⚠️ Unable to parse the response as JSON');
			}
		}

		// Also check the last transactions of the user
		console.log('\n🔍 Checking last transactions...');

		try {
			// Try to get transactions through another endpoint
			const txResponse = await fetch(
				`https://explore-testnet.vechain.org/api/transactions?address=${USER_ADDRESS}`
			);

			if (txResponse.ok) {
				const txData = await txResponse.json();
				console.log(
					`📈 Transactions found for user: ${txData.length || 0}`
				);

				// Search for transactions to our contract
				const contractTxs = txData.filter((tx) =>
					tx.clauses?.some((clause) => clause.to === CONTRACT_ADDRESS)
				);

				console.log(
					`📋 Transactions to VeDonate contract: ${contractTxs.length}`
				);

				if (contractTxs.length > 0) {
					console.log('\n📝 Last transactions to contract:');
					contractTxs.slice(0, 3).forEach((tx, index) => {
						console.log(`   ${index + 1}. ID: ${tx.txID || tx.id}`);
						console.log(`      Status: ${tx.txStatus || tx.status}`);
						console.log(`      Block: ${tx.blockNumber || tx.block}`);
						console.log(
							`      Time: ${
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
								`      🎯 This is the registration transaction (registerDonor)`
							);
						}
						console.log('');
					});
				}
			} else {
				console.log('⚠️ Unable to get transactions for user');
			}
		} catch (txError) {
			console.warn('⚠️ Error getting transactions:', txError.message);
		}
	} catch (error) {
		console.error('❌ Error checking status:', error);
	}
}

checkUserRegistrationStatus().catch(console.error);
