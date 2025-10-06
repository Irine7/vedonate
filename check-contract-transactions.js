const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';
const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';

async function checkContractTransactions() {
	console.log('🔍 Checking the transactions of the contract...');
	console.log('📄 Contract address:', CONTRACT_ADDRESS);
	console.log('📍 User address:', USER_ADDRESS);
	console.log('');

	try {
		// Get the transactions of the contract
		console.log('📈 Getting the transactions of the contract...');
		const contractResponse = await fetch(
			`https://explore-testnet.vechain.org/api/accounts/${CONTRACT_ADDRESS}/transactions`
		);
		const contractData = await contractResponse.json();

		console.log(`📊 Total transactions of the contract: ${contractData.count}`);

		if (contractData.items && contractData.items.length > 0) {
			console.log('\n📝 Last 10 transactions of the contract:');

			contractData.items.slice(0, 10).forEach((tx, index) => {
				console.log(`   ${index + 1}. ID: ${tx.txID}`);
				console.log(`      Origin: ${tx.origin}`);
				console.log(`      Status: ${tx.txStatus}`);
				console.log(`      Block: ${tx.blockNumber || 'pending'}`);
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

					// Check if this is our user
					if (tx.origin?.toLowerCase() === USER_ADDRESS.toLowerCase()) {
						console.log(`      🎯 THIS IS OUR USER!`);

						if (tx.txStatus === 'success') {
							console.log(`      ✅ REGISTRATION SUCCESSFUL!`);
						} else if (tx.txStatus === 'failed') {
							console.log(`      ❌ REGISTRATION FAILED!`);
						} else {
							console.log(`      ⏳ REGISTRATION IN PROCESS...`);
						}
					}
				}

				// Check all clauses
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

			// Find transactions from our user
			const userTransactions = contractData.items.filter(
				(tx) => tx.origin?.toLowerCase() === USER_ADDRESS.toLowerCase()
			);

			console.log(
				`🎯 Transactions from our user: ${userTransactions.length}`
			);

			if (userTransactions.length > 0) {
				console.log('\n📝 All transactions from our user:');
				userTransactions.forEach((tx, index) => {
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

					const registerClause = tx.clauses?.find(
						(clause) =>
							clause.to === CONTRACT_ADDRESS && clause.data === '0x5b34c965'
					);

					if (registerClause) {
						console.log(`      🎯 Registration transaction`);
						if (tx.txStatus === 'success') {
							console.log(`      ✅ REGISTRATION SUCCESSFUL!`);
						} else {
							console.log(`      ❌ REGISTRATION FAILED!`);
						}
					}
					console.log('');
				});
			}
		} else {
			console.log('❌ Transactions of the contract not found');
		}
	} catch (error) {
		console.error('❌ Error checking transactions of the contract:', error);
	}
}

checkContractTransactions().catch(console.error);
