const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

async function debugAddressCheck() {
	console.log('🔍 Checking addresses...');
	console.log('📍 User address:', USER_ADDRESS);
	console.log('📍 User address (without 0x):', USER_ADDRESS.slice(2));
	console.log('📄 Contract address:', CONTRACT_ADDRESS);
	console.log('');

	// Check the validity of addresses
	const isValidAddress = (addr) => {
		return /^0x[a-fA-F0-9]{40}$/.test(addr);
	};

	console.log('✅ User address is valid:', isValidAddress(USER_ADDRESS));
	console.log('✅ Contract address is valid:', isValidAddress(CONTRACT_ADDRESS));
	console.log('');

	// Try different API variants
	const apiUrls = [
		`https://explore-testnet.vechain.org/api/accounts/${USER_ADDRESS}/transactions`,
		`https://explore-testnet.vechain.org/api/accounts/${USER_ADDRESS.slice(
			2
		)}/transactions`,
		`https://explore-testnet.vechain.org/api/transactions?address=${USER_ADDRESS}`,
		`https://explore-testnet.vechain.org/api/accounts/${USER_ADDRESS}`,
	];

	for (const url of apiUrls) {
		console.log(`🔗 Testing URL: ${url}`);
		try {
			const response = await fetch(url);
			console.log(`   Status: ${response.status}`);

			if (response.ok) {
				const data = await response.json();
				console.log(`   ✅ Success! Data:`, typeof data, Object.keys(data));

				if (data.count !== undefined) {
					console.log(`   📊 Number of transactions: ${data.count}`);
				}
				break;
			} else {
				const text = await response.text();
				console.log(`   ❌ Error: ${text.substring(0, 100)}`);
			}
		} catch (error) {
			console.log(`   ❌ Request error: ${error.message}`);
		}
		console.log('');
	}

	// Try to check the contract
	console.log('🔍 Checking contract...');
	try {
		const contractResponse = await fetch(
			`https://explore-testnet.vechain.org/api/accounts/${CONTRACT_ADDRESS}`
		);
		const contractData = await contractResponse.json();
		console.log('📊 Contract data:', contractData);
	} catch (error) {
		console.log('❌ Error checking contract:', error.message);
	}
}

debugAddressCheck().catch(console.error);
