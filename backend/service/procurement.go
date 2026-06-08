package service

import (
	"bytes"
	"fmt"
	"math"
	"strings"

	"github.com/xuri/excelize/v2"
)

type ProcurementService struct {
	// Add any dependencies needed for procurement operations
}

func NewProcurementService() *ProcurementService {
	return &ProcurementService{}
}

// GenerateNMCCRequest - запрос на генерацию обоснования НМЦК
type GenerateNMCCRequest struct {
	Items  []NMCCItem `json:"items"`
	Offers []Offer    `json:"offers"`
}

// NMCCItem - объект закупки для расчета НМЦК
type NMCCItem struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Quantity int     `json:"quantity"`
	UOM      string  `json:"uom"`
	AvgPrice float64 `json:"avg_price"`
	Total    float64 `json:"total"`
}

// Offer - коммерческое предложение
type Offer struct {
	ProviderName  string             `json:"provider_name"`
	ProviderINN   string             `json:"provider_inn"`
	Date          string             `json:"date"`
	PricesPerItem map[string]float64 `json:"prices_per_item"`
}

// NMCCResult - результат расчета НМЦК
type NMCCResult struct {
	AveragePrice           float64 `json:"average_price"`
	StandardDeviation      float64 `json:"standard_deviation"`
	CoefficientOfVariation float64 `json:"coefficient_of_variation"`
	IsValid                bool    `json:"is_valid"`
	TotalNMCC              float64 `json:"total_nmcc"`
}

// GenerateFullPackageRequest - запрос на генерацию полного пакета документов
type GenerateFullPackageRequest struct {
	Procurement ProcurementData     `json:"procurement"`
	NMCCRequest GenerateNMCCRequest `json:"nmcc_request"`
}

// ProcurementData - данные о закупке
type ProcurementData struct {
	Init     InitData     `json:"init"`
	TechSpec TechSpecData `json:"tech_spec"`
	NMCC     NMCCData     `json:"nmcc"`
	Settings SettingsData `json:"settings"`
}

type InitData struct {
	Title             string   `json:"title"`
	Justification     string   `json:"justification"`
	ResponsibleUserID string   `json:"responsible_user_id"`
	CommissionMembers []string `json:"commission_members"`
	DeliveryAddress   string   `json:"delivery_address"`
	DeliveryTerms     string   `json:"delivery_terms"`
}

type TechSpecData struct {
	Items          []ItemData `json:"items"`
	WarrantyMonths int        `json:"warranty_months"`
}

type ItemData struct {
	ID              string           `json:"id"`
	Name            string           `json:"name"`
	KTRUCode        string           `json:"ktru_code"`
	OKPD2Code       string           `json:"okpd2_code"`
	UOM             string           `json:"uom"`
	Quantity        int              `json:"quantity"`
	Characteristics []Characteristic `json:"characteristics"`
}

type Characteristic struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Value       string `json:"value"`
	IsMandatory bool   `json:"is_mandatory"`
}

type NMCCData struct {
	CommercialOffers []CommercialOffer `json:"commercial_offers"`
}

type CommercialOffer struct {
	ID            string             `json:"id"`
	ProviderName  string             `json:"provider_name"`
	ProviderINN   string             `json:"provider_inn"`
	Date          string             `json:"date"`
	PricesPerItem map[string]float64 `json:"prices_per_item"`
}

type SettingsData struct {
	ProcedureType            string         `json:"procedure_type"`
	IsSmpSonko               bool           `json:"is_smp_sonko"`
	ApplicationSecurity      SecurityConfig `json:"application_security"`
	ContractSecurity         SecurityConfig `json:"contract_security"`
	AdvancePaymentPercentage int            `json:"advance_payment_percentage"`
}

type SecurityConfig struct {
	IsRequired bool    `json:"is_required"`
	Percentage float64 `json:"percentage"`
}

