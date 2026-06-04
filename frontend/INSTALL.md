# Установка фронтенда

## Требования
- Node.js 18+
- npm 9+

## Установка зависимостей

```bash
# Удалите старые зависимости (если есть)
rm -rf node_modules package-lock.json

# Установите зависимости
npm install
```

## Запуск

```bash
# Режим разработки
npm start

# Сборка для production
npm run build

# Запуск тестов
npm test
```

## Переменные окружения

Создайте файл `.env` в корне frontend:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

## Решение проблем

### Ошибка "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Ошибка TypeScript "Cannot find name 'process'"

Убедитесь, что установлены @types/node:

```bash
npm install --save-dev @types/node
```

### Ошибка "Cannot find module '*.css'"

Проверьте наличие файла `react-app-env.d.ts` с объявлениями типов для CSS.
