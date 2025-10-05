# 🧪 Руководство по тестированию смарт-контрактов VeDonate

## 📋 Предварительные требования

### Инструменты:

- ✅ VeWorld Wallet (установлен в браузере)
- ✅ Тестовые VET токены (для оплаты газа)
- ✅ Node.js 18+
- ✅ Git

### Подготовка:

1. **Установите VeWorld Wallet**: https://www.veworld.net/
2. **Получите тестовые VET**: https://faucet.vecha.in/
3. **Переключитесь на VeChain Testnet** в кошельке

## 🔧 Шаг 1: Деплой контрактов

### Установка зависимостей

```bash
cd contracts
npm install
```

### Настройка приватного ключа

Создайте файл `.env` в папке `contracts`:

```env
PRIVATE_KEY=ваш_приватный_ключ_для_деплоя
```

**⚠️ Важно**: Используйте тестовый кошелек, НЕ основной!

### Деплой в тестнет

```bash
npm run deploy:testnet
```

После успешного деплоя вы получите:

```
✅ B3TR Token деплоен по адресу: 0x...
✅ Donor Badges деплоен по адресу: 0x...
✅ VeDonate деплоен по адресу: 0x...
```

## 🔗 Шаг 2: Обновление адресов в фронтенде

Обновите файл `src/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
	B3TR_TOKEN: '0x...', // Замените на реальный адрес
	DONOR_BADGES: '0x...', // Замените на реальный адрес
	VEDONATE: '0x...', // Замените на реальный адрес
};
```

## 🧪 Шаг 3: Тестирование через фронтенд

### Запуск приложения

```bash
pnpm run dev
```

### Тестовые сценарии:

#### 3.1 Подключение кошелька

1. Откройте http://localhost:3000
2. Нажмите "Подключить VeWorld Wallet"
3. Выберите аккаунт в кошельке
4. Подтвердите подключение

**✅ Ожидаемый результат**: Кошелек подключен, адрес отображается

#### 3.2 Регистрация донора

1. Нажмите "🔗 Зарегистрироваться как донор"
2. Подтвердите транзакцию в кошельке
3. Дождитесь подтверждения

**✅ Ожидаемый результат**:

- Транзакция успешна
- Статус "Зарегистрирован"
- Появился дашборд донора

#### 3.3 Загрузка справки о донации

1. Выберите тип донации (кровь/плазма)
2. Укажите количество мл
3. Выберите центр сдачи
4. Загрузите любое изображение (для теста)
5. Нажмите "Загрузить и записать в блокчейн"

**✅ Ожидаемый результат**:

- Прогресс-бар загрузки
- AI "анализ" документа
- Запись в блокчейн
- Получение B3TR токенов

#### 3.4 Проверка наград

После добавления донации проверьте:

- **B3TR токены**: +10 за кровь, +15 за плазму
- **NFT бейдж**: "Первая донация" должна появиться
- **История донаций**: запись в списке

## 🔍 Шаг 4: Проверка в VeChain Explorer

### Просмотр транзакций

1. Откройте https://explore-testnet.vechain.org
2. Вставьте адрес вашего кошелька
3. Найдите транзакции:
   - `registerDonor`
   - `addDonation`
   - `rewardDonor`

### Просмотр событий

В каждой транзакции найдите события:

- `DonorRegistered`
- `DonationAdded`
- `TokensRewarded`
- `BadgeMinted`

## 🧪 Шаг 5: Тестирование через консоль браузера

### Проверка состояния контрактов

Откройте DevTools (F12) и выполните:

```javascript
// Получение информации о доноре
const donorInfo = await window.vechainKit.connection.thor
	.account('0x...VEDONATE_ADDRESS')
	.read([
		{
			abi: VEDONATE_ABI,
			method: 'getDonorInfo',
			args: ['ВАШ_АДРЕС'],
		},
	]);

console.log('Donor Info:', donorInfo[0]);
```

### Проверка баланса B3TR

```javascript
const balance = await window.vechainKit.connection.thor
	.account('0x...B3TR_ADDRESS')
	.read([
		{
			abi: B3TR_TOKEN_ABI,
			method: 'balanceOf',
			args: ['ВАШ_АДРЕС'],
		},
	]);

console.log('B3TR Balance:', Number(balance[0]) / 1e18);
```

## 🔧 Шаг 6: Тестирование через Hardhat

