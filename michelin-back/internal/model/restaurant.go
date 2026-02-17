package model

// Rating represents the Michelin distinction level.
type Rating string

const (
	RatingThreeStar   Rating = "3-star"
	RatingTwoStar     Rating = "2-star"
	RatingOneStar     Rating = "1-star"
	RatingBibGourmand Rating = "bib-gourmand"
	RatingSelected    Rating = "selected"
)

// Restaurant represents a Michelin Guide restaurant.
type Restaurant struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	NameEn      string  `json:"name_en"`
	Rating      Rating  `json:"rating"`
	Cuisine     string  `json:"cuisine"`
	Address     string  `json:"address"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	PriceRange  int     `json:"price_range"`
	ImageURL    string  `json:"image_url"`
	Description string  `json:"description"`
	Region      string  `json:"region"`
	PhoneNumber string  `json:"phone_number,omitempty"`
	MichelinURL string  `json:"michelin_url,omitempty"`
}
