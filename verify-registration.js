// Script to check the registration of the user after the transaction
const { ThorClient } = require('@vechain/sdk-network');

// Configuration VeChain Testnet
const thor = ThorClient.fromUrl('https://testnet.vechain.org');

// Contract address VeDonate
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

// User address for checking
const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';

// ABI contract
const VEDONATE_ABI = [
	{
		inputs: [{ internalType: 'address', name: 'donor', type: 'address' }],
		name: 'isDonorRegistered',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: 'donor', type: 'address' }],
		name: 'getDonorInfo',
		outputs: [
			{
				components: [
					{ internalType: 'address', name: 'wallet', type: 'address' },
					{ internalType: 'uint256', name: 'totalDonations', type: 'uint256' },
					{ internalType: 'uint256', name: 'plasmaDonations', type: 'uint256' },
					{ internalType: 'uint256', name: 'totalB3TR', type: 'uint256' },
					{ internalType: 'bool', name: 'isRegistered', type: 'bool' },
					{ internalType: 'uint256', name: 'lastDonation', type: 'uint256' },
				],
				internalType: 'struct VeDonate.Donor',
				name: '',
				type: 'tuple',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
];

async function verifyRegistration() {
	try {
		console.log('🔍 Checking the registration status of the user...');
		console.log(`📍 Адрес пользователя: ${USER_ADDRESS}`);
		console.log(`📄 Адрес контракта: ${CONTRACT_ADDRESS}`);
		console.log('');

		// Create an instance of the contract
		const contract = thor.contracts.load(CONTRACT_ADDRESS, VEDONATE_ABI);

		// 1. Check the registration status
		console.log('1️⃣ Проверяем статус регистрации...');
		const isRegisteredResult = await contract.read.isDonorRegistered(
			USER_ADDRESS
		);
		const isRegistered = isRegisteredResult[0];

		console.log(`✅ User registered: ${isRegistered}`);
		console.log('');

		// 2. Get the full information about the donor
		console.log('2️⃣ Getting the full information about the donor...');
		try {
			const donorInfoResult = await contract.read.getDonorInfo(USER_ADDRESS);
			const donorInfo = donorInfoResult[0];

			console.log('📊 Information about the donor:');
			console.log(`   🏠 Wallet: ${donorInfo?.wallet || 'N/A'}`);
			console.log(
				`   📈 Total donations: ${donorInfo?.totalDonations?.toString() || 'N/A'}`
			);
			console.log(
				`   💧 Plasma donations: ${
					donorInfo?.plasmaDonations?.toString() || 'N/A'
				}`
			);
			console.log(
				`   🪙 Total B3TR: ${donorInfo?.totalB3TR?.toString() || 'N/A'}`
			);
			console.log(`   ✅ Registered: ${donorInfo?.isRegistered || 'N/A'}`);
			console.log(
				`   🕒 Last donation: ${
					donorInfo?.lastDonation?.toString() || 'N/A'
				}`
			);
		} catch (error) {
			console.log(
				'⚠️ Unable to get the full information about the donor:',
				error.message
			);
		}
		console.log('');

		// 3. Final result
		console.log('🎯 Final result:');
		if (isRegistered) {
			console.log('✅ User successfully registered as a donor!');
			console.log('🎉 Registration completed successfully!');
		} else {
			console.log('❌ User not registered as a donor.');
			console.log(
				'💡 Maybe the registration transaction has not been completed or an error occurred.'
			);
		}

		console.log('');
		console.log('📋 Additional information:');
		console.log(`   🔗 Сеть: VeChain Testnet`);
		console.log(`   📍 Contract: ${CONTRACT_ADDRESS}`);
		console.log(`   👤 User: ${USER_ADDRESS}`);
		console.log(
			`   🔗 Explorer: https://explore-testnet.vechain.org/accounts/${USER_ADDRESS}`
		);
		console.log(`   🕐 Check time: ${new Date().toLocaleString('ru-RU')}`);
	} catch (error) {
		console.error('❌ Error during check registration:', error.message);
		console.log('');
		console.log('💡 Possible reasons:');
		console.log('   - Problems with connecting to VeChain Testnet');
		console.log('   - Incorrect contract address');
		console.log('   - Contract not found');
	}
}

// Start the check
verifyRegistration().catch(console.error);
