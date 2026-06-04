package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
)

type Repair struct {
	ID            int64      `json:"id"`
	EquipmentID   int64      `json:"equipment_id"`
	Title         string     `json:"title"`
	Description   string     `json:"description"`
	Status        string     `json:"status"`
	Priority      string     `json:"priority"`
	StartDate     *time.Time `json:"start_date"`
	EndDate       *time.Time `json:"end_date"`
	AssignedTo    *int64     `json:"assigned_to"`
	CompletedBy   *int64     `json:"completed_by"`
	Cost          float64    `json:"cost"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type RepairRepository struct{}

func NewRepairRepository() *RepairRepository {
	return &RepairRepository{}
}

func (r *RepairRepository) GetAll(ctx context.Context) ([]Repair, error) {
	query := `SELECT id, equipment_id, title, description, status, priority, 
		start_date, end_date, assigned_to, completed_by, cost, created_at, updated_at 
		FROM repairs ORDER BY created_at DESC`
	
	rows, err := DB.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var repairs []Repair
	for rows.Next() {
		var rep Repair
		err := rows.Scan(
			&rep.ID, &rep.EquipmentID, &rep.Title, &rep.Description, &rep.Status, &rep.Priority,
			&rep.StartDate, &rep.EndDate, &rep.AssignedTo, &rep.CompletedBy, &rep.Cost,
			&rep.CreatedAt, &rep.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		repairs = append(repairs, rep)
	}
	return repairs, nil
}

func (r *RepairRepository) GetByID(ctx context.Context, id int64) (*Repair, error) {
	query := `SELECT id, equipment_id, title, description, status, priority, 
		start_date, end_date, assigned_to, completed_by, cost, created_at, updated_at 
		FROM repairs WHERE id = $1`
	
	var rep Repair
	err := DB.QueryRow(ctx, query, id).Scan(
		&rep.ID, &rep.EquipmentID, &rep.Title, &rep.Description, &rep.Status, &rep.Priority,
		&rep.StartDate, &rep.EndDate, &rep.AssignedTo, &rep.CompletedBy, &rep.Cost,
		&rep.CreatedAt, &rep.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &rep, nil
}

func (r *RepairRepository) Create(ctx context.Context, rep *Repair) error {
	query := `INSERT INTO repairs (equipment_id, title, description, status, priority, 
		assigned_to, cost) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at, updated_at`
	
	return DB.QueryRow(ctx, query,
		rep.EquipmentID, rep.Title, rep.Description, rep.Status, rep.Priority,
		rep.AssignedTo, rep.Cost,
	).Scan(&rep.ID, &rep.CreatedAt, &rep.UpdatedAt)
}

func (r *RepairRepository) Update(ctx context.Context, rep *Repair) error {
	query := `UPDATE repairs SET equipment_id=$2, title=$3, description=$4, status=$5, 
		priority=$6, start_date=$7, end_date=$8, assigned_to=$9, completed_by=$10, 
		cost=$11, updated_at=$12 WHERE id=$1`
	
	_, err := DB.Exec(ctx, query,
		rep.ID, rep.EquipmentID, rep.Title, rep.Description, rep.Status, rep.Priority,
		rep.StartDate, rep.EndDate, rep.AssignedTo, rep.CompletedBy, rep.Cost, time.Now(),
	)
	return err
}
