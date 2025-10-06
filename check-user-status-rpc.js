const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

async function checkUserRegistrationStatus() {
	console.log(
		'🔍 Проверяем статус регистрации пользователя через RPC proxy...'
	);
	console.log('📍 Адрес пользователя:', USER_ADDRESS);
	console.log('📄 Адрес контракта:', CONTRACT_ADDRESS);
	console.log('');

	try {
		// Use local RPC proxy
		const rpcUrl = 'http://127.0.0.1:8545';

		console.log('📞 Calling the isDonorRegistered function through RPC proxy...');

		// First check the isDonorRegistered(address) function
		// Selector: keccak256('isDonorRegistered(address)') = 0xc53c1c63
		const functionSelector = '0xc53c1c63';
		const encodedAddress = USER_ADDRESS.slice(2).padStart(64, '0');
		const callData = functionSelector + encodedAddress;

		console.log('📡 Call data for isDonorRegistered:', callData);

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

		console.log(
			'📡 Sending RPC request:',
			JSON.stringify(rpcRequest, null, 2)
		);

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
		console.log('📡 Raw response:', responseText);

		if (!responseText) {
			throw new Error('Empty response from server');
		}

		const result = JSON.parse(responseText);

		if (result.error) {
			console.error('❌ RPC error:', result.error);
			return;
		}

		console.log('📊 RPC call result for isDonorRegistered:', result);

		// Decode the result isDonorRegistered (returns bool)
		const resultData = result.result;
		console.log('📊 User data (hex):', resultData);

		// isDonorRegistered возвращает bool (32 байта)
		if (resultData && resultData.length >= 66) {
			// 0x + 64 символа
			const isRegisteredHex = resultData.slice(2); // убираем 0x
			console.log('📊 isRegistered hex:', isRegisteredHex);

			if (
				isRegisteredHex ===
				'0000000000000000000000000000000000000000000000000000000000000000'
			) {
				console.log('❌ User is not registered (false)');
			} else if (
				isRegisteredHex ===
				'0000000000000000000000000000000000000000000000000000000000000001'
			) {
				console.log('✅ User is already registered (true)');
			} else {
				console.log('⚠️ Unexpected result isRegistered:', isRegisteredHex);
			}
		} else {
			console.log('⚠️ Not enough data in the response');
		}

		// Также попробуем получить информацию о контракте
		console.log('\n📞 Getting information about the contract...');

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
		console.log(
			'📊 Contract code:',
			contractResult.result ? 'Found' : 'Not found'
		);

		// Try to get the balance of the user
		console.log('\n📞 Getting the balance of the user...');

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
		console.log('📊 User balance:', balanceResult.result);
	} catch (error) {
		console.error('❌ Error checking status:', error);
	}
}

// Wait a bit for the RPC proxy to start
setTimeout(() => {
	checkUserRegistrationStatus().catch(console.error);
}, 3000);
