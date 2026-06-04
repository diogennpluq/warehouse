package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func InitDB(databaseURL string) (*pgxpool.Pool, error) {
	var err error
	DB, err = pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		return nil, err
	}

	// Проверка подключения
	if err := DB.Ping(context.Background()); err != nil {
		return nil, err
	}

	return DB, nil
}
