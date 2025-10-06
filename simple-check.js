// Simple check of user registration through VeChain Explorer API
const https = require('https');

// Configuration
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';
const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';

// Function to get data about contract transactions
async function checkUserRegistration() {
	console.log('🔍 Checking user registration...');
	console.log(`📍 User address: ${USER_ADDRESS}`);
	console.log(`📄 Contract address: ${CONTRACT_ADDRESS}`);
	console.log('');

	try {
		// Check registration events through VeChain Explorer API
		const eventsUrl = `https://explore-testnet.vechain.org/api/accounts/${CONTRACT_ADDRESS}/events`;

		console.log('🌐 Checking events through VeChain Explorer API...');
		console.log(`📡 URL: ${eventsUrl}`);
		console.log('');

		// Make a request to the API
		const response = await fetch(eventsUrl);
		const data = await response.json();

		if (data && data.items) {
			console.log(`📊 Found ${data.items.length} events for the contract`);

			// Find DonorRegistered events
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
				`🎯 Found ${registrationEvents.length} registration events`
			);

			if (registrationEvents.length > 0) {
				console.log('✅ RESULT: User REGISTERED!');
				console.log('📝 Registration events:');
				registrationEvents.forEach((event, index) => {
					console.log(
						`   ${index + 1}. Block: ${event.blockNumber}, Transaction: ${
							event.txId
						}`
					);
				});
			} else {
				console.log('❌ RESULT: User NOT REGISTERED');
				console.log('💡 Registration events not found');
			}
		} else {
			console.log('⚠️ Unable to get data from API');
			console.log('💡 Try to check manually through VeChain Explorer');
		}
	} catch (error) {
		console.error('❌ Error during check:', error.message);
		console.log('');
		console.log('💡 Alternative ways to check:');
		console.log(
			'   1. Open: https://explore-testnet.vechain.org/accounts/' +
				CONTRACT_ADDRESS
		);
		console.log('   2. Go to the "Events" tab');
		console.log(
			'   3. Find the DonorRegistered event with the address:',
			USER_ADDRESS
		);
	}

	console.log('');
	console.log('🔗 Direct links for checking:');
	console.log(
		`   📄 Contract: https://explore-testnet.vechain.org/accounts/${CONTRACT_ADDRESS}`
	);
	console.log(
		`   👤 User: https://explore-testnet.vechain.org/accounts/${USER_ADDRESS}`
	);
}

// Start the check
checkUserRegistration();
