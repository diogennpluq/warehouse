package service

import (
	"context"

	"github.com/techcontrol/backend/repository"
)

type PurchaseService struct {
	repo *repository.PurchaseRepository
}

func NewPurchaseService() *PurchaseService {
	return &PurchaseService{
		repo: repository.NewPurchaseRepository(),
	}
}

func (s *PurchaseService) GetTasks(ctx context.Context) ([]repository.PurchaseTask, error) {
	return s.repo.GetTasks(ctx)
}

func (s *PurchaseService) CreateTask(ctx context.Context, task *repository.PurchaseTask) error {
	return s.repo.CreateTask(ctx, task)
}

func (s *PurchaseService) UpdateTask(ctx context.Context, task *repository.PurchaseTask) error {
	return s.repo.UpdateTask(ctx, task)
}

func (s *PurchaseService) GenerateAutoTasks(ctx context.Context) error {
	return s.repo.GenerateAutoTasks(ctx)
}

func (s *PurchaseService) GetPendingTasksCount(ctx context.Context) (int, error) {
	tasks, err := s.repo.GetTasks(ctx)
	if err != nil {
		return 0, err
	}

	count := 0
	for _, t := range tasks {
		if t.Status == "pending" {
			count++
		}
	}
	return count, nil
}

func (s *PurchaseService) CalculateTotalEstimatedCost(ctx context.Context) (float64, error) {
	tasks, err := s.repo.GetTasks(ctx)
	if err != nil {
		return 0, err
	}

	var total float64
	for _, t := range tasks {
		if t.Status == "pending" && t.EstimatedCost != nil {
			total += *t.EstimatedCost
		}
	}
	return total, nil
}
