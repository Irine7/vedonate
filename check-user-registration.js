// Скрипт для проверки регистрации пользователя в VeDonate контракте
const { ThorClient } = require('@vechain/sdk-network');
const { ABIContract } = require('@vechain/sdk-core');

// Конфигурация VeChain Testnet
const thor = new ThorClient('https://testnet.vechain.org');

// Адрес контракта VeDonate
const CONTRACT_ADDRESS = '0x3e445638b907d942c33b904d6ea6951ac533bc34';

// ABI контракта (только нужные функции)
const VEDONATE_ABI = [
	'function isDonorRegistered(address donor) view returns (bool)',
	'function getDonorInfo(address donor) view returns (tuple(address wallet, uint256 totalDonations, uint256 plasmaDonations, uint256 totalB3TR, bool isRegistered, uint256 lastDonation))',
];

// Адрес пользователя для проверки
const USER_ADDRESS = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';

async function checkUserRegistration() {
	try {
		console.log('🔍 Проверяем регистрацию пользователя...');
		console.log(`📍 Адрес пользователя: ${USER_ADDRESS}`);
		console.log(`📄 Адрес контракта: ${CONTRACT_ADDRESS}`);
		console.log('');

		// Создаем экземпляр контракта через правильный API
		const contract = thor.account(CONTRACT_ADDRESS);
		const abiContract = new ABIContract(VEDONATE_ABI);

		// 1. Проверяем статус регистрации
		console.log('1️⃣ Проверяем статус регистрации...');
		const isRegisteredMethod = abiContract.getMethodById('isDonorRegistered');
		const isRegisteredCall = contract
			.method(isRegisteredMethod)
			.call(USER_ADDRESS);
		const isRegisteredResult = await isRegisteredCall;

		const isRegistered = isRegisteredResult.decoded[0];
		console.log(`✅ Пользователь зарегистрирован: ${isRegistered}`);
		console.log('');

		// 2. Получаем полную информацию о доноре
		console.log('2️⃣ Получаем полную информацию о доноре...');
		const donorInfoMethod = abiContract.getMethodById('getDonorInfo');
		const donorInfoCall = contract.method(donorInfoMethod).call(USER_ADDRESS);
		const donorInfoResult = await donorInfoCall;

		const donorInfo = donorInfoResult.decoded[0];
		console.log('📊 Информация о доноре:');
		console.log(`   🏠 Кошелек: ${donorInfo.wallet}`);
		console.log(`   📈 Всего донаций: ${donorInfo.totalDonations.toString()}`);
		console.log(
			`   💧 Донаций плазмы: ${donorInfo.plasmaDonations.toString()}`
		);
		console.log(`   🪙 Всего B3TR: ${donorInfo.totalB3TR.toString()}`);
		console.log(`   ✅ Зарегистрирован: ${donorInfo.isRegistered}`);
		console.log(
			`   🕒 Последняя донация: ${donorInfo.lastDonation.toString()}`
		);
		console.log('');

		// 3. Интерпретируем результаты
		if (isRegistered) {
			console.log('🎉 РЕЗУЛЬТАТ: Пользователь УЖЕ ЗАРЕГИСТРИРОВАН как донор!');
			console.log(
				'💡 Это объясняет ошибку "execution reverted" - контракт отклоняет повторную регистрацию.'
			);
		} else {
			console.log('❌ РЕЗУЛЬТАТ: Пользователь НЕ ЗАРЕГИСТРИРОВАН как донор.');
			console.log('💡 Можно безопасно регистрировать пользователя.');
		}
	} catch (error) {
		console.error('❌ Ошибка при проверке регистрации:', error);

		if (error.message.includes('revert')) {
			console.log('💡 Возможные причины:');
			console.log('   - Контракт не найден по указанному адресу');
			console.log('   - Неправильный ABI');
			console.log('   - Проблемы с сетью');
		}
	}
}

// Запускаем проверку
checkUserRegistration();