// CalculateNMCC - расчет НМЦК по методу сопоставимых рыночных цен (Приказ Минэкономразвития №567)
func CalculateNMCC(prices []float64, quantity int) NMCCResult {
	if len(prices) == 0 {
		return NMCCResult{
			AveragePrice:           0,
			StandardDeviation:      0,
			CoefficientOfVariation: 0,
			IsValid:                false,
			TotalNMCC:              0,
		}
	}

	// 1. Средняя цена
	var sum float64
	for _, p := range prices {
		sum += p
	}
	averagePrice := sum / float64(len(prices))

	// 2. Среднее квадратичное отклонение
	var varianceSum float64
	for _, p := range prices {
		varianceSum += math.Pow(p-averagePrice, 2)
	}
	variance := varianceSum / float64(len(prices)-1)
	standardDeviation := math.Sqrt(variance)

	// 3. Коэффициент вариации (%)
	coefficientOfVariation := 0.0
	if averagePrice > 0 {
		coefficientOfVariation = (standardDeviation / averagePrice) * 100
	}

	// 4. Проверка по 44-ФЗ (V ≤ 33%)
	isValid := coefficientOfVariation <= 33

	// 5. Итоговая НМЦК
	totalNMCC := averagePrice * float64(quantity)

	return NMCCResult{
		AveragePrice:           averagePrice,
		StandardDeviation:      standardDeviation,
		CoefficientOfVariation: coefficientOfVariation,
		IsValid:                isValid,
		TotalNMCC:              totalNMCC,
	}
}

// GenerateNMCCExcel - генерация Excel-файла "Обоснование НМЦК"
func GenerateNMCCExcel(req *GenerateNMCCRequest) (*bytes.Buffer, error) {
	// Открываем шаблон
	f, err := excelize.OpenFile("templates/nmcc_template.xlsx")
	if err != nil {
		return nil, fmt.Errorf("failed to open template: %w", err)
	}
	defer f.Close()

	sheet := "Лист1"

	// Заполняем шапку (поставщики)
	if len(req.Offers) >= 3 {
		f.SetCellValue(sheet, "D5", req.Offers[0].ProviderName+" (от "+req.Offers[0].Date+")")
		f.SetCellValue(sheet, "E5", req.Offers[1].ProviderName+" (от "+req.Offers[1].Date+")")
		f.SetCellValue(sheet, "F5", req.Offers[2].ProviderName+" (от "+req.Offers[2].Date+")")
	}

	// Заполняем таблицу товаров
	startRow := 8
	for i, item := range req.Items {
		currentRow := startRow + i

		f.SetCellValue(sheet, fmt.Sprintf("A%d", currentRow), i+1)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", currentRow), item.Name)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", currentRow), item.UOM)

		// Цены из коммерческих предложений
		if len(req.Offers) >= 3 {
			f.SetCellValue(sheet, fmt.Sprintf("D%d", currentRow), req.Offers[0].PricesPerItem[item.ID])
			f.SetCellValue(sheet, fmt.Sprintf("E%d", currentRow), req.Offers[1].PricesPerItem[item.ID])
			f.SetCellValue(sheet, fmt.Sprintf("F%d", currentRow), req.Offers[2].PricesPerItem[item.ID])
		}

		// Средняя цена, количество, итог
		f.SetCellValue(sheet, fmt.Sprintf("G%d", currentRow), item.AvgPrice)
		f.SetCellValue(sheet, fmt.Sprintf("H%d", currentRow), item.Quantity)
		f.SetCellValue(sheet, fmt.Sprintf("I%d", currentRow), item.Total)
	}

	// Сохраняем в буфер
	var buffer bytes.Buffer
	if err := f.Write(&buffer); err != nil {
		return nil, fmt.Errorf("failed to write excel: %w", err)
	}

	return &buffer, nil
}

// GenerateNMCCExcelBytes - генерация Excel без файла шаблона (для ZIP)
func GenerateNMCCExcelBytes(req *GenerateNMCCRequest) ([]byte, error) {
	buffer, err := GenerateNMCCExcel(req)
	if err != nil {
		return nil, err
	}
	return buffer.Bytes(), nil
}

// ValidateNMCC - валидация расчета НМЦК по правилам 44-ФЗ
func ValidateNMCC(prices []float64) (bool, string) {
	if len(prices) < 3 {
		return false, "Требуется минимум 3 коммерческих предложения"
	}

	result := CalculateNMCC(prices, 1)

	if !result.IsValid {
		return false, fmt.Sprintf("Коэффициент вариации (%.2f%%) превышает 33%%. Цены неоднородны.", result.CoefficientOfVariation)
	}

	return true, "НМЦК рассчитана корректно"
}

// Генерация Word-документов с использованием шаблонов

