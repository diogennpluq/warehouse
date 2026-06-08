package service

import (
	"bytes"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/lukasjarosch/go-docx"
)

// DocumentGenerator - сервис для генерации документов Word
type DocumentGenerator struct{}

// NewDocumentGenerator создает новый генератор документов
func NewDocumentGenerator() *DocumentGenerator {
	return &DocumentGenerator{}
}

// ReplaceWordPlaceholders заменяет плейсхолдеры в Word-документе
func (dg *DocumentGenerator) ReplaceWordPlaceholders(templatePath string, data map[string]interface{}) ([]byte, error) {
	// Читаем шаблон
	doc, err := docx.Open(templatePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read template %s: %w", templatePath, err)
	}

	// Конвертируем data в PlaceholderMap
	placeholders := make(docx.PlaceholderMap)
	for key, value := range data {
		placeholders[key] = fmt.Sprint(value)
	}

	// Заменяем все плейсхолдеры
	if err := doc.ReplaceAll(placeholders); err != nil {
		return nil, fmt.Errorf("failed to replace placeholders: %w", err)
	}

	// Сохраняем в буфер
	var buf bytes.Buffer
	if err := doc.Write(&buf); err != nil {
		return nil, fmt.Errorf("failed to write document: %w", err)
	}

	return buf.Bytes(), nil
}

// ReplaceWordPlaceholdersWithTable заменяет плейсхолдеры, включая таблицы с переменным числом строк
func (dg *DocumentGenerator) ReplaceWordPlaceholdersWithTable(templatePath string, data map[string]interface{}, tableData []map[string]interface{}) ([]byte, error) {
	// Читаем шаблон
	doc, err := docx.Open(templatePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read template %s: %w", templatePath, err)
	}

	// Конвертируем data в PlaceholderMap
	placeholders := make(docx.PlaceholderMap)
	for key, value := range data {
		placeholders[key] = fmt.Sprint(value)
	}

	// Для таблиц создаем текстовое представление
	if len(tableData) > 0 {
		var tableRows strings.Builder
		for i, row := range tableData {
			tableRows.WriteString(fmt.Sprintf("%d. ", i+1))
			for key, value := range row {
				tableRows.WriteString(fmt.Sprintf("%s: %v; ", key, value))
			}
			tableRows.WriteString("\n")
		}
		placeholders["TableData"] = tableRows.String()
	}

	// Заменяем все плейсхолдеры
	if err := doc.ReplaceAll(placeholders); err != nil {
		return nil, fmt.Errorf("failed to replace placeholders: %w", err)
	}

	// Сохраняем в буфер
	var buf bytes.Buffer
	if err := doc.Write(&buf); err != nil {
		return nil, fmt.Errorf("failed to write document: %w", err)
	}

	return buf.Bytes(), nil
}

// PrepareCommonData подготавливает общие данные для всех документов
func (dg *DocumentGenerator) PrepareCommonData(req *GenerateFullPackageRequest) map[string]interface{} {
	data := make(map[string]interface{})

	// Текущая дата
	data["CurrentDate"] = time.Now().Format("02.01.2006")

	// Данные из Init
	data["ProcurementTitle"] = req.Procurement.Init.Title
	data["Justification"] = req.Procurement.Init.Justification
	data["ResponsibleName"] = req.Procurement.Init.ResponsibleUserID // TODO: получить ФИО из БД
	data["DeliveryAddress"] = req.Procurement.Init.DeliveryAddress
	data["DeliveryTerms"] = req.Procurement.Init.DeliveryTerms

	// Данные из TechSpec
	if len(req.Procurement.TechSpec.Items) > 0 {
		firstItem := req.Procurement.TechSpec.Items[0]
		data["ItemName"] = firstItem.Name
		data["KTRUCode"] = firstItem.KTRUCode
		data["OKPD2Code"] = firstItem.OKPD2Code
		data["Quantity"] = firstItem.Quantity
		data["UOM"] = firstItem.UOM
	}
	data["WarrantyMonths"] = req.Procurement.TechSpec.WarrantyMonths

	// Данные из Settings
	data["ProcedureType"] = req.Procurement.Settings.ProcedureType
	data["IsSmpSonko"] = boolToYesNo(req.Procurement.Settings.IsSmpSonko)

	// Расчет НМЦК
	nmcc := dg.calculateTotalNMCC(req)
	data["NMCC"] = fmt.Sprintf("%.2f", nmcc)

	// Обеспечение заявки
	if req.Procurement.Settings.ApplicationSecurity.IsRequired {
		data["ApplicationSecurityRequired"] = "Да"
		data["ApplicationSecurityPercent"] = req.Procurement.Settings.ApplicationSecurity.Percentage
		data["ApplicationSecurityAmount"] = fmt.Sprintf("%.2f", nmcc*req.Procurement.Settings.ApplicationSecurity.Percentage/100)
	} else {
		data["ApplicationSecurityRequired"] = "Нет"
		data["ApplicationSecurityPercent"] = 0
		data["ApplicationSecurityAmount"] = "0.00"
	}

	// Обеспечение контракта
	if req.Procurement.Settings.ContractSecurity.IsRequired {
		data["ContractSecurityRequired"] = "Да"
		data["ContractSecurityPercent"] = req.Procurement.Settings.ContractSecurity.Percentage
		data["ContractSecurityAmount"] = fmt.Sprintf("%.2f", nmcc*req.Procurement.Settings.ContractSecurity.Percentage/100)
	} else {
		data["ContractSecurityRequired"] = "Нет"
		data["ContractSecurityPercent"] = 0
		data["ContractSecurityAmount"] = "0.00"
	}

	// Аванс
	data["AdvancePaymentPercent"] = req.Procurement.Settings.AdvancePaymentPercentage

	return data
}

// calculateTotalNMCC рассчитывает общую НМЦК
func (dg *DocumentGenerator) calculateTotalNMCC(req *GenerateFullPackageRequest) float64 {
	var total float64
	for _, item := range req.NMCCRequest.Items {
		total += item.Total
	}
	return total
}

// boolToYesNo конвертирует bool в "Да"/"Нет"
func boolToYesNo(b bool) string {
	if b {
		return "Да"
	}
	return "Нет"
}

// CreateTemplateFromOriginal создает шаблон с плейсхолдерами из оригинального документа
func (dg *DocumentGenerator) CreateTemplateFromOriginal(originalPath, templatePath string, replacements map[string]string) error {
	// Читаем оригинальный документ
	doc, err := docx.Open(originalPath)
	if err != nil {
		return fmt.Errorf("failed to read original: %w", err)
	}

	// Конвертируем replacements в PlaceholderMap
	placeholders := make(docx.PlaceholderMap)
	for oldValue, placeholder := range replacements {
		placeholders[oldValue] = placeholder
	}

	// Заменяем конкретные данные на плейсхолдеры
	if err := doc.ReplaceAll(placeholders); err != nil {
		return fmt.Errorf("failed to replace: %w", err)
	}

	// Сохраняем как новый шаблон
	f, err := os.Create(templatePath)
	if err != nil {
		return fmt.Errorf("failed to create template file: %w", err)
	}
	defer f.Close()

	if err := doc.Write(f); err != nil {
		return fmt.Errorf("failed to write template: %w", err)
	}

	return nil
}
