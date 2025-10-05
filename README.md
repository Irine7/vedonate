# 🩸 VeDonate - Децентрализованная система донорства крови

[![VeChain](https://img.shields.io/badge/VeChain-Blockchain-green)](https://vechain.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://typescriptlang.org)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-2.8-purple)](https://chakra-ui.com)

VeDonate — это децентрализованная платформа для поощрения донорства крови и плазмы, построенная на блокчейне VeChain. Платформа мотивирует людей сдавать кровь, предлагая B3TR токены и NFT-бейджи за подтверждённые донации.

## ✨ Основные возможности

- 🔗 **VeChain интеграция** - все данные хранятся в блокчейне
- 💰 **B3TR токены** - вознаграждение за донации (10 B3TR за кровь, 15 B3TR за плазму)
- 🏆 **NFT бейджи** - коллекционные достижения за донорство
- 🤖 **AI верификация** - автоматическая проверка справок о донации
- 📱 **VeWorld Wallet** - интеграция с официальным кошельком VeChain
- 🌐 **Многоязычность** - поддержка русского, английского и других языков
- 🎨 **Современный UI** - красивый интерфейс с темной/светлой темой

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- pnpm (рекомендуется) или npm
- VeWorld Wallet для тестирования

### Установка

1. **Клонируйте репозиторий**

```bash
git clone https://github.com/Irine7/vedonate
cd vedonate
```

2. **Установите зависимости**

```bash
pnpm install
```

3. **Настройте смарт-контракты**

```bash
pnpm run setup:contracts
```

4. **Запустите проект в режиме разработки**

```bash
pnpm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## ⛓️ Настройка блокчейна

### 1. Деплой смарт-контрактов

```bash
# Компиляция контрактов
pnpm run contracts:compile

# Деплой в VeChain Testnet
pnpm run contracts:deploy:testnet
```

### 2. Обновление адресов контрактов

После деплоя обновите файл `src/lib/contracts.ts` с полученными адресами:

```typescript
export const CONTRACT_ADDRESSES = {
	B3TR_TOKEN: '0x...', // Замените на реальный адрес
	DONOR_BADGES: '0x...', // Замените на реальный адрес
	VEDONATE: '0x...', // Замените на реальный адрес
};
```

Подробная инструкция по настройке блокчейна: [BLOCKCHAIN_SETUP.md](./BLOCKCHAIN_SETUP.md)

## 🏗️ Архитектура проекта

```
vedonate/
├── contracts/                 # Смарт-контракты VeChain
│   ├── B3TRToken.sol         # ERC-20 токен наград
│   ├── DonorBadges.sol       # ERC-721 NFT бейджи
│   ├── VeDonate.sol          # Основной контракт
│   └── deploy.js             # Скрипт деплоя
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── components/       # React компоненты
│   │   │   ├── pages/        # Страницы приложения
│   │   │   └── features/     # Функциональные компоненты
│   │   └── layout.tsx        # Корневой layout
│   ├── hooks/                # React хуки
│   │   ├── useVeDonate.ts    # Хук для работы с контрактами
│   │   └── useSafeWallet.ts  # Хук для работы с кошельком
│   ├── lib/                  # Утилиты и конфигурация
│   │   └── contracts.ts      # ABI и адреса контрактов
│   └── types/                # TypeScript типы
└── public/                   # Статические файлы
```

## 🎯 Основные компоненты

### VeDonateHome

Главная страница с дашбордом донора, статистикой и основными действиями.

### UploadCertificate

Компонент для загрузки справок о донации с AI верификацией.

### DonationHistory

История донаций пользователя, загруженная из блокчейна.

### DonorBadges

NFT бейджи и достижения донора.

### AIAssistant

Чат-бот для помощи донорам с рекомендациями.

## 🔧 API и хуки

### useVeDonate

Основной хук для взаимодействия с блокчейном:

```typescript
const {
	donorInfo, // Информация о доноре
	donorDonations, // История донаций
	donorBadges, // NFT бейджи
	globalStats, // Глобальная статистика
	b3trBalance, // Баланс B3TR токенов
	registerDonor, // Регистрация донора
	addDonation, // Добавление донации
	refreshData, // Обновление данных
} = useVeDonate();
```

## 🎨 Дизайн система

Проект использует Chakra UI с кастомной темой, включающей:

- Градиенты в цветах крови (красный/оранжевый)
- Адаптивный дизайн для мобильных устройств
- Темная и светлая темы
- Иконки эмодзи для дружелюбного интерфейса

## 🌍 Многоязычность

Поддержка языков через i18next:

- Русский (по умолчанию)
- Английский
- Испанский
- Французский
- Немецкий
- Итальянский
- Японский
- Китайский

## 📱 Мобильная поддержка

- Адаптивный дизайн для всех устройств
- Оптимизация для VeWorld Wallet на мобильных
- PWA поддержка с Service Worker

## 🧪 Тестирование

```bash
# Запуск линтера
pnpm run lint

# Проверка типов
pnpm run type-check

# Сборка проекта
pnpm run build
```

## 🚀 Деплой в продакшн

1. **Настройте переменные окружения**

```env
NEXT_PUBLIC_VECHAIN_NETWORK=mainnet
NEXT_PUBLIC_CONTRACT_ADDRESSES=...
```

2. **Соберите проект**

```bash
pnpm run build
```

3. **Деплойте на Vercel, Netlify или другой платформе**

## 🤝 Вклад в проект

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🙏 Благодарности

- [VeChain Foundation](https://vechain.org) за экосистему
- [Chakra UI](https://chakra-ui.com) за компоненты
- [Next.js](https://nextjs.org) за фреймворк
- [OpenZeppelin](https://openzeppelin.com) за смарт-контракты

## 📞 Поддержка

- 📧 Email: support@vedonate.org
- 💬 Discord: [VeChain Community](https://discord.gg/vechain)
- 🐦 Twitter: [@VeDonate](https://twitter.com/vedonate)
- 📖 Документация: [docs.vedonate.org](https://docs.vedonate.org)

---

**Сделано с ❤️ для спасения жизней через блокчейн технологию**
