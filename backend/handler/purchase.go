package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/techcontrol/backend/repository"
	"github.com/techcontrol/backend/service"
)

type PurchaseHandler struct {
	service *service.PurchaseService
}

func NewPurchaseHandler(svc *service.PurchaseService) *PurchaseHandler {
	return &PurchaseHandler{service: svc}
}

func (h *PurchaseHandler) GetTasks(c echo.Context) error {
	tasks, err := h.service.GetTasks(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, tasks)
}

func (h *PurchaseHandler) CreateTask(c echo.Context) error {
	var task repository.PurchaseTask
	if err := c.Bind(&task); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	if err := h.service.CreateTask(c.Request().Context(), &task); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, task)
}

func (h *PurchaseHandler) UpdateTask(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}

	var task repository.PurchaseTask
	if err := c.Bind(&task); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	task.ID = id

	if err := h.service.UpdateTask(c.Request().Context(), &task); err != nil {
		if err == service.ErrNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "task not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, task)
}

func (h *PurchaseHandler) GenerateAutoTasks(c echo.Context) error {
	if err := h.service.GenerateAutoTasks(c.Request().Context()); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "auto tasks generated successfully"})
}

func (h *PurchaseHandler) GetStats(c echo.Context) error {
	count, err := h.service.GetPendingTasksCount(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	cost, err := h.service.CalculateTotalEstimatedCost(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"pending_count": count,
		"estimated_cost": cost,
	})
}
