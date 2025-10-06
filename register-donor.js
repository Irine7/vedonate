// Script for registering a user as a donor in the VeDonate contract
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

async function registerDonor() {
	try {
		console.log('🚀 Starting donor registration...');
		console.log(`📍 User address: ${USER_ADDRESS}`);
		console.log(`📄 Contract address: ${CONTRACT_ADDRESS}`);
		console.log('');

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

		// 2. Get information about the last block
		console.log('2️⃣ Get information about the blockchain...');
		const bestBlock = await thor.blocks.getBestBlockCompressed();
		console.log(`📦 Last block: ${bestBlock.number}`);
		console.log(`⛽ Gas price: ${bestBlock.gasPrice}`);
		console.log('');

		// 3. Create data for the transaction
		console.log('3️⃣ Prepare data for registration...');

		const transactionData = {
			to: CONTRACT_ADDRESS,
			value: '0x0',
			data: REGISTER_DONOR_SELECTOR,
			gas: 100000,
			gasPriceCoef: 128,
			nonce: Math.floor(Math.random() * 1000000000),
		};

		console.log('📋 Transaction data:');
		console.log(`   To: ${transactionData.to}`);
		console.log(`   Value: ${transactionData.value}`);
		console.log(`   Data: ${transactionData.data}`);
		console.log(`   Gas: ${transactionData.gas}`);
		console.log(`   Gas Price Coef: ${transactionData.gasPriceCoef}`);
		console.log(`   Nonce: ${transactionData.nonce}`);
		console.log('');

		// 4. Simulate the function call
		console.log('4️⃣ Simulate the function call registerDonor...');
		try {
			const callData = {
				to: CONTRACT_ADDRESS,
				data: REGISTER_DONOR_SELECTOR,
			};

			const simulationResult = await thor.accounts.executeCall(callData);
			console.log('✅ Simulation successful!');
			console.log(`📊 Simulation result:`, simulationResult);
		} catch (error) {
			console.log('⚠️ Error during simulation:', error.message);
			console.log('💡 This may be normal for some transactions.');
		}
		console.log('');

		// 5. Instructions for sending the transaction
		console.log('5️⃣ Instructions for sending the transaction:');
		console.log('');
		console.log('🔑 Для отправки транзакции вам понадобится:');
		console.log('   1. Private key of the user or access to the wallet');
		console.log('   2. VeWorld wallet or another compatible wallet');
		console.log('');
		console.log('📋 Data for sending the transaction:');
		console.log(`   From: ${USER_ADDRESS}`);
		console.log(`   To: ${CONTRACT_ADDRESS}`);
		console.log(`   Value: 0 VET`);
		console.log(`   Data: ${REGISTER_DONOR_SELECTOR}`);
		console.log(`   Gas: 100000`);
		console.log('');
		console.log('🌐 Network: VeChain Testnet');
		console.log(
			`🔗 Explorer: https://explore-testnet.vechain.org/accounts/${USER_ADDRESS}`
		);
		console.log('');

		// 6. Alternative ways to register
		console.log('6️⃣ Alternative ways to register:');
		console.log('');
		console.log('💻 Through VeWorld wallet:');
		console.log('   1. Open the VeWorld wallet');
		console.log('   2. Switch to VeChain Testnet');
		console.log('   3. Use the "Contract Interaction" function');
		console.log('   4. Enter the contract address and data');
		console.log('');
		console.log('🖥️ Through web application:');
		console.log('   1. Open the VeDonate application');
		console.log('   2. Connect the wallet');
		console.log('   3. Click the "Register as Donor" button');
		console.log('');

		console.log('🎉 Ready! Transaction is ready to be sent.');
		console.log(
			'💡 After successfully sending the transaction, the user will be registered as a donor.'
		);
	} catch (error) {
		console.error('❌ Error during preparation of registration:', error);
		console.log('');
		console.log('💡 Possible reasons:');
		console.log('   - Problems with connecting to VeChain Testnet');
		console.log('   - Incorrect contract address');
		console.log('   - User already registered');
	}
}

// Запускаем регистрацию
registerDonor().catch(console.error);
