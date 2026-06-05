# Быстрый старт - Генерация шаблона НМЦК

## 🚀 Вариант 1: Python (самый простой)

```bash
# 1. Установите Python (если нет)
# https://www.python.org/downloads/

# 2. Установите библиотеку
pip install openpyxl

# 3. Сгенерируйте шаблон
cd backend/templates
python generate_nmcc_template.py

# ✅ Готово! Файл nmcc_template.xlsx создан
```

## 🚀 Вариант 2: Go

```bash
# 1. Перейдите в папку шаблонов
cd backend/templates

# 2. Запустите генератор
go run generate_template.go

# ✅ Готово! Файл nmcc_template.xlsx создан
```

## 🚀 Вариант 3: Make (если используете Makefile)

```bash
# Из корня проекта
make generate-nmcc-template-py
# или
make generate-nmcc-template-go
```

## 📋 Проверка

Откройте созданный файл `nmcc_template.xlsx` и убедитесь:

- [ ] Видна шапка "ОБОСНОВАНИЕ НАЧАЛЬНОЙ (МАКСИМАЛЬНОЙ) ЦЕНЫ КОНТРАКТА"
- [ ] Есть таблица с колонками: № п/п, Наименование, Ед. изм., Предложение 1-3, Средняя цена, Количество, Итого
- [ ] Ячейки со средней ценой содержат формулу `=AVERAGE(...)`
- [ ] Ячейка "ИТОГО" содержит формулу `=SUM(...)`
- [ ] Есть блок "Расчет коэффициента вариации" с формулами

## 🔧 Если что-то не так

### Ошибка "openpyxl not found"
```bash
pip install openpyxl
```

### Ошибка "go: cannot find main module"
```bash
cd backend
go mod tidy
cd templates
go run generate_template.go
```

### Файл не открывается в Excel
- Убедитесь, что файл сохранился с расширением `.xlsx`
- Попробуйте открыть в LibreOffice Calc или Google Sheets

## 📝 Следующие шаги

1. Откройте `nmcc_template.xlsx` в Excel
2. Проверьте формулы
3. При необходимости настройте форматирование
4. Сохраните файл
5. Бэкенд готов использовать шаблон для генерации документов!

---

**Документация:** См. `README.md` для подробной информации о плейсхолдерах и интеграции.
