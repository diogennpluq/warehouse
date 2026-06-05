# Складской ТехКонтроль - Makefile

.PHONY: help build test run clean docker-up docker-down docker-build

# Переменные
COMPOSE_FILE=docker-compose.yml
PROJECT_NAME=techcontrol

help: ## Показать эту справку
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

## ====================
## Локальная разработка
## ====================

run-backend: ## Запустить бэкенд локально
	cd backend && go run main.go

run-frontend: ## Запустить фронтенд локально
	cd frontend && npm start

install-backend: ## Установить зависимости бэкенда
	cd backend && go mod download

install-frontend: ## Установить зависимости фронтенда
	cd frontend && npm install

## ====================
## Тестирование
## ====================

test: test-backend test-frontend ## Запустить все тесты

test-backend: ## Запустить тесты бэкенда
	cd backend && go test -v -race -coverprofile=coverage.txt ./...

test-frontend: ## Запустить тесты фронтенда
	cd frontend && CI=true npm test -- --watchAll=false --coverage

lint-backend: ## Запустить линтер бэкенда
	cd backend && go fmt ./... && go vet ./...

lint-frontend: ## Запустить линтер фронтенда
	cd frontend && npm run build -- --noEmit

## ====================
## Сборка
## ====================

build: build-backend build-frontend ## Собрать все компоненты

build-backend: ## Собрать бэкенд
	cd backend && CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

build-frontend: ## Собрать фронтенд
	cd frontend && npm run build

clean: ## Очистить артефакты сборки
	rm -rf backend/main frontend/build

## ====================
## Docker
## ====================

docker-up: ## Запустить Docker Compose
	docker compose -f $(COMPOSE_FILE) up -d

docker-down: ## Остановить Docker Compose
	docker compose -f $(COMPOSE_FILE) down

docker-logs: ## Показать логи Docker
	docker compose -f $(COMPOSE_FILE) logs -f

docker-build: ## Собрать Docker образы
	docker compose -f $(COMPOSE_FILE) build --no-cache

docker-restart: ## Перезапустить Docker Compose
	docker compose -f $(COMPOSE_FILE) restart

docker-clean: ## Очистить Docker ресурсы
	docker compose -f $(COMPOSE_FILE) down -v
	docker system prune -f

## ====================
## Database
## ====================

db-migrate: ## Запустить миграции БД
	docker compose -f $(COMPOSE_FILE) exec db psql -U techcontrol -d techcontrol_db -f /docker-entrypoint-initdb.d/01_init_db.sql

db-backup: ## Создать бэкап БД
	docker compose -f $(COMPOSE_FILE) exec db pg_dump -U techcontrol techcontrol_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

db-restore: ## Восстановить БД из бэкапа
	@echo "Укажите имя файла бэкапа: make db-restore FILE=backup.sql"
	docker compose -f $(COMPOSE_FILE) exec -T db psql -U techcontrol techcontrol_db < $(FILE)

## ====================
## CI/CD
## ====================

ci-local: ## Запустить CI локально (тесты + сборка)
	make test
	make build
	make docker-build

deploy: ## Деплой на production (требует настройки)
	@echo "Настройте деплой в .github/workflows/ci.yml"
