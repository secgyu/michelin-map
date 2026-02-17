package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"michelin-back/internal/repository"
)

// RestaurantHandler handles HTTP requests for restaurant data.
type RestaurantHandler struct {
	repo *repository.RestaurantRepository
}

// NewRestaurantHandler creates a new handler with the given repository.
func NewRestaurantHandler(repo *repository.RestaurantRepository) *RestaurantHandler {
	return &RestaurantHandler{repo: repo}
}

// listResponse wraps paginated restaurant data.
type listResponse struct {
	Data   interface{} `json:"data"`
	Total  int         `json:"total"`
	Limit  int         `json:"limit"`
	Offset int         `json:"offset"`
}

// ListRestaurants handles GET /api/v1/restaurants
func (h *RestaurantHandler) ListRestaurants(c *gin.Context) {
	filter := repository.ListFilter{
		Rating:  c.Query("rating"),
		Region:  c.Query("region"),
		Cuisine: c.Query("cuisine"),
		Search:  c.Query("search"),
		Limit:   queryInt(c, "limit", 20),
		Offset:  queryInt(c, "offset", 0),
	}

	restaurants, total := h.repo.List(filter)

	c.JSON(http.StatusOK, listResponse{
		Data:   restaurants,
		Total:  total,
		Limit:  filter.Limit,
		Offset: filter.Offset,
	})
}

// GetRestaurant handles GET /api/v1/restaurants/:id
func (h *RestaurantHandler) GetRestaurant(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid restaurant ID"})
		return
	}

	restaurant, found := h.repo.GetByID(id)
	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "restaurant not found"})
		return
	}

	c.JSON(http.StatusOK, restaurant)
}

// GetByBounds handles GET /api/v1/restaurants/bounds
func (h *RestaurantHandler) GetByBounds(c *gin.Context) {
	swLat, err1 := strconv.ParseFloat(c.Query("sw_lat"), 64)
	swLng, err2 := strconv.ParseFloat(c.Query("sw_lng"), 64)
	neLat, err3 := strconv.ParseFloat(c.Query("ne_lat"), 64)
	neLng, err4 := strconv.ParseFloat(c.Query("ne_lng"), 64)

	if err1 != nil || err2 != nil || err3 != nil || err4 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid bounds parameters, required: sw_lat, sw_lng, ne_lat, ne_lng"})
		return
	}

	restaurants := h.repo.GetByBounds(repository.BoundsFilter{
		SWLat: swLat,
		SWLng: swLng,
		NELat: neLat,
		NELng: neLng,
	})

	c.JSON(http.StatusOK, gin.H{
		"data":  restaurants,
		"total": len(restaurants),
	})
}

// ListRegions handles GET /api/v1/regions
func (h *RestaurantHandler) ListRegions(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": h.repo.Regions()})
}

// ListCuisines handles GET /api/v1/cuisines
func (h *RestaurantHandler) ListCuisines(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": h.repo.Cuisines()})
}

// queryInt extracts an integer query parameter with a default value.
func queryInt(c *gin.Context, key string, defaultVal int) int {
	s := c.Query(key)
	if s == "" {
		return defaultVal
	}
	v, err := strconv.Atoi(s)
	if err != nil || v < 0 {
		return defaultVal
	}
	return v
}
