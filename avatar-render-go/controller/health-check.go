package controller

import "github.com/gofiber/fiber"

func HealthCheck(c *fiber.Ctx) {
	c.JSON(fiber.Map{"success": true})
}
