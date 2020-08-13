package main

import (
	"avatar-render/router"

	"github.com/gofiber/fiber"
)

func main() {
	app := fiber.New()

	router.SetupRoutesV1(app)
	app.Listen(3000)

}
