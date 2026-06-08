# Модуль закупок по 44-ФЗ

## 📋 Обзор

Модуль для автоматизации создания и сопровождения закупок по Федеральному закону № 44-ФЗ. Включает в себя:

- ✅ Пошаговый мастер создания закупки (Wizard)
- ✅ Расчет НМЦК по методу сопоставимых рыночных цен (Приказ Минэкономразвития № 567)
- ✅ Генерация пакета документов (7 файлов в ZIP)
- ✅ Валидация коэффициента вариации (V ≤ 33%)
- ✅ UTF-8 кодировка во всех генерируемых файлах
- ✅ Транслитерация имен файлов

---

## 🎯 Статус реализации

| Компонент | Статус | Примечание |
|-----------|--------|------------|
| База данных | ✅ Готово | 4 таблицы с индексами |
| Frontend Wizard | ✅ Готово | 4 шага + валидация |
| API endpoints | ✅ Готово | 3 endpoint'а |
| Генерация Excel | ✅ Готово | excelize/v2 |
| Генерация Word | ✅ Готово | XML с UTF-8 |
| ZIP-архив | ✅ Готово | archive/zip |
| Интеграция в UI | ✅ Готово | Страница /procurements |

---

## 🏗 Архитектура

### Frontend (React/TypeScript)

```
frontend/src/components/Procurements/
├── ProcurementWizard.tsx      # Главный контейнер
├── steps/
│   ├── Step1_Init.tsx         # Инициация закупки
│   ├── Step2_TechSpec.tsx     # Техническое задание
│   ├── Step3_NMCC.tsx         # Расчет НМЦК
│   └── Step4_Settings.tsx     # Настройки процедуры
└── utils/
    └── nmccCalculator.ts      # Математика 44-ФЗ
```

### Backend (Go)

```
backend/
├── handler/
│   └── procurement.go         # HTTP обработчики
├── service/
│   └── procurement.go         # Бизнес-логика и генерация документов
└── templates/
    └── nmcc_template.xlsx     # Шаблон обоснования НМЦК
```

### Database (PostgreSQL)

```sql
fz44_procurements       -- Основная таблица закупок
fz44_items              -- Объекты закупки
fz44_nmck_quotes        -- Коммерческие предложения
fz44_contracts          -- Контракты
```

## 🔧 API Endpoints

### 1. Расчет НМЦК
```http
POST /api/procurement/calculate-nmcc
Content-Type: application/json

{
  "prices": [1000, 1100, 1050],
  "quantity": 10
}

Response:
{
  "result": {
    "average_price": 1050,
    "standard_deviation": 50,
    "coefficient_of_variation": 4.76,
    "is_valid": true,
    "total_nmcc": 10500
  },
  "is_valid": true,
  "message": "НМЦК рассчитана корректно"
}
```

### 2. Генерация НМЦК (Excel)
```http
POST /api/procurement/generate-nmcc
Content-Type: application/json

{
  "items": [
    {
      "id": "item-1",
      "name": "Картридж",
      "quantity": 10,
      "uom": "шт",
      "avg_price": 1050,
      "total": 10500
    }
  ],
  "offers": [
    {
      "provider_name": "ООО Ромашка",
      "provider_inn": "7701234567",
      "date": "2024-01-15",
      "prices_per_item": {
        "item-1": 1000
      }
    }
    // ... еще 2 предложения
  ]
}

Response: File (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
```

### 3. Генерация полного пакета документов (ZIP)
```http
POST /api/procurement/generate-full-package
Content-Type: application/json

{
  "procurement": {
    "init": { ... },
    "tech_spec": { ... },
    "nmcc": { ... },
    "settings": { ... }
  },
  "nmcc_request": { ... }
}

Response: File (application/zip)
```

## 📊 Математика НМЦК

### Формула расчета

1. **Средняя цена**:
   ```
   P_avg = Σ(P_i) / n
   ```

2. **Среднее квадратичное отклонение**:
   ```
   σ = √(Σ(P_i - P_avg)² / (n-1))
   ```

3. **Коэффициент вариации**:
   ```
   V = (σ / P_avg) × 100%
   ```

4. **Проверка**: V ≤ 33% (иначе цены неоднородны)

5. **Итоговая НМЦК**:
   ```
   НМЦК = P_avg × Quantity
   ```

## 📁 Генерируемые документы

| № | Файл (в ZIP) | Описание | Формат |
|---|--------------|----------|--------|
| 1 | 01_Zayavka.docx | Заявка на закупку | Word XML UTF-8 |
| 2 | 02_Rasporyazhenie.docx | Распоряжение о проведении | Word XML UTF-8 |
| 3 | 03_Prilozhenie_1_TZ.docx | Техническое задание | Word XML UTF-8 |
| 4 | 04_Prilozhenie_2_NMCK.xlsx | Обоснование НМЦК | Excel (xlsx) |
| 5 | 05_Informaciya_k_izveshcheniyu.docx | Информация к извещению | Word XML UTF-8 |
| 6 | 06_Trebovaniya_k_zayavke.docx | Требования к участникам | Word XML UTF-8 |
| 7 | 07_Proekt_kontrakta.docx | Проект контракта | Word XML UTF-8 |

**Все файлы упаковываются в ZIP-архив с транслитерированным именем:**
```
Zakupka_Kartridzh_dlya_PU.zip
```

## 🚀 Быстрый старт

### 1. Применение миграции БД
```bash
docker compose -p techcontrol exec db psql -U techcontrol -d techcontrol_db -f /docker-entrypoint-initdb.d/02_procurements.sql
```

### 2. Установка зависимостей
```bash
# Backend
cd backend
go get github.com/xuri/excelize/v2
go get github.com/lukasjarosch/go-docx
go mod tidy

# Frontend
cd frontend
npm install
```

### 3. Запуск
```bash
# Backend
cd backend
go run main.go

# Frontend
cd frontend
npm start
```

### 4. Использование Wizard
1. Откройте http://localhost
2. В меню нажмите **44-ФЗ** (оранжевая ссылка)
3. Нажмите "📋 Создать закупку"
4. Заполните 4 шага мастера
5. Скачайте ZIP-архив с документами

## ⚠️ Важные замечания

1. **Минимум 3 КП** — по 44-ФЗ требуется не менее 3 коммерческих предложений
2. **V ≤ 33%** — если коэффициент вариации больше, нужны новые КП
3. **UTF-8 кодировка** — все документы генерируются с правильной кодировкой
4. **Транслитерация** — имена файлов транслитерируются для совместимости
5. **Аутентификация** — все endpoints требуют JWT токен

---

## 🔧 Исправление проблем с кодировкой

Если видите "кракозябры" вместо русского текста:

1. Проверьте заголовки Content-Type в handler
2. Убедитесь, что XML содержит `encoding="UTF-8"`
3. Используйте `filename*=UTF-8''` в Content-Disposition

---

## 📝 Следующие шаги

- [ ] Шаблоны Word (.docx) с реальными стилями
- [ ] Сохранение закупок в БД (CRUD)
- [ ] Статусы закупок (draft, on_zakupki, completed)
- [ ] Реестр контрактов
- [ ] Приёмка на склад после закупки
- [ ] Интеграция с ЕИС (zakupki.gov.ru)

## 🔗 Документы

- [44-ФЗ (текст закона)](https://www.consultant.ru/document/cons_doc_LAW_144624/)
- [Приказ № 567 (методика НМЦК)](https://www.garant.ru/products/ipo/prime/doc/71319620/)
- [ЕИС Закупки](https://zakupki.gov.ru)
