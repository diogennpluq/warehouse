package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/techcontrol/backend/repository"
	"github.com/techcontrol/backend/service"
)

type RepairHandler struct {
	service *service.RepairService
}

func NewRepairHandler(svc *service.RepairService) *RepairHandler {
	return &RepairHandler{service: svc}
}

func (h *RepairHandler) GetAll(c echo.Context) error {
	repairs, err := h.service.GetAll(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, repairs)
}

func (h *RepairHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}

	repair, err := h.service.GetByID(c.Request().Context(), id)
	if err != nil {
		if err == service.ErrNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "repair not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, repair)
}

func (h *RepairHandler) Create(c echo.Context) error {
	var repair repository.Repair
	if err := c.Bind(&repair); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	if err := h.service.Create(c.Request().Context(), &repair); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, repair)
}

func (h *RepairHandler) Update(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}

	var repair repository.Repair
	if err := c.Bind(&repair); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	repair.ID = id

	if err := h.service.Update(c.Request().Context(), &repair); err != nil {
		if err == service.ErrNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "repair not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, repair)
}

func (h *RepairHandler) GetByEquipment(c echo.Context) error {
	equipmentID, err := strconv.ParseInt(c.Param("equipment_id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid equipment id"})
	}

	repairs, err := h.service.GetRepairsByEquipment(c.Request().Context(), equipmentID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, repairs)
}

func (h *RepairHandler) GetEquipmentCost(c echo.Context) error {
	equipmentID, err := strconv.ParseInt(c.Param("equipment_id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid equipment id"})
	}

	cost, err := h.service.CalculateEquipmentCost(c.Request().Context(), equipmentID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]float64{"total_cost": cost})
}
