# Складской ТехКонтроль

Система для сотрудников склада и технических служб с целью:
- Централизованного ведения реестра складской техники
- Учета ремонтных работ и связанных затрат
- Автоматического формирования списка задач на закупку запчастей и нового оборудования
- Прогнозирования необходимости замены единиц техники на основе исторических данных и критериев износа

**Ключевой результат:** снижение простоев оборудования, обоснованное планирование бюджета замен.

## Технологический стек

### Бэкенд
- **Язык:** Golang 1.21+
- **Веб-фреймворк:** Echo v4
- **Работа с БД:** pgx v5
- **Аутентификация:** JWT (golang-jwt)
- **Логирование:** zerolog
- **Конфигурация:** Viper
- **База данных:** PostgreSQL 15

### Фронтенд
- **Фреймворк:** React 18
- **Язык:** TypeScript 5
- **HTTP клиент:** Axios
- **Роутинг:** React Router v6

### Инфраструктура
- **Контейнеризация:** Docker + Docker Compose
- **CI/CD:** GitHub Actions

## Структура проекта

```
techcontrol/
├── backend/                  # Бэкенд на Go
│   ├── config/              # Конфигурация
│   ├── handler/             # HTTP обработчики
│   ├── middleware/          # Middleware (JWT)
│   ├── repository/          # Работа с БД
│   ├── service/             # Бизнес-логика
│   ├── main.go              # Точка входа
│   └── Dockerfile
├── frontend/                # Фронтенд на React
│   ├── public/
│   ├── src/
│   │   ├── api/            # API клиент
│   │   ├── pages/          # Страницы приложения
│   │   ├── App.tsx         # root компонент
│   │   └── index.tsx       # Entry point
│   └── Dockerfile
├── db/init/                 # SQL скрипты инициализации
├── .github/workflows/       # CI/CD пайплайны
├── docker-compose.yml       # Оркестрация контейнеров
└── README.md
```

## Быстрый старт

### Требования
- Docker 20.10+
- Docker Compose 2.0+
- Go 1.21+ (для локальной разработки)
- Node.js 18+ (для локальной разработки)

### Запуск через Docker Compose

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

Приложения будут доступны по адресам:
- Фронтенд: http://localhost:3000
- Бэкенд API: http://localhost:8080
- PostgreSQL: localhost:5432

### Локальная разработка

#### Бэкенд

```bash
cd backend

# Установка зависимостей
go mod download

# Запуск с конфигурацией из .env
go run main.go
```

#### Фронтенд

```bash
cd frontend

# Установка зависимостей
npm install

# Запуск dev сервера
npm start
```

### Тестирование

```bash
# Бэкенд
cd backend
go test -v ./...

# Фронтенд
cd frontend
npm test
```

## API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход
- `POST /api/auth/register` - Регистрация

### Оборудование
- `GET /api/equipment` - Получить все оборудование
- `GET /api/equipment/:id` - Получить оборудование по ID
- `POST /api/equipment` - Создать оборудование
- `PUT /api/equipment/:id` - Обновить оборудование
- `DELETE /api/equipment/:id` - Удалить оборудование
- `GET /api/equipment/predict` - Прогноз замены

### Ремонты
- `GET /api/repairs` - Получить все ремонты
- `GET /api/repairs/:id` - Получить ремонт по ID
- `POST /api/repairs` - Создать ремонт
- `PUT /api/repairs/:id` - Обновить ремонт

### Закупки
- `GET /api/purchase/tasks` - Получить задачи на закупку
- `POST /api/purchase/tasks` - Создать задачу
- `PUT /api/purchase/tasks/:id` - Обновить задачу
- `POST /api/purchase/tasks/generate` - Автогенерация задач
- `GET /api/purchase/stats` - Получить статистику

## База данных

Схема БД создаётся автоматически при первом запуске через скрипты в `db/init/`.

Основные таблицы:
- `users` - Пользователи системы
- `equipment` - Складская техника
- `repairs` - Учёт ремонтов
- `parts` - Запчасти
- `parts_inventory` - Склад запчастей
- `repair_parts` - Использование запчастей в ремонтах
- `purchase_tasks` - Задачи на закупку
- `wear_logs` - История износа

## Конфигурация

### Переменные окружения для бэкенда

```env
PORT=8080
DATABASE_URL=postgres://techcontrol:techcontrol_pass@localhost:5432/techcontrol_db?sslmode=disable
JWT_SECRET=your-secret-key-change-in-production
```

### Переменные окружения для фронтенда

```env
REACT_APP_API_URL=http://localhost:8080/api
```

## CI/CD

Проект использует GitHub Actions для:
- Автоматического тестирования при пуше/PR
- Сборки Docker образов
- Проверки качества кода

Пайплайны определены в `.github/workflows/ci.yml`.

## Лицензия

Proprietary - Складской ТехКонтроль
