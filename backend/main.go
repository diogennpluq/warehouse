package main

import (
	"log"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/techcontrol/backend/config"
	"github.com/techcontrol/backend/handler"
	"github.com/techcontrol/backend/middleware"
	"github.com/techcontrol/backend/repository"
	"github.com/techcontrol/backend/service"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	cfg := config.Load()

	// Инициализация Echo
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Инициализация БД
	db, err := repository.InitDB(cfg.Database.URL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Сервисы
	userService := service.NewUserService(db, cfg.JWT)
	equipmentService := service.NewEquipmentService(db)
	repairService := service.NewRepairService(db)
	purchaseService := service.NewPurchaseService(db)

	// Рутеры
	authHandler := handler.NewAuthHandler(userService)
	equipmentHandler := handler.NewEquipmentHandler(equipmentService)
	repairHandler := handler.NewRepairHandler(repairService)
	purchaseHandler := handler.NewPurchaseHandler(purchaseService)

	// Публичные роуты
	auth := e.Group("/api/auth")
	auth.POST("/login", authHandler.Login)
	auth.POST("/register", authHandler.Register)

	// Защищенные роуты
	api := e.Group("/api")
	api.Use(middleware.JWTAuth([]byte(cfg.JWT.Secret)))

	// API роуты
	api.POST("/auth/refresh", authHandler.Refresh)

	api.GET("/equipment", equipmentHandler.GetAll)
	api.GET("/equipment/:id", equipmentHandler.GetByID)
	api.POST("/equipment", equipmentHandler.Create)
	api.PUT("/equipment/:id", equipmentHandler.Update)
	api.DELETE("/equipment/:id", equipmentHandler.Delete)

	api.GET("/repairs", repairHandler.GetAll)
	api.GET("/repairs/:id", repairHandler.GetByID)
	api.POST("/repairs", repairHandler.Create)
	api.PUT("/repairs/:id", repairHandler.Update)

	api.GET("/purchase/tasks", purchaseHandler.GetTasks)
	api.POST("/purchase/tasks", purchaseHandler.CreateTask)
	api.PUT("/purchase/tasks/:id", purchaseHandler.UpdateTask)

	// Health check
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok"})
	})

	// Запуск сервера
	e.Start(":" + cfg.Server.Port)
}
