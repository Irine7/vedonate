# VeDonate Smart Contracts

Смарт-контракты для децентрализованной платформы донорства крови на блокчейне VeChain.

## 🚀 Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Компиляция контрактов

```bash
npm run compile
```

### Деплой в VeChain Testnet

```bash
npm run deploy
```

### Проверка контрактов

```bash
npm run verify
```

## 📋 Доступные команды

- `npm run compile` - Компиляция контрактов
- `npm run deploy` - Деплой в VeChain Testnet
- `npm run verify` - Верификация контрактов в блокчейн-эксплорере
- `npm run clean` - Очистка артефактов
- `npm run test:all` - Запуск всех тестов

## 🌐 Сети

Проект настроен для работы с **VeChain Testnet**:

- **Network**: VeChain Testnet
- **RPC URL**: https://rpc-testnet.vechain.energy
- **Chain ID**: 100010
- **Explorer**: https://explore-testnet.vechain.org

## 💰 Получение тестовых токенов

Для получения тестовых VET токенов используйте:

- [VeChain Faucet](https://faucet.vechain.org/)

## 📄 Деплоенные контракты

### VeChain Testnet (05.10.2025)

- **B3TR Token**: `0x3e0d2d748f66a56b3ed4d1afbe2e63a9db2844c3`
- **Donor Badges**: `0x9575e91189e60b4e9a41f136c87d177e42296a88`
- **VeDonate**: `0x3e445638b907d942c33b904d6ea6951ac533bc34`

## 🔧 Конфигурация

Проект использует VeChain SDK Hardhat Plugin для интеграции с VeChain блокчейном.

### Основные настройки:

- **Solidity**: 0.8.20
- **EVM Version**: paris
- **Optimizer**: включен (200 runs)

## 🧪 Тестирование

```bash
# Быстрый тест
npm run test:quick

# Базовые тесты
npm run test:basic

# Тесты граничных случаев
npm run test:edge

# Тесты бейджей
npm run test:badges

# Все тесты
npm run test:all
```

## 📚 Документация

- [VeChain Developer Docs](https://docs.vechain.org/)
- [Hardhat VeChain Plugin](https://docs.vechain.org/developer-resources/frameworks-and-ides/hardhat)
- [VeChain Testnet Explorer](https://explore-testnet.vechain.org/)
