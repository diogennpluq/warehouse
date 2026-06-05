package handler

import (
	"archive/zip"
	"bytes"
	"fmt"
	"net/http"

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

	// Заголовки для скачивания файла
	c.Response().Header().Set("Content-Disposition", `attachment; filename="Обоснование_НМЦК.xlsx"`)
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
	filename := fmt.Sprintf("Закупка_%s.zip", req.Procurement.Init.Title)
	c.Response().Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
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
		{"01_Заявка.docx", func() ([]byte, error) {
			return service.GenerateApplicationDoc(req)
		}},
		{"02_Распоряжение.docx", func() ([]byte, error) {
			return service.GenerateOrderDoc(req)
		}},
		{"03_Приложение_1_ТЗ.docx", func() ([]byte, error) {
			return service.GenerateTechSpecDoc(req)
		}},
		{"04_Приложение_2_НМЦК.xlsx", func() ([]byte, error) {
			return service.GenerateNMCCExcelBytes(&req.NMCCRequest)
		}},
		{"05_Информация_к_извещению.docx", func() ([]byte, error) {
			return service.GenerateNoticeInfoDoc(req)
		}},
		{"06_Требования_к_заявке.docx", func() ([]byte, error) {
			return service.GenerateBidRequirementsDoc(req)
		}},
		{"07_Проект_контракта.docx", func() ([]byte, error) {
			return service.GenerateContractDraftDoc(req)
		}},
	}

	// Генерация каждого документа
	for _, doc := range documents {
		content, err := doc.generator()
		if err != nil {
			// Если ошибка, добавляем текстовый файл с информацией об ошибке
			content = []byte(fmt.Sprintf("Ошибка генерации документа: %v", err))
			doc.filename = doc.filename + ".ERROR.txt"
		}

		fileWriter, err := zipWriter.Create(doc.filename)
		if err != nil {
			return nil, fmt.Errorf("failed to create file in zip: %w", err)
		}

		_, err = fileWriter.Write(content)
		if err != nil {
			return nil, fmt.Errorf("failed to write file to zip: %w", err)
		}
	}

	err := zipWriter.Close()
	if err != nil {
		return nil, fmt.Errorf("failed to close zip writer: %w", err)
	}

	return buffer, nil
}
