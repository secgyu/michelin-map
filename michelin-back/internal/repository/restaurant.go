package repository

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"sort"
	"strings"

	"michelin-back/internal/model"
)

// RestaurantRepository provides in-memory access to restaurant data loaded from JSON.
type RestaurantRepository struct {
	restaurants []model.Restaurant
	regions     []string
	cuisines    []string
}

// NewRestaurantRepository loads restaurant data from the given JSON file path.
func NewRestaurantRepository(filePath string) (*RestaurantRepository, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read data file: %w", err)
	}

	var restaurants []model.Restaurant
	if err := json.Unmarshal(data, &restaurants); err != nil {
		return nil, fmt.Errorf("failed to parse JSON data: %w", err)
	}

	repo := &RestaurantRepository{restaurants: restaurants}
	repo.buildIndexes()
	return repo, nil
}

// buildIndexes extracts unique regions and cuisines from the dataset.
func (r *RestaurantRepository) buildIndexes() {
	regionSet := make(map[string]bool)
	cuisineSet := make(map[string]bool)

	for _, rest := range r.restaurants {
		if rest.Region != "" {
			regionSet[rest.Region] = true
		}
		if rest.Cuisine != "" {
			for _, c := range splitAndTrim(rest.Cuisine) {
				cuisineSet[c] = true
			}
		}
	}

	r.regions = mapKeys(regionSet)
	r.cuisines = mapKeys(cuisineSet)
	sort.Strings(r.regions)
	sort.Strings(r.cuisines)
}

// ListFilter defines query parameters for filtering restaurants.
type ListFilter struct {
	Rating  string
	Region  string
	Cuisine string
	Search  string
	Limit   int
	Offset  int
}

// List returns filtered and paginated restaurants.
func (r *RestaurantRepository) List(f ListFilter) ([]model.Restaurant, int) {
	filtered := r.filter(f)
	total := len(filtered)

	if f.Limit <= 0 {
		f.Limit = 20
	}
	if f.Offset < 0 {
		f.Offset = 0
	}
	if f.Offset >= total {
		return []model.Restaurant{}, total
	}

	end := f.Offset + f.Limit
	if end > total {
		end = total
	}

	return filtered[f.Offset:end], total
}

// GetByID returns a single restaurant by ID.
func (r *RestaurantRepository) GetByID(id int) (*model.Restaurant, bool) {
	for i := range r.restaurants {
		if r.restaurants[i].ID == id {
			return &r.restaurants[i], true
		}
	}
	return nil, false
}

// BoundsFilter defines map boundary parameters.
type BoundsFilter struct {
	SWLat float64
	SWLng float64
	NELat float64
	NELng float64
}

// GetByBounds returns restaurants within the given geographic bounds.
func (r *RestaurantRepository) GetByBounds(b BoundsFilter) []model.Restaurant {
	var result []model.Restaurant
	for _, rest := range r.restaurants {
		if rest.Latitude >= b.SWLat && rest.Latitude <= b.NELat &&
			rest.Longitude >= b.SWLng && rest.Longitude <= b.NELng {
			result = append(result, rest)
		}
	}
	return result
}

// Regions returns all unique region names.
func (r *RestaurantRepository) Regions() []string {
	return r.regions
}

// Cuisines returns all unique cuisine names.
func (r *RestaurantRepository) Cuisines() []string {
	return r.cuisines
}

// filter applies all filter criteria and returns matching restaurants.
func (r *RestaurantRepository) filter(f ListFilter) []model.Restaurant {
	var result []model.Restaurant

	searchLower := strings.ToLower(f.Search)

	for _, rest := range r.restaurants {
		if f.Rating != "" && string(rest.Rating) != f.Rating {
			continue
		}
		if f.Region != "" && !strings.EqualFold(rest.Region, f.Region) {
			continue
		}
		if f.Cuisine != "" && !containsCuisine(rest.Cuisine, f.Cuisine) {
			continue
		}
		if searchLower != "" && !matchesSearch(rest, searchLower) {
			continue
		}
		result = append(result, rest)
	}

	// Sort: higher rating first, then alphabetical
	sort.Slice(result, func(i, j int) bool {
		ri := ratingOrder(result[i].Rating)
		rj := ratingOrder(result[j].Rating)
		if ri != rj {
			return ri < rj
		}
		return result[i].Name < result[j].Name
	})

	return result
}

// matchesSearch checks if a restaurant matches the search query.
func matchesSearch(r model.Restaurant, query string) bool {
	return strings.Contains(strings.ToLower(r.Name), query) ||
		strings.Contains(strings.ToLower(r.NameEn), query) ||
		strings.Contains(strings.ToLower(r.Cuisine), query) ||
		strings.Contains(strings.ToLower(r.Address), query) ||
		strings.Contains(strings.ToLower(r.Region), query)
}

// containsCuisine checks if the restaurant's cuisine list contains the target.
func containsCuisine(cuisines, target string) bool {
	for _, c := range splitAndTrim(cuisines) {
		if strings.EqualFold(c, target) {
			return true
		}
	}
	return false
}

// ratingOrder returns sort priority (lower = higher priority).
func ratingOrder(r model.Rating) int {
	switch r {
	case model.RatingThreeStar:
		return 0
	case model.RatingTwoStar:
		return 1
	case model.RatingOneStar:
		return 2
	case model.RatingBibGourmand:
		return 3
	default:
		return 4
	}
}

// splitAndTrim splits a comma-separated string and trims whitespace.
func splitAndTrim(s string) []string {
	parts := strings.Split(s, ",")
	result := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			result = append(result, p)
		}
	}
	return result
}

// mapKeys returns sorted keys from a map.
func mapKeys(m map[string]bool) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}

// Haversine returns the distance in km between two points.
func Haversine(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371.0
	dLat := (lat2 - lat1) * math.Pi / 180
	dLon := (lon2 - lon1) * math.Pi / 180
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*math.Pi/180)*math.Cos(lat2*math.Pi/180)*
			math.Sin(dLon/2)*math.Sin(dLon/2)
	return R * 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
}
