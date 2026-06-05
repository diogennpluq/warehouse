package handler

import (
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
		"result":  result,
		"is_valid": isValid,
		"message": message,
	})
}
