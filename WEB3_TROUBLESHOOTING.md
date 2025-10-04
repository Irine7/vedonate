# Web3 Troubleshooting Guide

## Ошибка: "Cannot set property ethereum of #<Window> which has only a getter"

Эта ошибка возникает из-за конфликтов между расширениями браузера (особенно кошельками) и попыткой установить свойство `ethereum` на объект `window`.

### Решение

В проекте реализованы следующие меры защиты:

1. **Early Script Fix** - Инлайн скрипт в layout.tsx, который выполняется раньше всех расширений
2. **window-ethereum-fix.ts** - Основной фикс для обработки конфликтов с ethereum свойством
3. **Web3SafeInit.tsx** - React компонент для безопасной инициализации Web3 с Proxy-оберткой
4. **ethereum-utils.ts** - Утилиты для безопасной работы с ethereum
5. **next.config.js** - Webpack fallbacks для Node.js модулей

### Дополнительные меры

Если ошибка все еще возникает, попробуйте:

1. **Отключить расширения браузера** временно для тестирования
2. **Использовать режим инкогнито** для изоляции от расширений
3. **Очистить кэш браузера** и перезагрузить страницу

### Для разработчиков

Используйте утилиты из `ethereum-utils.ts` для безопасной работы с ethereum:

```typescript
import {
    safeGetEthereum,
    safeSetEthereum,
    isEthereumAvailable,
    getEthereumWithFallback,
    createSafeEthereumWrapper,
    waitForEthereum,
} from '@/lib/ethereum-utils';

// Безопасный доступ к ethereum
const ethereum = safeGetEthereum();

// Проверка доступности
if (isEthereumAvailable()) {
    // ethereum доступен
}

// Ожидание ethereum с таймаутом
waitForEthereum(5000)
    .then((ethereum) => {
        console.log('Ethereum доступен:', ethereum);
    })
    .catch((error) => {
        console.error('Ethereum не найден:', error);
    });

// Создание безопасной обертки
const safeEthereum = createSafeEthereumWrapper(ethereum);
```

## Ошибка: Mixpanel "Cannot read properties of undefined (reading 'token')"

Эта ошибка возникает когда Mixpanel пытается получить доступ к неинициализированному объекту.

### Решение

В проекте реализованы следующие меры защиты:

1. **Правильная инициализация** - Mixpanel инициализируется только при наличии валидного токена
2. **Безопасная обработка ошибок** - Все функции Mixpanel обернуты в try-catch
3. **Проверка готовности** - Используется `isMixpanelReady()` перед вызовами

### Настройка Mixpanel

1. **Создайте .env файл** на основе env.example:

    ```bash
    cp env.example .env
    ```

2. **Установите токен Mixpanel** (опционально):

    ```env
    NEXT_PUBLIC_MIXPANEL_TOKEN=your_actual_mixpanel_token
    ```

3. **Или отключите Mixpanel** полностью:
    ```env
    NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token_here
    ```

### Использование Mixpanel

```typescript
import mixpanelClient from '@/lib/mixpanelClient';

// Проверка готовности
if (mixpanelClient.isMixpanelReady()) {
    mixpanelClient.trackEvent('Custom Event', { property: 'value' });
    mixpanelClient.identifyUser('user123', { name: 'John Doe' });
    mixpanelClient.setUserProperties({ plan: 'premium' });
}
```

## Ошибка: Network "Failed to fetch" и Extension "Attempt failed"

Эти ошибки возникают из-за проблем с сетевыми запросами и конфликтов с расширениями браузера.

### Решение

В проекте реализованы следующие меры защиты:

1. **NetworkErrorBoundary** - Компонент для обработки сетевых ошибок
2. **extension-error-handler.ts** - Утилиты для обработки ошибок расширений
3. **network-utils.ts** - Безопасные обертки для сетевых запросов
4. **Автоматическое подавление** - Ошибки расширений автоматически подавляются

### Типы ошибок

#### Avatar Fetch Errors

```
Failed to fetch at fetchAvatar
```

-   **Причина**: Проблемы с загрузкой аватаров из VET Domains
-   **Решение**: Автоматически обрабатывается, показывается fallback

#### VeWorld Extension Errors

```
[ERROR] (#Localhost) - "Attempt failed"
chrome-extension://ffondjhiilhjpmfakjbejdgbemolaaho/VeWorldAPI.js
```

-   **Причина**: Конфликты с расширением VeWorld при подключении кошелька
-   **Решение**: Полностью подавляются на всех уровнях (консоль, глобальные ошибки, promise rejections)
-   **Мониторинг**: VeWorldErrorMonitor отслеживает и обрабатывает все ошибки VeWorld

#### Network Connectivity Issues

```
TypeError: Failed to fetch
```

-   **Причина**: Проблемы с сетью или CORS
-   **Решение**: Автоматические повторы и fallback

### Использование утилит

```typescript
import { safeFetch, withNetworkErrorHandling } from '@/lib/network-utils';
import { withExtensionErrorHandling } from '@/lib/extension-error-handler';

// Безопасный fetch с повторами
const response = await safeFetch('https://api.example.com/data');

// Обработка сетевых ошибок
const result = await withNetworkErrorHandling(
    () => fetchData(),
    'Data Loading',
    { fallback: 'No data available' },
);

// Обработка ошибок расширений
const walletResult = await withExtensionErrorHandling(
    () => walletOperation(),
    'Wallet Transaction',
    null,
);
```

### Проверка подавления ошибок VeWorld

Если вы все еще видите ошибки VeWorld в консоли:

1. **Очистите консоль** и перезагрузите страницу
2. **Проверьте фильтры консоли** - убедитесь, что не включен фильтр "Hide network messages"
3. **Откройте DevTools** и проверьте вкладку Console - ошибки VeWorld должны показываться как предупреждения (желтый цвет) вместо ошибок (красный цвет)

### Мониторинг ошибок

Все ошибки VeWorld логируются с префиксом:
- `"Extension error caught (suppressed)"`
- `"VeWorld extension error caught"`
- `"Extension error in VeWorld Connection (this is usually harmless)"`

### Известные проблемы

-   Некоторые расширения кошельков могут блокировать доступ к ethereum свойству
-   Chrome DevTools может показывать предупреждения о read-only свойствах
-   Mixpanel требует валидный токен для работы, иначе события не отслеживаются
-   Ошибки расширений браузера нормальны и не влияют на функциональность
-   Сетевые ошибки автоматически обрабатываются с fallback
-   VeWorld ошибки полностью подавляются и не должны появляться в консоли
