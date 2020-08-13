package router

import (
	"github.com/gofiber/logger"

	"avatar-render/controller"

	"github.com/gofiber/fiber"
)

func SetupRoutesV1(app *fiber.App) {
	// Middleware
	api := app.Group("/api/v1", logger.New())
	api.Get("/health", controller.HealthCheck)
}
