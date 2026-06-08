package handler

import (
	"archive/zip"
	"bytes"
	"fmt"
	"net/http"
	"strings"
	"unicode"

	"github.com/labstack/echo/v4"
	"github.com/techcontrol/backend/service"
)

type ProcurementHandler struct {
	procurementService *service.ProcurementService
}

func NewProcurementHandler(svc *service.ProcurementService) *ProcurementHandler {
	return &ProcurementHandler{
		procurementService: svc,
	}
}

// DownloadNMCC - генерация и скачивание файла обоснования НМЦК
func (h *ProcurementHandler) DownloadNMCC(c echo.Context) error {
	var req service.GenerateNMCCRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid JSON format",
		})
	}

	// Валидация
	if len(req.Offers) < 3 {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Требуется минимум 3 коммерческих предложения",
		})
	}

	// Генерация Excel
	buffer, err := service.GenerateNMCCExcel(&req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to generate document: " + err.Error(),
		})
	}

	// Заголовки для скачивания файла с UTF-8
	filename := "Obosnovanie_NMCK.xlsx"
	c.Response().Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"; filename*=UTF-8''%s`, filename, filename))
	c.Response().Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

	return c.Blob(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer.Bytes())
}

// CalculateNMCC - расчет НМЦК (API для проверки с фронтенда)
func (h *ProcurementHandler) CalculateNMCC(c echo.Context) error {
	var req struct {
		Prices   []float64 `json:"prices"`
		Quantity int       `json:"quantity"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid JSON format",
		})
	}

	result := service.CalculateNMCC(req.Prices, req.Quantity)
	isValid, message := service.ValidateNMCC(req.Prices)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"result":   result,
		"is_valid": isValid,
		"message":  message,
	})
}

// GenerateFullPackage - генерация полного пакета документов (ZIP-архив)
func (h *ProcurementHandler) GenerateFullPackage(c echo.Context) error {
	var req service.GenerateFullPackageRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid JSON format",
		})
	}

	// Генерация ZIP-архива со всеми документами
	buffer, err := h.generateDocumentsZip(&req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to generate documents: " + err.Error(),
		})
	}

	// Заголовки для скачивания файла
	filename := transliterate(req.Procurement.Init.Title) + ".zip"
	c.Response().Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"; filename*=UTF-8''%s`, filename, filename))
	c.Response().Header().Set("Content-Type", "application/zip")

	return c.Blob(http.StatusOK, "application/zip", buffer.Bytes())
}

// generateDocumentsZip - создает ZIP-архив со всеми 7 документами
func (h *ProcurementHandler) generateDocumentsZip(req *service.GenerateFullPackageRequest) (*bytes.Buffer, error) {
	buffer := &bytes.Buffer{}
	zipWriter := zip.NewWriter(buffer)

	// Список документов для генерации
	documents := []struct {
		filename  string
		generator func() ([]byte, error)
	}{
		{"01_Zayavka.docx", func() ([]byte, error) {
			return service.GenerateApplicationDoc(req)
		}},
		{"02_Rasporyazhenie.docx", func() ([]byte, error) {
			return service.GenerateOrderDoc(req)
		}},
		{"03_Prilozhenie_1_TZ.docx", func() ([]byte, error) {
			return service.GenerateTechSpecDoc(req)
		}},
		{"04_Prilozhenie_2_NMCK.xlsx", func() ([]byte, error) {
			return service.GenerateNMCCExcelBytes(&req.NMCCRequest)
		}},
		{"05_Informaciya_k_izveshcheniyu.docx", func() ([]byte, error) {
			return service.GenerateNoticeInfoDoc(req)
		}},
		{"06_Trebovaniya_k_zayavke.docx", func() ([]byte, error) {
			return service.GenerateBidRequirementsDoc(req)
		}},
		{"07_Proekt_kontrakta.docx", func() ([]byte, error) {
			return service.GenerateContractDraftDoc(req)
		}},
	}

	// Генерация каждого документа
	for _, doc := range documents {
		content, genErr := doc.generator()
		if genErr != nil {
			// Если ошибка, добавляем текстовый файл с информацией об ошибке
			content = []byte(fmt.Sprintf("Ошибка генерации документа: %v", genErr))
			doc.filename = doc.filename + ".ERROR.txt"
		}

		fileWriter, fwErr := zipWriter.Create(doc.filename)
		if fwErr != nil {
			return nil, fmt.Errorf("failed to create file in zip: %w", fwErr)
		}

		_, writeErr := fileWriter.Write(content)
		if writeErr != nil {
			return nil, fmt.Errorf("failed to write file to zip: %w", writeErr)
		}
	}

	closeErr := zipWriter.Close()
	if closeErr != nil {
		return nil, fmt.Errorf("failed to close zip writer: %w", closeErr)
	}

	return buffer, nil
}

// transliterate - транслитерация русского текста в латиницу для имен файлов
func transliterate(text string) string {
	result := strings.Builder{}
	for _, r := range text {
		switch unicode.ToLower(r) {
		case 'а':
			result.WriteRune('a')
		case 'б':
			result.WriteRune('b')
		case 'в':
			result.WriteRune('v')
		case 'г':
			result.WriteRune('g')
		case 'д':
			result.WriteRune('d')
		case 'е', 'ё':
			result.WriteRune('e')
		case 'ж':
			result.WriteString("zh")
		case 'з':
			result.WriteRune('z')
		case 'и':
			result.WriteRune('i')
		case 'й':
			result.WriteRune('y')
		case 'к':
			result.WriteRune('k')
		case 'л':
			result.WriteRune('l')
		case 'м':
			result.WriteRune('m')
		case 'н':
			result.WriteRune('n')
		case 'о':
			result.WriteRune('o')
		case 'п':
			result.WriteRune('p')
		case 'р':
			result.WriteRune('r')
		case 'с':
			result.WriteRune('s')
		case 'т':
			result.WriteRune('t')
		case 'у':
			result.WriteRune('u')
		case 'ф':
			result.WriteRune('f')
		case 'х':
			result.WriteRune('h')
		case 'ц':
			result.WriteRune('c')
		case 'ч':
			result.WriteString("ch")
		case 'ш':
			result.WriteString("sh")
		case 'щ':
			result.WriteString("sch")
		case 'ъ', 'ь':
			result.WriteRune('\'')
		case 'ы':
			result.WriteRune('i')
		case 'э':
			result.WriteRune('e')
		case 'ю':
			result.WriteString("yu")
		case 'я':
			result.WriteString("ya")
		default:
			if unicode.IsLetter(r) || unicode.IsDigit(r) {
				result.WriteRune(r)
			} else {
				result.WriteRune('_')
			}
		}
	}
	return result.String()
}
