package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Port string
}

type DatabaseConfig struct {
	URL     string
	Host    string
	Port    string
	User    string
	Password string
	DBName   string
}

type JWTConfig struct {
	Secret string
}

func Load() *Config {
	viper.AutomaticEnv()
	viper.SetDefault("PORT", "8080")
	viper.SetDefault("DATABASE_URL", "postgres://techcontrol:techcontrol_pass@localhost:5432/techcontrol_db?sslmode=disable")
	viper.SetDefault("JWT_SECRET", "change-this-secret-key")

	return &Config{
		Server: ServerConfig{
			Port: viper.GetString("PORT"),
		},
		Database: DatabaseConfig{
			URL:     viper.GetString("DATABASE_URL"),
			Host:    viper.GetString("DB_HOST"),
			Port:    viper.GetString("DB_PORT"),
			User:    viper.GetString("DB_USER"),
			Password: viper.GetString("DB_PASSWORD"),
			DBName:  viper.GetString("DB_NAME"),
		},
		JWT: JWTConfig{
			Secret: viper.GetString("JWT_SECRET"),
		},
	}
}
