package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"michelin-back/internal/handler"
)

// New creates a configured Gin engine with CORS and all routes registered.
func New(h *handler.RestaurantHandler) *gin.Engine {
	r := gin.Default()

	// CORS — allow the Next.js frontend
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	// API v1 routes
	v1 := r.Group("/api/v1")
	{
		// Bounds must be registered before :id to avoid route conflict
		v1.GET("/restaurants/bounds", h.GetByBounds)
		v1.GET("/restaurants", h.ListRestaurants)
		v1.GET("/restaurants/:id", h.GetRestaurant)
		v1.GET("/regions", h.ListRegions)
		v1.GET("/cuisines", h.ListCuisines)
	}

	return r
}
