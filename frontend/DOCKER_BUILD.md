# Frontend Docker Build Guide

## Быстрая сборка

### Через npm скрипты
```bash
cd frontend
npm run docker:build
npm run docker:run
```

### Через Docker напрямую
```bash
cd frontend
docker build -t techcontrol-frontend:latest .
docker run -p 80:80 techcontrol-frontend:latest
```

### Через Makefile
```bash
make docker-build-frontend
```

## Тестирование образа

```bash
# Запуск контейнера
docker run -d -p 8081:80 --name techcontrol-frontend-test techcontrol-frontend:latest

# Проверка health endpoint
curl http://localhost:8081/health

# Просмотр логов
docker logs techcontrol-frontend-test

# Остановка
docker stop techcontrol-frontend-test
docker rm techcontrol-frontend-test
```

## Переменные окружения

При сборке можно указать API URL:

```bash
docker build --build-arg REACT_APP_API_URL=https://api.example.com -t techcontrol-frontend:latest .
```

## Multi-stage сборка

Dockerfile использует multi-stage для оптимизации:

1. **Stage 1 (builder)**: Node.js 18-alpine для сборки
2. **Stage 2 (nginx)**: Nginx alpine для раздачи статики

Итоговый размер образа: ~25MB

## CI/CD

GitHub Actions автоматически собирает образ при push в main/develop:

```yaml
docker/build-push-action@v5
  context: ./frontend
  push: true
  tags: ghcr.io/org/techcontrol/frontend:latest
```

## Отладка

```bash
# Войти в контейнер
docker run -it techcontrol-frontend:latest sh

# Проверить файлы
ls /usr/share/nginx/html/

# Проверить конфигурацию nginx
cat /etc/nginx/conf.d/default.conf
```
