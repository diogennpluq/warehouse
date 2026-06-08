# Использование генератора документов

## Обзор

Система генерации документов 44-ФЗ полностью реализована и готова к использованию.

## Статус реализации

| Документ | Статус | Шаблон |
|----------|--------|--------|
| Заявка | ✅ Реализовано | `application_template.docx` |
| Распоряжение | ⚠️ Требуется .docx | Нужна конвертация из .doc |
| Техническое задание | ✅ Реализовано | `tech_spec_template.docx` |
| Обоснование НМЦК (Excel) | ✅ Реализовано | `nmcc_template.xlsx` |
| Информация к извещению | ✅ Реализовано | `notice_info_template.docx` |
| Требования к заявке | ✅ Реализовано | `bid_requirements_template.docx` |
| Проект контракта | ✅ Реализовано | `contract_draft_template.docx` |

## Пример использования

### 1. Через API (рекомендуется)

```bash
curl -X POST http://localhost:8080/api/procurements/generate-full-package \
  -H "Content-Type: application/json" \
  -d @example_request.json
```

### 2. Через код Go

```go
package main

import (
    "github.com/techcontrol/backend/service"
)

func main() {
    // Подготовка данных закупки
    req := &service.GenerateFullPackageRequest{
        Procurement: service.ProcurementData{
            Init: service.InitData{
                Title:             "Закупка офисной мебели",
                Justification:     "Необходимость оснащения нового офиса",
                ResponsibleUserID: "Иванов И.И.",
                CommissionMembers: []string{"Петров П.П.", "Сидоров С.С.", "Васильев В.В."},
                DeliveryAddress:   "г. Москва, ул. Ленина, д. 1",
                DeliveryTerms:     "В течение 30 календарных дней",
            },
            TechSpec: service.TechSpecData{
                Items: []service.ItemData{
                    {
                        ID:        "item1",
                        Name:      "Стол письменный",
                        KTRUCode:  "36.11.12.000-00000001",
                        OKPD2Code: "31.01.11.110",
                        UOM:       "шт",
                        Quantity:  10,
                        Characteristics: []service.Characteristic{
                            {Name: "Материал", Value: "ЛДСП", IsMandatory: true},
                            {Name: "Размер", Value: "120x60x75 см", IsMandatory: true},
                            {Name: "Цвет", Value: "венге", IsMandatory: false},
                        },
                    },
                },
                WarrantyMonths: 12,
            },
            NMCC: service.NMCCData{
                CommercialOffers: []service.CommercialOffer{
                    {
                        ID:           "offer1",
                        ProviderName: "ООО Мебель Плюс",
                        ProviderINN:  "7701234567",
                        Date:         "01.06.2026",
                        PricesPerItem: map[string]float64{
                            "item1": 15000.00,
                        },
                    },
                    {
                        ID:           "offer2",
                        ProviderName: "ИП Петров",
                        ProviderINN:  "770987654321",
                        Date:         "02.06.2026",
                        PricesPerItem: map[string]float64{
                            "item1": 16000.00,
                        },
                    },
                    {
                        ID:           "offer3",
                        ProviderName: "ООО Офис Комфорт",
                        ProviderINN:  "7705555555",
                        Date:         "03.06.2026",
                        PricesPerItem: map[string]float64{
                            "item1": 15500.00,
                        },
                    },
                },
            },
            Settings: service.SettingsData{
                ProcedureType: "Электронный аукцион",
                IsSmpSonko:    true,
                ApplicationSecurity: service.SecurityConfig{
                    IsRequired: true,
                    Percentage: 5.0,
                },
                ContractSecurity: service.SecurityConfig{
                    IsRequired: true,
                    Percentage: 10.0,
                },
                AdvancePaymentPercentage: 30,
            },
        },
        NMCCRequest: service.GenerateNMCCRequest{
            Items: []service.NMCCItem{
                {
                    ID:       "item1",
                    Name:     "Стол письменный",
                    Quantity: 10,
                    UOM:      "шт",
                    AvgPrice: 15500.00,
                    Total:    155000.00,
                },
            },
            Offers: []service.Offer{
                {
                    ProviderName: "ООО Мебель Плюс",
                    ProviderINN:  "7701234567",
                    Date:         "01.06.2026",
                    PricesPerItem: map[string]float64{
                        "item1": 15000.00,
                    },
                },
                {
                    ProviderName: "ИП Петров",
                    ProviderINN:  "770987654321",
                    Date:         "02.06.2026",
                    PricesPerItem: map[string]float64{
                        "item1": 16000.00,
                    },
                },
                {
                    ProviderName: "ООО Офис Комфорт",
                    ProviderINN:  "7705555555",
                    Date:         "03.06.2026",
                    PricesPerItem: map[string]float64{
                        "item1": 15500.00,
                    },
                },
            },
        },
    }

    // Генерация отдельных документов
    application, err := service.GenerateApplicationDoc(req)
    if err != nil {
        panic(err)
    }
    // Сохранить application в файл...

    techSpec, err := service.GenerateTechSpecDoc(req)
    if err != nil {
        panic(err)
    }
    // Сохранить techSpec в файл...
}
```

