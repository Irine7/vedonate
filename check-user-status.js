const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

async function checkUserRegistrationStatus() {
	console.log('🔍 Проверяем статус регистрации пользователя...');
	console.log('📍 Адрес пользователя:', USER_ADDRESS);
	console.log('📄 Адрес контракта:', CONTRACT_ADDRESS);
	console.log('');

	try {
		// Create a simple call to the contract through VeChain RPC
		const rpcUrl = 'http://127.0.0.1:8545';

		// ABI for the isDonorRegistered function
		const isDonorRegisteredABI = {
			inputs: [{ internalType: 'address', name: 'donor', type: 'address' }],
			name: 'isDonorRegistered',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'view',
			type: 'function',
		};

		// Encode the function call
		const functionSelector = '0x' + 'isDonorRegistered(address)'.slice(0, 4);
		const encodedAddress = USER_ADDRESS.slice(2).padStart(64, '0');
		const callData = functionSelector + encodedAddress;

		console.log('📞 Calling the isDonorRegistered function through RPC...');
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
			'📡 HTTP headers:',
			Object.fromEntries(response.headers.entries())
		);

		const responseText = await response.text();
		console.log('📡 Raw response:', responseText.substring(0, 500));

		if (!responseText) {
			throw new Error('Empty response from server');
		}

		const result = JSON.parse(responseText);

		if (result.error) {
			console.error('❌ RPC error:', result.error);
			return;
		}

		console.log('📊 RPC call result:', result);

		// Decode the result
		const resultData = result.result;
		if (
			resultData ===
			'0x0000000000000000000000000000000000000000000000000000000000000000'
		) {
			console.log('❌ User is not registered (false)');
		} else if (
			resultData ===
			'0x0000000000000000000000000000000000000000000000000000000000000001'
		) {
			console.log('✅ User is already registered (true)');
		} else {
			console.log('⚠️ Unexpected result:', resultData);
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
