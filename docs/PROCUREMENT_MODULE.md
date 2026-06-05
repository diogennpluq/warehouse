# Модуль закупок по 44-ФЗ

## Обзор

Модуль предназначен для автоматизации процесса закупок по Федеральному закону № 44-ФЗ. Система позволяет:

- Создавать закупки через пошаговый мастер (Wizard)
- Рассчитывать НМЦК по методу сопоставимых рыночных цен
- Генерировать пакет документов для ЕИС zakupki.gov.ru
- Учитывать контракты и приёмку товаров

## Архитектура

```
backend/
├── service/
│   └── procurement.go      # Логика расчета НМЦК и генерации Excel
├── handler/
│   └── procurement.go      # HTTP обработчики
└── templates/
    └── nmcc_template.xlsx  # Шаблон обоснования НМЦК

frontend/
└── src/components/Procurements/
    ├── ProcurementWizard.tsx
    └── steps/
        ├── Step1_Init.tsx
        ├── Step2_TechSpec.tsx
        ├── Step3_NMCC.tsx    ✅ Реализовано
        └── Step4_Settings.tsx
```

## База данных

### Таблицы

| Таблица | Описание |
|---------|----------|
| `fz44_procurements` | Закупки (статус, сроки, ответственный) |
| `fz44_items` | Объекты закупки (позиции, КТРУ, характеристики) |
| `fz44_nmck_quotes` | Коммерческие предложения для НМЦК |
| `fz44_contracts` | Реестр контрактов |

### Статусы закупки

- `draft` - Черновик
- `doc_generated` - Документы сгенерированы
- `on_zakupki` - На рассмотрении в ЕИС
- `contract_signed` - Контракт заключён
- `completed` - Закупка завершена

## API Endpoints

### POST /api/procurement/calculate-nmcc

Расчет НМЦК без генерации файла.

**Request:**
```json
{
  "prices": [1000, 1200, 1100],
  "quantity": 10
}
```

**Response:**
```json
{
  "result": {
    "average_price": 1100,
    "standard_deviation": 100,
    "coefficient_of_variation": 9.09,
    "is_valid": true,
    "total_nmcc": 11000
  },
  "is_valid": true,
  "message": "НМЦК рассчитана корректно"
}
```

### POST /api/procurement/generate-nmcc

Генерация Excel-файла "Обоснование НМЦК".

**Request:**
```json
{
  "items": [
    {
      "id": "item-1",
      "name": "Картридж лазерный",
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
      "prices_per_item": {
        "item-1": 1000
      }
    }
  ]
}
```

**Response:** Файл `Обоснование_НМЦК.xlsx`

## Математика НМЦК

Расчет производится по Приказу Минэкономразвития № 567:

1. **Средняя цена:** `avg = Σprices / count`
2. **Среднее квадратичное отклонение:** `σ = √(Σ(price - avg)² / (n-1))`
3. **Коэффициент вариации:** `V = (σ / avg) × 100%`
4. **Проверка:** `V ≤ 33%` (цены однородны)
5. **Итоговая НМЦК:** `NMCC = avg × quantity`

## Интеграция с фронтендом

### React компонент

```tsx
import { Step3_NMCC } from './components/Procurements/steps/Step3_NMCC';

<Step3_NMCC
  items={procurementItems}
  onNext={(data) => {
    console.log('НМЦК:', data.totalNMCC);
    console.log('КП:', data.offers);
  }}
  onBack={() => goToStep(2)}
/>
```

### Скачивание файла

```tsx
const downloadNMCC = async (nmccData) => {
  const response = await axios.post(
    '/api/procurement/generate-nmcc',
    nmccData,
    { responseType: 'blob' }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Обоснование_НМЦК.xlsx';
  link.click();
};
```

## Подготовка шаблонов

### Excel (НМЦК)

1. Создайте файл `nmcc_template.xlsx`
2. Разместите ячейки для заполнения:
   - D5, E5, F5 - названия поставщиков
   - Строка 8+ - таблица товаров
3. Сохраните в `backend/templates/`

### Word (документы закупки)

Используйте плейсхолдеры вида `{{VariableName}}`:

```
Заявка на закупку № {{ProcurementNumber}}
Наименование: {{ItemName}}
Количество: {{Quantity}} {{UOM}}
Обоснование: {{Justification}}
```

## Следующие шаги

1. ✅ Создать структуру БД
2. ✅ Реализовать сервис расчета НМЦК
3. ✅ Создать API для генерации Excel
4. ✅ Реализовать React компонент Step3_NMCC
5. ⏳ Реализовать Step1_Init, Step2_TechSpec, Step4_Settings
6. ⏳ Создать шаблоны Word документов
7. ⏳ Реализовать генерацию ZIP-архива
8. ⏳ Добавить постаукционный учет (контракты, приёмка)