### Создание тестового скрипта

Создайте файл `contracts/test-interaction.js`:

```javascript
const { ethers } = require('hardhat');

async function testContracts() {
	console.log('🧪 Тестирование контрактов VeDonate...');

	const [deployer, donor] = await ethers.getSigners();

	// Получаем контракты
	const veDonate = await ethers.getContractAt(
		'VeDonate',
		'0x...VEDONATE_ADDRESS'
	);
	const b3trToken = await ethers.getContractAt(
		'B3TRToken',
		'0x...B3TR_ADDRESS'
	);
	const donorBadges = await ethers.getContractAt(
		'DonorBadges',
		'0x...BADGES_ADDRESS'
	);

	// Тест 1: Регистрация донора
	console.log('📝 Тест 1: Регистрация донора...');
	const tx1 = await veDonate.connect(donor).registerDonor();
	await tx1.wait();
	console.log('✅ Донор зарегистрирован');

	// Тест 2: Добавление донации
	console.log('🩸 Тест 2: Добавление донации...');
	const tx2 = await veDonate
		.connect(deployer)
		.addDonation(donor.address, 'blood', 450, 'test-center-001');
	await tx2.wait();
	console.log('✅ Донация добавлена');

	// Тест 3: Проверка наград
	console.log('💰 Тест 3: Проверка наград...');
	const donorInfo = await veDonate.getDonorInfo(donor.address);
	const b3trBalance = await b3trToken.balanceOf(donor.address);
	const badges = await donorBadges.getDonorBadges(donor.address);

	console.log('📊 Результаты:');
	console.log('- Всего донаций:', donorInfo.totalDonations.toString());
	console.log('- B3TR баланс:', ethers.formatEther(b3trBalance));
	console.log('- Количество бейджей:', badges.length);

	console.log('🎉 Все тесты пройдены!');
}

testContracts()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ Ошибка тестирования:', error);
		process.exit(1);
	});
```

### Запуск тестов

```bash
cd contracts
npx hardhat run test-interaction.js --network vechain_testnet
```

## 🚨 Возможные проблемы и решения

### Проблема: "Insufficient VTHO"

**Решение**: Получите больше тестовых VET токенов:

- https://faucet.vecha.in/
- https://faucet.vechain.org/

### Проблема: "Contract not found"

**Решение**:

1. Проверьте адреса контрактов
2. Убедитесь, что контракты задеплоены
3. Проверьте подключение к тестнету

### Проблема: "Transaction failed"

**Решение**:

1. Проверьте баланс VET
2. Увеличьте gas limit
3. Проверьте права доступа

### Проблема: "Invalid donation type"

**Решение**: Используйте только "blood" или "plasma"

## 📊 Ожидаемые результаты тестирования

### После первой донации:

- ✅ Донор зарегистрирован
- ✅ 1 донация в истории
- ✅ 10 B3TR токенов (за кровь)
- ✅ 1 NFT бейдж "Первая донация"

### После 5 донаций:

- ✅ 5 донаций в истории
- ✅ 50 B3TR токенов
- ✅ 2 NFT бейджа (Первая + Бронзовая)

### После 10 донаций:

- ✅ 10 донаций в истории
- ✅ 100 B3TR токенов
- ✅ 3 NFT бейджа (Первая + Бронзовая + Серебряная)

## 🎯 Дополнительные тесты

### Тест граничных случаев:

1. **Дублирование донаций**: Попробуйте добавить донацию дважды
2. **Неверные параметры**: Тест с amount < 200 или > 500
3. **Незарегистрированный донор**: Попробуйте добавить донацию без регистрации

### Тест производительности:

1. **Множественные донации**: Добавьте 10+ донаций
2. **Проверка газа**: Отследите расход газа
3. **Время выполнения**: Измерьте время транзакций

## 📝 Чек-лист тестирования

- [ ] Кошелек подключается
- [ ] Регистрация донора работает
- [ ] Добавление донации работает
- [ ] B3TR токены начисляются
- [ ] NFT бейджи создаются
- [ ] История донаций отображается
- [ ] Глобальная статистика обновляется
- [ ] Все события генерируются
- [ ] Транзакции видны в Explorer
- [ ] Граничные случаи обрабатываются

---

**🎉 Поздравляем! Если все тесты пройдены, ваши смарт-контракты работают корректно!**
