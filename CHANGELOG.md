# Changelog

Все заметные изменения в проекте будут документироваться в этом файле.


### Добавлено
- Initial release системы "Складской ТехКонтроль"
- Бэкенд на Go (Echo + pgx + JWT)
- Фронтенд на React + TypeScript
- Docker контейнеризация
- CI/CD пайплайн на GitHub Actions
- PostgreSQL база данных
- Автоматическая генерация задач на закупку
- Прогнозирование замены оборудования

### Исправлено в CI/CD
- Обновлены версии GitHub Actions до последних стабильных (v4, v5)
- Добавлен кэш Go modules с правильной конфигурацией
- Добавлен кэш npm с dependency path
- Исправлена сборка Docker образов с multi-stage
- Добавлены health checks для всех сервисов
- Добавлена сеть для изоляции контейнеров
- Добавлена конфигурация nginx для фронтенда
- Исправлены пути кэширования в GitHub Actions
- Добавлены артефакты для coverage и build
- Добавлена поддержка GitHub Container Registry
- Исправлены условия запуска деплоя

### Технологии
- **Бэкенд:** Go 1.21, Echo v4, pgx v5, JWT, Viper
- **Фронтенд:** React 18, TypeScript 5, Axios, React Router v6
- **БД:** PostgreSQL 15
- **Инфраструктура:** Docker, Docker Compose, GitHub Actions, nginx
