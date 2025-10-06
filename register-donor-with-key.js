// Script to register a user as a donor using a private key
const { ThorClient } = require('@vechain/sdk-network');
const { Clause, Transaction } = require('@vechain/sdk-core');

// VeChain Testnet configuration
const thor = ThorClient.fromUrl('https://testnet.vechain.org');

// VeDonate contract address
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

// User address for registration
const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';

// Function selector для registerDonor() - keccak256('registerDonor()') = 0x5b34c965
const REGISTER_DONOR_SELECTOR = '0x5b34c965';

// WARNING: Do not use real private keys in production!
// This script is only for testing
// For real use, get the private key from the user or use a wallet
const PRIVATE_KEY = process.env.PRIVATE_KEY || null;

async function registerDonorWithKey() {
	try {
		console.log('🚀 Starting donor registration with private key...');
		console.log(`📍 User address: ${USER_ADDRESS}`);
		console.log(`📄 Contract address: ${CONTRACT_ADDRESS}`);
		console.log('');

		if (!PRIVATE_KEY) {
			console.log('⚠️ Private key not found!');
			console.log(
				'💡 Set the PRIVATE_KEY environment variable or pass the key through parameters.'
			);
			console.log('');
			console.log('🔧 Example usage:');
			console.log('   PRIVATE_KEY=0x... node register-donor-with-key.js');
			console.log('');
			console.log('🛡️ IMPORTANT: Never store private keys in code!');
			console.log(
				'   Use environment variables or a secure storage.'
			);
			return;
		}

		// 1. Check the current registration status
		console.log('1️⃣ Check the current registration status...');
		const contract = thor.contracts.load(CONTRACT_ADDRESS, [
			{
				inputs: [{ internalType: 'address', name: 'donor', type: 'address' }],
				name: 'isDonorRegistered',
				outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
				stateMutability: 'view',
				type: 'function',
			},
		]);

		const isRegisteredResult = await contract.read.isDonorRegistered(
			USER_ADDRESS
		);
		const isRegistered = isRegisteredResult[0];

		if (isRegistered) {
			console.log('⚠️ User is already registered as a donor!');
			console.log('💡 Registration is not required.');
			return;
		}

		console.log(
			'✅ User is not registered. Continuing registration...'
		);
		console.log('');

		// 2. Get information about the blockchain
		console.log('2️⃣ Get information about the blockchain...');
		const bestBlock = await thor.blocks.getBestBlockCompressed();
		console.log(`📦 Last block: ${bestBlock.number}`);
		console.log(`⛽ Gas price: ${bestBlock.gasPrice || 'automatic'}`);
		console.log('');

		// 3. Create a clause for registration
		console.log('3️⃣ Create a registration transaction...');
		const clause = new Clause({
			to: CONTRACT_ADDRESS,
			value: '0x0',
			data: REGISTER_DONOR_SELECTOR,
		});

		// 4. Create the transaction body
		const transactionBody = {
			clause: clause,
			gas: 100000,
			gasPriceCoef: 128,
			dependsOn: null,
			nonce: Math.floor(Math.random() * 1000000000),
		};

		console.log('📋 Transaction data:');
		console.log(`   To: ${CONTRACT_ADDRESS}`);
		console.log(`   Value: 0 VET`);
		console.log(`   Data: ${REGISTER_DONOR_SELECTOR}`);
		console.log(`   Gas: ${transactionBody.gas}`);
		console.log(`   Gas Price Coef: ${transactionBody.gasPriceCoef}`);
		console.log(`   Nonce: ${transactionBody.nonce}`);
		console.log('');

		// 5. Create and sign the transaction
		console.log('4️⃣ Create and sign the transaction...');
		const transaction = new Transaction(transactionBody);
		const signedTransaction = transaction.sign(PRIVATE_KEY);

		console.log('✅ Transaction signed!');
		console.log(`📄 Transaction ID: ${signedTransaction.id}`);
		console.log(`🔗 Chain ID: ${signedTransaction.chainTag}`);
		console.log('');

		// 6. Отправляем транзакцию
		console.log('5️⃣ Send the transaction to the blockchain...');
		const sendResult = await thor.transactions.sendRawTransaction(
			signedTransaction
		);

		console.log('🎉 Transaction sent successfully!');
		console.log(`📡 Transaction ID: ${sendResult.id}`);
		console.log(
			`🔗 Explorer: https://explore-testnet.vechain.org/transactions/${sendResult.id}`
		);
		console.log('');

		// 7. Wait for confirmation
		console.log('6️⃣ Wait for the transaction to be confirmed...');
		let receipt = null;
		let attempts = 0;
		const maxAttempts = 30; // 30 attempts for 2 seconds = 1 minute

		while (!receipt && attempts < maxAttempts) {
			try {
				receipt = await thor.transactions.getTransactionReceipt(sendResult.id);
				if (receipt) {
					console.log('✅ Transaction confirmed!');
					console.log(`📦 Block: ${receipt.meta.blockNumber}`);
					console.log(`⛽ Gas used: ${receipt.meta.gasUsed}`);
					break;
				}
			} catch (error) {
				// Transaction is not confirmed yet
			}

			attempts++;
			console.log(`⏳ Attempt ${attempts}/${maxAttempts}...`);
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}

		if (!receipt) {
			console.log(
				'⚠️ Transaction not confirmed in the expected time.'
			);
			console.log('💡 Check the transaction status in explorer later.');
			return;
		}

		// 8. Check the registration result
		console.log('');
		console.log('7️⃣ Check the registration result...');

		const finalCheckResult = await contract.read.isDonorRegistered(
			USER_ADDRESS
		);
		const finalIsRegistered = finalCheckResult[0];

		if (finalIsRegistered) {
			console.log('🎉 SUCCESS! User successfully registered as a donor!');

			// Get information about the donor
			try {
				const donorInfoResult = await contract.read.getDonorInfo(USER_ADDRESS);
				const donorInfo = donorInfoResult[0];
				console.log('');
				console.log('📊 Information about the new donor:');
				console.log(`   🏠 Кошелек: ${donorInfo?.wallet || 'N/A'}`);
				console.log(
					`   📈 Всего донаций: ${donorInfo?.totalDonations?.toString() || '0'}`
				);
				console.log(
					`   💧 Plasma donations: ${
						donorInfo?.plasmaDonations?.toString() || '0'
					}`
				);
				console.log(
					`   🪙 Total B3TR: ${donorInfo?.totalB3TR?.toString() || '0'}`
				);
				console.log(
					`   ✅ Registered: ${donorInfo?.isRegistered || 'N/A'}`
				);
				console.log(
					`   🕒 Last donation: ${
						donorInfo?.lastDonation?.toString() || '0'
					}`
				);
			} catch (error) {
				console.log(
					'⚠️ Unable to get full information about the donor:',
					error.message
				);
			}
		} else {
			console.log(
				'❌ ERROR! User is not registered after the transaction.'
			);
			console.log('💡 Possible reasons:');
			console.log('   - Transaction did not succeed');
			console.log('   - Contract error');
			console.log('   - Not enough gas');
		}

		console.log('');
		console.log('📋 FINAL INFORMATION:');
		console.log(`   👤 Пользователь: ${USER_ADDRESS}`);
		console.log(`   📄 Contract: ${CONTRACT_ADDRESS}`);
		console.log(`   🆔 Transaction ID: ${sendResult.id}`);
		console.log(
			`   🔗 Explorer: https://explore-testnet.vechain.org/transactions/${sendResult.id}`
		);
		console.log(`   🕐 Time: ${new Date().toLocaleString('ru-RU')}`);
	} catch (error) {
		console.error('❌ Error during donor registration:', error);
		console.log('');
		console.log('💡 Possible reasons:');
		console.log('   - Incorrect private key');
		console.log('   - Not enough gas');
		console.log('   - Problems with network connection');
		console.log('   - User already registered');
	}
}

// Start registration
registerDonorWithKey().catch(console.error);
