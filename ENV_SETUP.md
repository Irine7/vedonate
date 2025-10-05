# 🔧 Настройка переменных окружения

## Создайте файл `.env.local` в корне проекта

Скопируйте содержимое ниже в файл `.env.local`:

```env
# VeChain Network Configuration
NEXT_PUBLIC_NETWORK_TYPE=test

# VeChain Delegator URL (для оплаты комиссий)
NEXT_PUBLIC_DELEGATOR_URL=https://sponsor-testnet.vechain.energy/by/90

# WalletConnect Project ID (получите на https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id_here

# Mixpanel Analytics (опционально)
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token_here

# VeChain Testnet Configuration
NEXT_PUBLIC_VECHAIN_NETWORK=testnet
NEXT_PUBLIC_CHAIN_ID=100010
NEXT_PUBLIC_RPC_URL=https://rpc-testnet.vechain.energy
NEXT_PUBLIC_EXPLORER_URL=https://explore-testnet.vechain.org

# Contract Addresses (VeChain Testnet)
NEXT_PUBLIC_B3TR_TOKEN_ADDRESS=0x3e0d2d748f66a56b3ed4d1afbe2e63a9db2844c3
NEXT_PUBLIC_DONOR_BADGES_ADDRESS=0x9575e91189e60b4e9a41f136c87d177e42296a88
NEXT_PUBLIC_VEDONATE_ADDRESS=0x3e445638b907d942c33b904d6ea6951ac533bc34
```

## 📋 Обязательные настройки

### 1. WalletConnect Project ID

- Перейдите на https://cloud.walletconnect.com/
- Создайте новый проект
- Скопируйте Project ID
- Замените `your_wallet_connect_project_id_here` на ваш Project ID

### 2. Mixpanel (опционально)

- Зарегистрируйтесь на https://mixpanel.com/
- Создайте новый проект
- Скопируйте Project Token
- Замените `your_mixpanel_token_here` на ваш токен

## 🚀 Готово!

После настройки переменных окружения:

1. Перезапустите сервер разработки:

   ```bash
   npm run dev
   ```

2. Проверьте, что все работает корректно

## 🔍 Проверка переменных

Все переменные окружения используются в следующих файлах:

- `src/app/providers/VechainKitProviderWrapper.tsx` - VeChainKit конфигурация
- `src/lib/mixpanelClient.js` - Mixpanel аналитика
- `src/lib/contracts.ts` - Адреса контрактов (уже настроены)

## ⚠️ Важно

- Файл `.env.local` не должен попадать в git (уже в .gitignore)
- Все переменные с префиксом `NEXT_PUBLIC_` доступны в браузере
- Без префикса `NEXT_PUBLIC_` переменные доступны только на сервере
