package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
)

type Equipment struct {
	ID                 int64      `json:"id"`
	Name               string     `json:"name"`
	Type               string     `json:"type"`
	Model              string     `json:"model"`
	SerialNumber       string     `json:"serial_number"`
	PurchaseDate       *time.Time `json:"purchase_date"`
	Manufacturer       string     `json:"manufacturer"`
	Status             string     `json:"status"`
	Location           string     `json:"location"`
	WearPercentage     float64    `json:"wear_percentage"`
	LastMaintenanceDate *time.Time `json:"last_maintenance_date"`
	NextMaintenanceDate *time.Time `json:"next_maintenance_date"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

type EquipmentRepository struct{}

func NewEquipmentRepository() *EquipmentRepository {
	return &EquipmentRepository{}
}

func (r *EquipmentRepository) GetAll(ctx context.Context) ([]Equipment, error) {
	query := `SELECT id, name, type, model, serial_number, purchase_date, manufacturer, 
		status, location, wear_percentage, last_maintenance_date, next_maintenance_date, 
		created_at, updated_at FROM equipment ORDER BY created_at DESC`
	
	rows, err := DB.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var equipments []Equipment
	for rows.Next() {
		var e Equipment
		err := rows.Scan(
			&e.ID, &e.Name, &e.Type, &e.Model, &e.SerialNumber, &e.PurchaseDate,
			&e.Manufacturer, &e.Status, &e.Location, &e.WearPercentage,
			&e.LastMaintenanceDate, &e.NextMaintenanceDate, &e.CreatedAt, &e.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		equipments = append(equipments, e)
	}
	return equipments, nil
}

func (r *EquipmentRepository) GetByID(ctx context.Context, id int64) (*Equipment, error) {
	query := `SELECT id, name, type, model, serial_number, purchase_date, manufacturer, 
		status, location, wear_percentage, last_maintenance_date, next_maintenance_date, 
		created_at, updated_at FROM equipment WHERE id = $1`
	
	var e Equipment
	err := DB.QueryRow(ctx, query, id).Scan(
		&e.ID, &e.Name, &e.Type, &e.Model, &e.SerialNumber, &e.PurchaseDate,
		&e.Manufacturer, &e.Status, &e.Location, &e.WearPercentage,
		&e.LastMaintenanceDate, &e.NextMaintenanceDate, &e.CreatedAt, &e.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *EquipmentRepository) Create(ctx context.Context, e *Equipment) error {
	query := `INSERT INTO equipment (name, type, model, serial_number, purchase_date, 
		manufacturer, status, location, wear_percentage, last_maintenance_date, next_maintenance_date)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, created_at, updated_at`
	
	return DB.QueryRow(ctx, query,
		e.Name, e.Type, e.Model, e.SerialNumber, e.PurchaseDate,
		e.Manufacturer, e.Status, e.Location, e.WearPercentage,
		e.LastMaintenanceDate, e.NextMaintenanceDate,
	).Scan(&e.ID, &e.CreatedAt, &e.UpdatedAt)
}

func (r *EquipmentRepository) Update(ctx context.Context, e *Equipment) error {
	query := `UPDATE equipment SET name=$2, type=$3, model=$4, serial_number=$5, 
		purchase_date=$6, manufacturer=$7, status=$8, location=$9, wear_percentage=$10,
		last_maintenance_date=$11, next_maintenance_date=$12, updated_at=$13
		WHERE id=$1`
	
	_, err := DB.Exec(ctx, query,
		e.ID, e.Name, e.Type, e.Model, e.SerialNumber, e.PurchaseDate,
		e.Manufacturer, e.Status, e.Location, e.WearPercentage,
		e.LastMaintenanceDate, e.NextMaintenanceDate, time.Now(),
	)
	return err
}

func (r *EquipmentRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM equipment WHERE id = $1`
	_, err := DB.Exec(ctx, query, id)
	return err
}
