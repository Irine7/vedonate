// Script for checking the registration of the user in the VeDonate contract
const { ThorClient } = require('@vechain/sdk-network');
const { ABIContract } = require('@vechain/sdk-core');

// Configuration VeChain Testnet
const thor = ThorClient.fromUrl('https://testnet.vechain.org');

// Address of the VeDonate contract
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

// ABI of the contract (only needed functions)
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

// Address of the user for checking
const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';

async function checkUserRegistration() {
	try {
		console.log('🔍 Checking the registration of the user...');
		console.log(`📍 User address: ${USER_ADDRESS}`);
		console.log(`📄 Contract address: ${CONTRACT_ADDRESS}`);
		console.log('');

		// Create an instance of the contract through the correct API
		const contract = thor.contracts.load(CONTRACT_ADDRESS, VEDONATE_ABI);

		// 1. Checking the registration status
		console.log('1️⃣ Checking the registration status...');
		const isRegisteredResult = await contract.read.isDonorRegistered(
			USER_ADDRESS
		);
		const isRegistered = isRegisteredResult[0];
		console.log(`✅ User registered: ${isRegistered}`);
		console.log('');

		// 2. Getting the full information about the donor
		console.log('2️⃣ Getting the full information about the donor...');
		const donorInfoResult = await contract.read.getDonorInfo(USER_ADDRESS);
		const donorInfo = donorInfoResult[0];

		console.log('📊 Information about the donor:');
		console.log(`   🏠 Wallet: ${donorInfo?.wallet || 'N/A'}`);
		console.log(
			`   📈 Total donations: ${donorInfo?.totalDonations?.toString() || 'N/A'}`
		);
		console.log(
			`   💧 Plasma donations: ${donorInfo?.plasmaDonations?.toString() || 'N/A'}`
		);
		console.log(
			`   🪙 Total B3TR: ${donorInfo?.totalB3TR?.toString() || 'N/A'}`
		);
		console.log(`   ✅ Registered: ${donorInfo?.isRegistered || 'N/A'}`);
		console.log(
			`   🕒 Last donation: ${donorInfo?.lastDonation?.toString() || 'N/A'}`
		);
		console.log('');

		// 3. Interpret the results
		if (isRegistered) {
			console.log('🎉 RESULT: User already registered as a donor!');
			console.log(
				'💡 This explains the "execution reverted" error - the contract rejects duplicate registration.'
			);
		} else {
			console.log('❌ RESULT: User is not registered as a donor.');
			console.log('💡 It is safe to register the user.');
		}
	} catch (error) {
		console.error('❌ Error checking registration:', error);

		if (error.message.includes('revert')) {
			console.log('💡 Possible reasons:');
			console.log('   - Contract not found at the specified address');
			console.log('   - Incorrect ABI');
			console.log('   - Problems with the network');
		}
	}
}

// Run the check
checkUserRegistration();