// GenerateApplicationDoc - Заявка
func GenerateApplicationDoc(req *GenerateFullPackageRequest) ([]byte, error) {
	dg := NewDocumentGenerator()
	data := dg.PrepareCommonData(req)

	// Дополнительные данные для заявки
	data["Justification"] = req.Procurement.Init.Justification

	return dg.ReplaceWordPlaceholders("templates/application_template.docx", data)
}

// GenerateOrderDoc - Распоряжение
func GenerateOrderDoc(req *GenerateFullPackageRequest) ([]byte, error) {
	dg := NewDocumentGenerator()
	data := dg.PrepareCommonData(req)

	// Список членов комиссии
	var commissionList strings.Builder
	for i, memberID := range req.Procurement.Init.CommissionMembers {
		if i > 0 {
			commissionList.WriteString("\n")
		}
		commissionList.WriteString(fmt.Sprintf("%d. %s", i+1, memberID))
	}
	data["CommissionMembers"] = commissionList.String()
	data["Justification"] = req.Procurement.Init.Justification
	data["DeliveryTerms"] = req.Procurement.Init.DeliveryTerms
	data["DeliveryAddress"] = req.Procurement.Init.DeliveryAddress

	return dg.ReplaceWordPlaceholders("templates/order_template.docx", data)
}

// GenerateTechSpecDoc - Техническое задание (Приложение 1)
func GenerateTechSpecDoc(req *GenerateFullPackageRequest) ([]byte, error) {
	dg := NewDocumentGenerator()
	data := dg.PrepareCommonData(req)

	// Формируем таблицу объектов закупки
	var itemsTable strings.Builder
	for i, item := range req.Procurement.TechSpec.Items {
		itemsTable.WriteString(fmt.Sprintf("%d. %s (Код КТРУ: %s, ОКПД2: %s), %d %s\n",
			i+1, item.Name, item.KTRUCode, item.OKPD2Code, item.Quantity, item.UOM))

		// Характеристики
		if len(item.Characteristics) > 0 {
			itemsTable.WriteString("   Характеристики:\n")
			for _, char := range item.Characteristics {
				mandatory := ""
				if char.IsMandatory {
					mandatory = " (обязательная)"
				}
				itemsTable.WriteString(fmt.Sprintf("   - %s: %s%s\n", char.Name, char.Value, mandatory))
			}
		}
		itemsTable.WriteString("\n")
	}
	data["ItemsTable"] = itemsTable.String()
	data["WarrantyMonthsValue"] = fmt.Sprintf("%d", req.Procurement.TechSpec.WarrantyMonths)

	return dg.ReplaceWordPlaceholders("templates/application_template.docx", data)
}

// GenerateNoticeInfoDoc - Информация к извещению
func GenerateNoticeInfoDoc(req *GenerateFullPackageRequest) ([]byte, error) {
	dg := NewDocumentGenerator()
	data := dg.PrepareCommonData(req)

	return dg.ReplaceWordPlaceholders("templates/notice_info_template.docx", data)
}

// GenerateBidRequirementsDoc - Требования к составу заявки
func GenerateBidRequirementsDoc(req *GenerateFullPackageRequest) ([]byte, error) {
	dg := NewDocumentGenerator()
	data := dg.PrepareCommonData(req)

	return dg.ReplaceWordPlaceholders("templates/bid_requirements_template.docx", data)
}

// GenerateContractDraftDoc - Проект контракта
func GenerateContractDraftDoc(req *GenerateFullPackageRequest) ([]byte, error) {
	dg := NewDocumentGenerator()
	data := dg.PrepareCommonData(req)

	// Формируем спецификацию
	var specification string
	for i, item := range req.Procurement.TechSpec.Items {
		// Находим среднюю цену из НМЦК
		avgPrice := 0.0
		total := 0.0
		for _, nmccItem := range req.NMCCRequest.Items {
			if nmccItem.ID == item.ID {
				avgPrice = nmccItem.AvgPrice
				total = nmccItem.Total
				break
			}
		}

		specification += fmt.Sprintf("%d. %s - %d %s × %.2f руб. = %.2f руб.\n",
			i+1, item.Name, item.Quantity, item.UOM, avgPrice, total)
	}
	data["Specification"] = specification

	return dg.ReplaceWordPlaceholders("templates/contract_draft_template.docx", data)
}

// escapeXML - экранирование специальных XML-символов для UTF-8
func escapeXML(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	s = strings.ReplaceAll(s, `"`, "&quot;")
	s = strings.ReplaceAll(s, "'", "&apos;")
	return s
}
