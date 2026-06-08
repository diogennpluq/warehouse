package main

import (
	"fmt"
	"log"
	"path/filepath"

	"github.com/techcontrol/backend/service"
)

// Этот скрипт создает шаблоны с плейсхолдерами из оригинальных документов

func main() {
	dg := service.NewDocumentGenerator()
	templatesDir := "templates"

	// 1. Заявка
	err := dg.CreateTemplateFromOriginal(
		filepath.Join(templatesDir, "Заявка (расходный материал для ПУ).docx"),
		filepath.Join(templatesDir, "application_template.docx"),
		map[string]string{
			"расходный материал для ПУ":                      "{{ProcurementTitle}}",
			"Расходный материал для принтеров":               "{{ProcurementTitle}}",
			"необходимость обеспечения текущей деятельности": "{{Justification}}",
			// Добавьте другие замены по мере необходимости
		},
	)
	if err != nil {
		log.Printf("Warning: Failed to create application template: %v", err)
	} else {
		fmt.Println("✓ Created application_template.docx")
	}

	// 2. Распоряжение
	err = dg.CreateTemplateFromOriginal(
		filepath.Join(templatesDir, "Распоряжение (расходный материал для ПУ).doc"),
		filepath.Join(templatesDir, "order_template.docx"),
		map[string]string{
			"расходный материал для ПУ": "{{ProcurementTitle}}",
			// Добавьте замены для членов комиссии
		},
	)
	if err != nil {
		log.Printf("Warning: Failed to create order template: %v (может быть формат .doc)", err)
	} else {
		fmt.Println("✓ Created order_template.docx")
	}

	// 3. Техническое задание
	err = dg.CreateTemplateFromOriginal(
		filepath.Join(templatesDir, "Приложение № 1. Описание объекта закупки (расходный материал для ПУ).docx"),
		filepath.Join(templatesDir, "tech_spec_template.docx"),
		map[string]string{
			"расходный материал для ПУ":        "{{ProcurementTitle}}",
			"Расходный материал для принтеров": "{{ItemName}}",
			"упаковка":                         "{{UOM}}",
			"10":                               "{{Quantity}}",
			"12":                               "{{WarrantyMonths}}",
		},
	)
	if err != nil {
		log.Printf("Warning: Failed to create tech spec template: %v", err)
	} else {
		fmt.Println("✓ Created tech_spec_template.docx")
	}

	// 4. Информация к извещению
	err = dg.CreateTemplateFromOriginal(
		filepath.Join(templatesDir, "Информация к извещению (расходный материал для ПУ).docx"),
		filepath.Join(templatesDir, "notice_info_template.docx"),
		map[string]string{
			"расходный материал для ПУ":        "{{ProcurementTitle}}",
			"Расходный материал для принтеров": "{{ItemName}}",
			"Электронный аукцион":              "{{ProcedureType}}",
		},
	)
	if err != nil {
		log.Printf("Warning: Failed to create notice info template: %v", err)
	} else {
		fmt.Println("✓ Created notice_info_template.docx")
	}

	// 5. Требования к заявке
	err = dg.CreateTemplateFromOriginal(
		filepath.Join(templatesDir, "Приложение № 3. Требования к содержанию, составу заявки на участие в закупке в соответствии с Федеральным законом 44-ФЗ и инструкция по е.docx"),
		filepath.Join(templatesDir, "bid_requirements_template.docx"),
		map[string]string{
			"расходный материал для ПУ": "{{ProcurementTitle}}",
		},
	)
	if err != nil {
		log.Printf("Warning: Failed to create bid requirements template: %v", err)
	} else {
		fmt.Println("✓ Created bid_requirements_template.docx")
	}

	// 6. Проект контракта
	err = dg.CreateTemplateFromOriginal(
		filepath.Join(templatesDir, "Приложение № 4. Проект контракта(расходный материал для ПУ).docx"),
		filepath.Join(templatesDir, "contract_draft_template.docx"),
		map[string]string{
			"расходный материал для ПУ":        "{{ProcurementTitle}}",
			"Расходный материал для принтеров": "{{ItemName}}",
		},
	)
	if err != nil {
		log.Printf("Warning: Failed to create contract draft template: %v", err)
	} else {
		fmt.Println("✓ Created contract_draft_template.docx")
	}

	fmt.Println("\n=== Готово ===")
	fmt.Println("Шаблоны созданы в папке templates/")
	fmt.Println("\nПримечание: Некоторые шаблоны могут требовать ручной доработки.")
	fmt.Println("Откройте каждый *_template.docx в Word и проверьте плейсхолдеры.")
}
