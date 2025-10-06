const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

async function checkUserRegistrationStatus() {
	console.log('🔍 Checking the registration status of the user...');
	console.log('📍 User address:', USER_ADDRESS);
	console.log('📄 Contract address:', CONTRACT_ADDRESS);
	console.log('');

	try {
		// Use the official VeChain REST API endpoint
		const apiUrl = 'https://testnet.vechain.org';

		console.log('📞 Checking the information about the contract through VeChain REST API...');

		// First check that the contract exists
		const contractResponse = await fetch(`${apiUrl}/accounts/${CONTRACT_ADDRESS}`);

		console.log('📡 HTTP status:', contractResponse.status);
		console.log('📡 HTTP headers:', Object.fromEntries(contractResponse.headers.entries()));
		
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

		// Получаем код контракта
		console.log('\n📞 Getting the code of the contract...');
		const codeResponse = await fetch(`${apiUrl}/accounts/${CONTRACT_ADDRESS}/code`);
		
		if (codeResponse.ok) {
			const codeInfo = await codeResponse.json();
			console.log('📊 Code of the contract obtained, length:', codeInfo.code ? codeInfo.code.length : 0);
		} else {
			console.log('⚠️ Unable to get the code of the contract');
		}

		// Try to get the information about the user
		console.log('\n📞 Checking the information about the user...');
		const userResponse = await fetch(`${apiUrl}/accounts/${USER_ADDRESS}`);
		
		if (userResponse.ok) {
			const userInfo = await userResponse.json();
			console.log('📊 Information about the user:', userInfo);
		} else {
			console.log('⚠️ Unable to get the information about the user');
		}

		// Try to get the events of the contract (registration)
		console.log('\n📞 Checking the events of the contract (registration)...');
		
		// Try different endpoints for events
		const eventEndpoints = [
			`${apiUrl}/logs/event?address=${CONTRACT_ADDRESS}&topic0=0x5b34c965`,
			`${apiUrl}/logs/event?address=${CONTRACT_ADDRESS}`,
			`${apiUrl}/logs/event`,
			`${apiUrl}/logs`,
		];

		for (const endpoint of eventEndpoints) {
			console.log(`   Trying: ${endpoint}`);
			try {
				const eventsResponse = await fetch(endpoint);
				
				if (eventsResponse.ok) {
					const eventsInfo = await eventsResponse.json();
					console.log('📊 Events obtained:', eventsInfo);
					break;
				} else {
					console.log(`   ❌ Status: ${eventsResponse.status}`);
				}
			} catch (e) {
				console.log(`   ❌ Error: ${e.message}`);
			}
		}

		// Try to get the transactions of the user
		console.log('\n🔍 Checking the transactions of the user...');

		// Try different endpoints for transactions
		const txEndpoints = [
			`${apiUrl}/accounts/${USER_ADDRESS}/transactions?limit=10`,
			`${apiUrl}/accounts/${USER_ADDRESS}/transactions`,
			`${apiUrl}/transactions?account=${USER_ADDRESS}`,
			`${apiUrl}/transactions`,
		];

		for (const endpoint of txEndpoints) {
			console.log(`   Trying: ${endpoint}`);
			try {
				const txResponse = await fetch(endpoint);
				
				if (txResponse.ok) {
					const txData = await txResponse.json();
					console.log(`📈 Transactions found: ${txData.length || 0}`);
					console.log('📊 Transactions:', txData);
					break;
				} else {
					console.log(`   ❌ Status: ${txResponse.status}`);
				}
			} catch (e) {
				console.log(`   ❌ Error: ${e.message}`);
			}
		}

	} catch (error) {
		console.error('❌ Error checking status:', error);
	}
}

checkUserRegistrationStatus().catch(console.error);
