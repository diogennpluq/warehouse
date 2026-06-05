package handler

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/techcontrol/backend/repository"
	"github.com/techcontrol/backend/service"
)

func TestEquipmentHandler_GetAll(t *testing.T) {
	e := echo.New()

	mockEquipments := []repository.Equipment{
		{
			ID:             1,
			Name:           "Forklift A1",
			Type:           "forklift",
			Status:         "active",
			WearPercentage: 25.5,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
	}

	mockService := &MockEquipmentService{
		equipments: mockEquipments,
	}

	handler := NewEquipmentHandler(mockService)

	req := httptest.NewRequest(http.MethodGet, "/equipment", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	if assert.NoError(t, handler.GetAll(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)
	}
}

func TestEquipmentHandler_GetByID(t *testing.T) {
	e := echo.New()

	mockEquipment := &repository.Equipment{
		ID:             1,
		Name:           "Forklift A1",
		Type:           "forklift",
		Status:         "active",
		WearPercentage: 25.5,
	}

	mockService := &MockEquipmentService{
		equipment: mockEquipment,
	}

	handler := NewEquipmentHandler(mockService)

	req := httptest.NewRequest(http.MethodGet, "/equipment/1", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("1")

	if assert.NoError(t, handler.GetByID(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)
	}
}

func TestEquipmentHandler_GetByID_NotFound(t *testing.T) {
	e := echo.New()

	mockService := &MockEquipmentService{
		err: service.ErrNotFound,
	}

	handler := NewEquipmentHandler(mockService)

	req := httptest.NewRequest(http.MethodGet, "/equipment/999", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("999")

	err := handler.GetByID(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusNotFound, rec.Code)
}

type MockEquipmentService struct {
	equipments []repository.Equipment
	equipment  *repository.Equipment
	err        error
}

func (m *MockEquipmentService) GetAll(ctx context.Context) ([]repository.Equipment, error) {
	return m.equipments, m.err
}

func (m *MockEquipmentService) GetByID(ctx context.Context, id int64) (*repository.Equipment, error) {
	return m.equipment, m.err
}

func (m *MockEquipmentService) Create(ctx context.Context, equipment *repository.Equipment) error {
	return m.err
}

func (m *MockEquipmentService) Update(ctx context.Context, equipment *repository.Equipment) error {
	return m.err
}

func (m *MockEquipmentService) Delete(ctx context.Context, id int64) error {
	return m.err
}

func (m *MockEquipmentService) PredictReplacements(ctx context.Context) ([]repository.Equipment, error) {
	return m.equipments, m.err
}
