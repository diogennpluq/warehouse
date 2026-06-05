package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PurchaseTask struct {
	ID            int64      `json:"id"`
	Title         string     `json:"title"`
	Description   string     `json:"description"`
	PartID        *int64     `json:"part_id"`
	EquipmentID   *int64     `json:"equipment_id"`
	Quantity      int        `json:"quantity"`
	Priority      string     `json:"priority"`
	Status        string     `json:"status"`
	EstimatedCost *float64   `json:"estimated_cost"`
	DueDate       *time.Time `json:"due_date"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type PurchaseRepository struct {
	db *pgxpool.Pool
}

func NewPurchaseRepository(db *pgxpool.Pool) *PurchaseRepository {
	return &PurchaseRepository{db: db}
}

func (r *PurchaseRepository) GetTasks(ctx context.Context) ([]PurchaseTask, error) {
	query := `SELECT id, title, description, part_id, equipment_id, quantity, 
		priority, status, estimated_cost, due_date, created_at, updated_at 
		FROM purchase_tasks ORDER BY created_at DESC`
	
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []PurchaseTask
	for rows.Next() {
		var task PurchaseTask
		err := rows.Scan(
			&task.ID, &task.Title, &task.Description, &task.PartID, &task.EquipmentID,
			&task.Quantity, &task.Priority, &task.Status, &task.EstimatedCost,
			&task.DueDate, &task.CreatedAt, &task.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}
	return tasks, nil
}

func (r *PurchaseRepository) CreateTask(ctx context.Context, task *PurchaseTask) error {
	query := `INSERT INTO purchase_tasks (title, description, part_id, equipment_id, 
		quantity, priority, status, estimated_cost, due_date) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, created_at, updated_at`
	
	return r.db.QueryRow(ctx, query,
		task.Title, task.Description, task.PartID, task.EquipmentID,
		task.Quantity, task.Priority, task.Status, task.EstimatedCost, task.DueDate,
	).Scan(&task.ID, &task.CreatedAt, &task.UpdatedAt)
}

func (r *PurchaseRepository) UpdateTask(ctx context.Context, task *PurchaseTask) error {
	query := `UPDATE purchase_tasks SET title=$2, description=$3, part_id=$4, 
		equipment_id=$5, quantity=$6, priority=$7, status=$8, estimated_cost=$9, 
		due_date=$10, updated_at=$11 WHERE id=$1`
	
	_, err := r.db.Exec(ctx, query,
		task.ID, task.Title, task.Description, task.PartID, task.EquipmentID,
		task.Quantity, task.Priority, task.Status, task.EstimatedCost, task.DueDate, time.Now(),
	)
	return err
}

func (r *PurchaseRepository) GenerateAutoTasks(ctx context.Context) error {
	// Автоматическая генерация задач на закупку на основе износа оборудования
	query := `
		INSERT INTO purchase_tasks (title, description, priority, status, quantity, due_date)
		SELECT 
			'Закупка оборудования для замены: ' || e.name,
			'Оборудование достигло критического износа (' || e.wear_percentage || '%)',
			'high',
			'pending',
			1,
			CURRENT_DATE + INTERVAL '7 days'
		FROM equipment e
		WHERE e.wear_percentage >= 80 AND e.status = 'active'
		AND NOT EXISTS (
			SELECT 1 FROM purchase_tasks pt 
			WHERE pt.equipment_id = e.id AND pt.status = 'pending'
		)
	`
	_, err := r.db.Exec(ctx, query)
	return err
}
