package main

import (
	"log"

	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
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
	e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Recover())
	e.Use(echoMiddleware.CORS())

	// Инициализация БД
	db, err := repository.InitDB(cfg.Database.URL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Сервисы
	userService := service.NewUserService(db, cfg.JWT.Secret)
	equipmentService := service.NewEquipmentService(db)
	repairService := service.NewRepairService(db)
	purchaseService := service.NewPurchaseService(db)
	procurementService := service.NewProcurementService()

	// Рутеры
	authHandler := handler.NewAuthHandler(userService)
	equipmentHandler := handler.NewEquipmentHandler(equipmentService)
	repairHandler := handler.NewRepairHandler(repairService)
	purchaseHandler := handler.NewPurchaseHandler(purchaseService)
	procurementHandler := handler.NewProcurementHandler(procurementService)

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
	api.POST("/purchase/tasks/generate", purchaseHandler.GenerateAutoTasks)
	api.GET("/purchase/stats", purchaseHandler.GetStats)

	// Закупки по 44-ФЗ
	api.POST("/procurement/calculate-nmcc", procurementHandler.CalculateNMCC)
	api.POST("/procurement/generate-nmcc", procurementHandler.DownloadNMCC)

	// Health check
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok"})
	})

	// Запуск сервера
	e.Start(":" + cfg.Server.Port)
}
