const { ThorClient, SimpleWallet } = require('@vechain/sdk-core');
const { WebSocketConnector } = require('@vechain/sdk-network');

async function checkRegistrationStatus() {
	console.log('🔍 Checking the registration status of the user...');
	console.log('📍 User address:', USER_ADDRESS);
	console.log('📄 Contract address:', CONTRACT_ADDRESS);
	console.log('');

	try {
		// Connect to VeChain Testnet
		const thorClient = new ThorClient(
			new WebSocketConnector('wss://testnet.vechain.org')
		);

		console.log('✅ Connection to VeChain Testnet established');

		// ABI for the isDonorRegistered function
		const isDonorRegisteredABI = [
			{
				inputs: [{ internalType: 'address', name: 'donor', type: 'address' }],
				name: 'isDonorRegistered',
				outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
				stateMutability: 'view',
				type: 'function',
			},
		];

		// Create an instance of the contract
		const contract = thorClient.contract(
			CONTRACT_ADDRESS,
			isDonorRegisteredABI
		);

		console.log('📞 Calling the isDonorRegistered function...');

		// Call the isDonorRegistered function
		const result = await contract.read('isDonorRegistered', [USER_ADDRESS]);

		console.log('📊 Result of the check:');
		console.log('   User registered:', result);

		if (result) {
			console.log('✅ USER ALREADY REGISTERED!');
		} else {
			console.log('❌ USER NOT REGISTERED');
		}

		// Also check the last transactions
		console.log('\n🔍 Checking the last transactions...');

		try {
			const response = await fetch(
				`https://explore-testnet.vechain.org/api/accounts/${USER_ADDRESS}/transactions`
			);
			const data = await response.json();

			console.log(`📈 Total transactions: ${data.count}`);

			// Find transactions to our contract
			const contractTxs =
				data.items?.filter((tx) =>
					tx.clauses?.some((clause) => clause.to === CONTRACT_ADDRESS)
				) || [];

			console.log(`📋 Transactions to the contract: ${contractTxs.length}`);

			if (contractTxs.length > 0) {
				console.log('\n📝 Last transactions to the contract:');
				contractTxs.slice(0, 3).forEach((tx, index) => {
					console.log(`   ${index + 1}. ID: ${tx.txID}`);
					console.log(`      Status: ${tx.txStatus}`);
					console.log(`      Block: ${tx.blockNumber || 'pending'}`);
					console.log(
						`      Time: ${
							tx.timestamp
								? new Date(tx.timestamp * 1000).toLocaleString()
								: 'pending'
						}`
					);
					console.log('');
				});
			} else {
				console.log('❌ Transactions to the contract not found');
			}
		} catch (fetchError) {
			console.warn(
				'⚠️ Unable to get transactions through the API:',
				fetchError.message
			);
		}
	} catch (error) {
		console.error('❌ Error checking registration:', error);
	}
}

// Constants
const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

// Run the check
checkRegistrationStatus().catch(console.error);
