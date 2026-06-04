package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
)

type User struct {
	ID           int64     `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	Email        string    `json:"email"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

func (r *UserRepository) GetByUsername(ctx context.Context, username string) (*User, error) {
	query := `SELECT id, username, password_hash, email, role, created_at, updated_at 
		FROM users WHERE username = $1`
	
	var u User
	err := DB.QueryRow(ctx, query, username).Scan(
		&u.ID, &u.Username, &u.PasswordHash, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*User, error) {
	query := `SELECT id, username, password_hash, email, role, created_at, updated_at 
		FROM users WHERE email = $1`
	
	var u User
	err := DB.QueryRow(ctx, query, email).Scan(
		&u.ID, &u.Username, &u.PasswordHash, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) Create(ctx context.Context, u *User) error {
	query := `INSERT INTO users (username, password_hash, email, role) 
		VALUES ($1, $2, $3, $4) RETURNING id, created_at, updated_at`
	
	return DB.QueryRow(ctx, query,
		u.Username, u.PasswordHash, u.Email, u.Role,
	).Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
}

func (r *UserRepository) GetByID(ctx context.Context, id int64) (*User, error) {
	query := `SELECT id, username, password_hash, email, role, created_at, updated_at 
		FROM users WHERE id = $1`
	
	var u User
	err := DB.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.Username, &u.PasswordHash, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}
