# 🔍 Как проверить регистрацию пользователя в VeDonate

## Метод 1: Через VeChain Explorer (Рекомендуется)

### Шаг 1: Откройте VeChain Testnet Explorer

Перейдите по ссылке: https://explore-testnet.vechain.org/

### Шаг 2: Найдите контракт VeDonate

- Адрес контракта: `0x3e445638b907d942c33b904d6ea6951ac533bc34`
- Вставьте адрес в поисковую строку и нажмите Enter

### Шаг 3: Проверьте события регистрации

1. Перейдите на вкладку **"Events"** или **"Logs"**
2. Найдите событие `DonorRegistered`
3. Проверьте, есть ли событие с адресом пользователя: `0xb302484fc7cbecad3983E6C33efE28C3286972f6`

### Шаг 4: Используйте фильтры

В разделе событий можно использовать фильтры:

- **Event**: `DonorRegistered`
- **Address**: `0xb302484fc7cbecad3983E6C33efE28C3286972f6`

## Метод 2: Через скрипт (Для разработчиков)

### Запустите скрипт проверки:

```bash
cd /Users/irine/Desktop/vedonate
node check-user-registration.js
```

Этот скрипт:

- ✅ Проверит статус регистрации через `isDonorRegistered()`
- 📊 Покажет полную информацию о доноре
- 💡 Объяснит результаты

## Метод 3: Через VeChain Explorer - прямая проверка функции

### Шаг 1: Откройте контракт

- Перейдите: https://explore-testnet.vechain.org/accounts/0x3e445638b907d942c33b904d6ea6951ac533bc34

### Шаг 2: Найдите функцию `isDonorRegistered`

- Перейдите на вкладку **"Contract"** или **"Read Contract"**
- Найдите функцию `isDonorRegistered(address donor)`

### Шаг 3: Вызовите функцию

- В поле `donor` введите: `0xb302484fc7cbecad3983E6C33efE28C3286972f6`
- Нажмите **"Query"** или **"Call"**

### Результат:

- `true` = пользователь зарегистрирован
- `false` = пользователь не зарегистрирован

## Метод 4: Через браузер (Web3)

### Откройте консоль браузера на странице VeChain Explorer и выполните:

```javascript
// Подключение к VeChain Testnet
const thor = new ThorClient('https://testnet.vechain.org');
const contractAddress = '0x3e445638b907d942c33b904d6ea6951ac533bc34';
const userAddress = '0xb302484fc7cbecad3983E6C33efE28C3286972f6';

// ABI функции
const abi = ['function isDonorRegistered(address donor) view returns (bool)'];
const contract = thor.account(contractAddress);
const abiContract = new ABIContract(abi);

// Проверка
const method = abiContract.getMethodById('isDonorRegistered');
const result = await contract.method(method).call(userAddress);
console.log('Зарегистрирован:', result.decoded[0]);
```

## 🎯 Ожидаемый результат

Если пользователь **уже зарегистрирован**, вы увидите:

- ✅ `isDonorRegistered()` возвращает `true`
- 📝 Событие `DonorRegistered` в логах
- 💡 Это объясняет ошибку "execution reverted" - контракт отклоняет повторную регистрацию

## 🔧 Решение проблемы

Если пользователь уже зарегистрирован:

1. **Не пытайтесь регистрировать повторно** - это вызовет ошибку
2. **Обновите данные пользователя** - вызовите `fetchDonorData()`
3. **Покажите соответствующий интерфейс** - для уже зарегистрированных пользователей

## 📞 Поддержка

Если возникли проблемы с проверкой, проверьте:

- ✅ Подключение к интернету
- ✅ Правильность адреса контракта
- ✅ Доступность VeChain Testnet
