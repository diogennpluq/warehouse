package service

import (
	"context"

	"github.com/techcontrol/backend/repository"
)

type RepairService struct {
	repo *repository.RepairRepository
}

func NewRepairService(db interface{}) *RepairService {
	return &RepairService{
		repo: repository.NewRepairRepository(),
	}
}

func (s *RepairService) GetAll(ctx context.Context) ([]repository.Repair, error) {
	return s.repo.GetAll(ctx)
}

func (s *RepairService) GetByID(ctx context.Context, id int64) (*repository.Repair, error) {
	repair, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if repair == nil {
		return nil, ErrNotFound
	}
	return repair, nil
}

func (s *RepairService) Create(ctx context.Context, repair *repository.Repair) error {
	return s.repo.Create(ctx, repair)
}

func (s *RepairService) Update(ctx context.Context, repair *repository.Repair) error {
	existing, err := s.repo.GetByID(ctx, repair.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrNotFound
	}
	return s.repo.Update(ctx, repair)
}

func (s *RepairService) GetRepairsByEquipment(ctx context.Context, equipmentID int64) ([]repository.Repair, error) {
	all, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	var result []repository.Repair
	for _, r := range all {
		if r.EquipmentID == equipmentID {
			result = append(result, r)
		}
	}
	return result, nil
}

func (s *RepairService) CalculateEquipmentCost(ctx context.Context, equipmentID int64) (float64, error) {
	repairs, err := s.GetRepairsByEquipment(ctx, equipmentID)
	if err != nil {
		return 0, err
	}

	var totalCost float64
	for _, r := range repairs {
		totalCost += r.Cost
	}
	return totalCost, nil
}
