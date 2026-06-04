package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/techcontrol/backend/repository"
	"github.com/techcontrol/backend/service"
)

type EquipmentHandler struct {
	service *service.EquipmentService
}

func NewEquipmentHandler(svc *service.EquipmentService) *EquipmentHandler {
	return &EquipmentHandler{service: svc}
}

func (h *EquipmentHandler) GetAll(c echo.Context) error {
	equipments, err := h.service.GetAll(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, equipments)
}

func (h *EquipmentHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}

	equipment, err := h.service.GetByID(c.Request().Context(), id)
	if err != nil {
		if err == service.ErrNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "equipment not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, equipment)
}

func (h *EquipmentHandler) Create(c echo.Context) error {
	var equipment repository.Equipment
	if err := c.Bind(&equipment); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	if err := h.service.Create(c.Request().Context(), &equipment); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, equipment)
}

func (h *EquipmentHandler) Update(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}

	var equipment repository.Equipment
	if err := c.Bind(&equipment); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	equipment.ID = id

	if err := h.service.Update(c.Request().Context(), &equipment); err != nil {
		if err == service.ErrNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "equipment not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, equipment)
}

func (h *EquipmentHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}

	if err := h.service.Delete(c.Request().Context(), id); err != nil {
		if err == service.ErrNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "equipment not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "deleted successfully"})
}

func (h *EquipmentHandler) PredictReplacements(c echo.Context) error {
	predictions, err := h.service.PredictReplacements(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, predictions)
}
