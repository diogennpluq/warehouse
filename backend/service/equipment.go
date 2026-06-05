package service

import (
	"context"

	"github.com/techcontrol/backend/repository"
)

// EquipmentServicer - интерфейс для тестирования
type EquipmentServicer interface {
	GetAll(ctx context.Context) ([]repository.Equipment, error)
	GetByID(ctx context.Context, id int64) (*repository.Equipment, error)
	Create(ctx context.Context, equipment *repository.Equipment) error
	Update(ctx context.Context, equipment *repository.Equipment) error
	Delete(ctx context.Context, id int64) error
	PredictReplacements(ctx context.Context) ([]repository.Equipment, error)
}

type EquipmentService struct {
	repo *repository.EquipmentRepository
}

func NewEquipmentService(db interface{}) *EquipmentService {
	return &EquipmentService{
		repo: repository.NewEquipmentRepository(),
	}
}

func (s *EquipmentService) GetAll(ctx context.Context) ([]repository.Equipment, error) {
	return s.repo.GetAll(ctx)
}

func (s *EquipmentService) GetByID(ctx context.Context, id int64) (*repository.Equipment, error) {
	equipment, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if equipment == nil {
		return nil, ErrNotFound
	}
	return equipment, nil
}

func (s *EquipmentService) Create(ctx context.Context, equipment *repository.Equipment) error {
	return s.repo.Create(ctx, equipment)
}

func (s *EquipmentService) Update(ctx context.Context, equipment *repository.Equipment) error {
	existing, err := s.repo.GetByID(ctx, equipment.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrNotFound
	}
	return s.repo.Update(ctx, equipment)
}

func (s *EquipmentService) Delete(ctx context.Context, id int64) error {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrNotFound
	}
	return s.repo.Delete(ctx, id)
}

func (s *EquipmentService) PredictReplacements(ctx context.Context) ([]repository.Equipment, error) {
	// Прогнозирование замены оборудования на основе износа (>70%)
	all, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	var predictions []repository.Equipment
	for _, e := range all {
		if e.WearPercentage >= 70 {
			predictions = append(predictions, e)
		}
	}
	return predictions, nil
}