## Доступные плейсхолдеры

Все шаблоны поддерживают следующие плейсхолдеры:

### Общие
- `{{ProcurementTitle}}` - Название закупки
- `{{CurrentDate}}` - Текущая дата (ДД.ММ.ГГГГ)
- `{{ResponsibleName}}` - ФИО ответственного
- `{{DeliveryAddress}}` - Адрес доставки
- `{{DeliveryTerms}}` - Условия доставки

### Объекты закупки
- `{{ItemName}}` - Наименование первого товара
- `{{KTRUCode}}` - Код КТРУ
- `{{OKPD2Code}}` - Код ОКПД2
- `{{Quantity}}` - Количество
- `{{UOM}}` - Единица измерения
- `{{ItemsTable}}` - Полная таблица всех объектов закупки
- `{{WarrantyMonths}}` - Гарантийный срок (месяцы)

### НМЦК и финансы
- `{{NMCC}}` - Начальная максимальная цена контракта
- `{{ApplicationSecurityRequired}}` - Требуется ли обеспечение заявки (Да/Нет)
- `{{ApplicationSecurityPercent}}` - Процент обеспечения заявки
- `{{ApplicationSecurityAmount}}` - Сумма обеспечения заявки
- `{{ContractSecurityRequired}}` - Требуется ли обеспечение контракта (Да/Нет)
- `{{ContractSecurityPercent}}` - Процент обеспечения контракта
- `{{ContractSecurityAmount}}` - Сумма обеспечения контракта
- `{{AdvancePaymentPercent}}` - Процент авансового платежа
- `{{Specification}}` - Детальная спецификация с ценами

### Процедура закупки
- `{{ProcedureType}}` - Тип процедуры (Электронный аукцион / Запрос котировок)
- `{{IsSmpSonko}}` - Преимущества для СМП/СОНКО (Да/Нет)
- `{{CommissionMembers}}` - Список членов комиссии

## Заметки для разработчиков

1. **Формат .doc**: Файл `Распоряжение (расходный материал для ПУ).doc` требует ручной конвертации в .docx через Microsoft Word
2. **Таблицы**: Для сложных таблиц с переменным числом строк используется текстовое представление
3. **Обновление шаблонов**: После изменения оригинальных документов запустите `go run cmd/prepare_templates/main.go`

## Следующие шаги

- [ ] Конвертировать Распоряжение из .doc в .docx
- [ ] Добавить более сложную генерацию таблиц в Word
- [ ] Реализовать генерацию штрих-кодов для ИКЗ
- [ ] Добавить водяные знаки на документы

Дата последнего обновления: 2026-06-08
