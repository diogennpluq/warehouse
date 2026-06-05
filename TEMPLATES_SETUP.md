# Настройка шаблонов документов для 44-ФЗ

## 📦 Что было создано

| Файл | Назначение | Статус |
|------|------------|--------|
| `db/init/02_procurements.sql` | Миграция БД для закупок | ✅ Готово |
| `backend/service/procurement.go` | Сервис расчета НМЦК | ✅ Готово |
| `backend/handler/procurement.go` | API для генерации Excel | ✅ Готово |
| `backend/templates/generate_nmcc_template.py` | Скрипт генерации (Python) | ✅ Готово |
| `backend/templates/generate_template.go` | Скрипт генерации (Go) | ✅ Готово |
| `frontend/src/components/Procurements/steps/Step3_NMCC.tsx` | React компонент НМЦК | ✅ Готово |
| `docs/PROCUREMENT_MODULE.md` | Документация модуля | ✅ Готово |

## 🚀 Быстрый старт

### 1. Генерация шаблона НМЦК

```bash
# Вариант A: Python (рекомендуется)
pip install openpyxl
make generate-nmcc-template-py

# Вариант B: Go
make generate-nmcc-template-go

# Вариант C: Вручную
# Откройте Excel и создайте шаблон по инструкции в backend/templates/README.md
```

### 2. Применение миграции БД

```bash
# Docker
docker compose up -d db
make db-migrate-procurements

# Или напрямую
docker compose exec db psql -U techcontrol -d techcontrol_db -f /docker-entrypoint-initdb.d/02_procurements.sql
```

### 3. Запуск бэкенда

```bash
cd backend
go mod tidy
go run main.go
```

### 4. Тестирование API

```bash
# Расчет НМЦК
curl -X POST http://localhost:8080/api/procurement/calculate-nmcc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prices": [1000, 1200, 1100],
    "quantity": 10
  }'

# Генерация Excel
curl -X POST http://localhost:8080/api/procurement/generate-nmcc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "id": "item-1",
        "name": "Картридж",
        "quantity": 10,
        "uom": "шт",
        "avg_price": 1100,
        "total": 11000
      }
    ],
    "offers": [
      {
        "provider_name": "ООО Ромашка",
        "provider_inn": "7701234567",
        "date": "2024-01-15",
        "prices_per_item": {"item-1": 1000}
      }
    ]
  }' \
  --output Обоснование_НМЦК.xlsx
```

## 📁 Структура проекта

```
techcontrol/
├── backend/
│   ├── service/
│   │   └── procurement.go          # ✅ Расчет НМЦК + генерация Excel
│   ├── handler/
│   │   └── procurement.go          # ✅ API endpoints
│   ├── templates/
│   │   ├── README.md               # 📖 Инструкция
│   │   ├── QUICKSTART.md           # 🚀 Быстрый старт
│   │   ├── generate_nmcc_template.py  # 🐍 Python скрипт
│   │   └── generate_template.go       # 🔧 Go скрипт
│   └── main.go                     # ✅ Обновлён (роуты)
├── frontend/
│   └── src/components/Procurements/
│       └── steps/
│           └── Step3_NMCC.tsx      # ✅ React компонент
├── db/
│   └── init/
│       └── 02_procurements.sql     # ✅ Миграция БД
├── docs/
│   └── PROCUREMENT_MODULE.md       # 📚 Полная документация
├── Makefile                        # ✅ Обновлён (команды)
└── TEMPLATES_SETUP.md              # 📄 Этот файл
```

## 📊 API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/procurement/calculate-nmcc` | Расчет НМЦК (JSON) |
| POST | `/api/procurement/generate-nmcc` | Генерация Excel файла |

## 🧮 Формула расчета НМЦК

```
1. Средняя цена: avg = Σprices / count
2. СКО: σ = √(Σ(price - avg)² / (n-1))
3. Коэф. вариации: V = (σ / avg) × 100%
4. Проверка: V ≤ 33%
5. Итог: NMCC = avg × quantity
```

## ✅ Чеклист готовности

- [ ] Сгенерирован шаблон `nmcc_template.xlsx`
- [ ] Применена миграция БД `02_procurements.sql`
- [ ] Зависимости установлены (`go mod tidy`)
- [ ] Бэкенд запускается без ошибок
- [ ] API отвечает на запросы
- [ ] Фронтенд компонент отображается

## 📚 Документация

- **Модуль закупок:** `docs/PROCUREMENT_MODULE.md`
- **Шаблоны:** `backend/templates/README.md`
- **Быстрый старт:** `backend/templates/QUICKSTART.md`

## 🔜 Следующие шаги

1. ⏳ Реализовать `Step1_Init.tsx` (Инициация закупки)
2. ⏳ Реализовать `Step2_TechSpec.tsx` (Техническое задание)
3. ⏳ Реализовать `Step4_Settings.tsx` (Настройки процедуры)
4. ⏳ Создать `ProcurementWizard.tsx` (Контейнер)
5. ⏳ Реализовать генерацию Word-документов
6. ⏳ Добавить постаукционный учет

---

**Вопросы?** См. документацию в `docs/` или откройте issue на GitHub.
