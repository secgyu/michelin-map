package crawler

import (
	"regexp"
	"strings"

	"github.com/gocolly/colly/v2"
	"michelin-back/internal/model"
)

// parseDetailPage extracts restaurant data from a Michelin Guide detail page.
func parseDetailPage(e *colly.XMLElement) model.Restaurant {
	r := model.Restaurant{}

	// Name
	r.Name = firstNonEmpty(e,
		"//*[@class='data-sheet__title']",
		"//*[contains(@class,'restaurant-details__heading--title')]",
		"//h1",
	)
	r.Name = trimWhitespace(r.Name)
	r.NameEn = r.Name

	// Address
	r.Address = firstNonEmpty(e,
		"//*[contains(@class,'data-sheet__block--text')][1]",
		"//*[contains(@class,'restaurant-details__heading--address')]",
	)
	r.Address = trimWhitespace(r.Address)

	// Price & Cuisine (combined in one element, separated by "·" or "•")
	priceAndCuisine := firstNonEmpty(e,
		"//div[contains(@class,'data-sheet__block--text')][2]",
		"//div[contains(@class,'restaurant-details__heading--price')]",
		"//*[contains(@class,'restaurant-details__heading-price')]",
	)
	priceAndCuisine = trimWhitespace(priceAndCuisine)
	r.PriceRange, r.Cuisine = parsePriceAndCuisine(priceAndCuisine)

	// Description
	r.Description = firstNonEmpty(e,
		"//div[contains(@class,'data-sheet__description')]",
		"//*[contains(@class,'js-show-description-text')]",
		"//div[contains(@class,'restaurant-details__description--text')]",
	)
	r.Description = trimWhitespace(r.Description)

	// Phone number
	phone := e.ChildAttr("//a[@data-event='CTA_tel']", "href")
	if phone == "" {
		phone = e.ChildAttr("//a[contains(@href,'tel:')]", "href")
	}
	r.PhoneNumber = cleanPhoneNumber(phone)

	// Coordinates from Google Maps iframe or embedded map
	lat, lng := extractCoordinates(e)
	r.Latitude = lat
	r.Longitude = lng

	// Image URL — try multiple selectors; skip common SVG icons
	for _, sel := range []string{
		"//div[contains(@class,'data-sheet__image')]//img",
		"//div[contains(@class,'masthead')]//img",
		"//picture//img",
		"//img[contains(@class,'data-sheet')]",
		"//div[contains(@class,'restaurant-details__gallery')]//img",
	} {
		candidate := e.ChildAttr(sel, "data-src")
		if candidate == "" {
			candidate = e.ChildAttr(sel, "src")
		}
		if candidate != "" && !strings.Contains(candidate, "/assets/images/icons/") && !strings.HasSuffix(candidate, ".svg") {
			r.ImageURL = candidate
			break
		}
	}
	if r.ImageURL != "" && strings.HasPrefix(r.ImageURL, "//") {
		r.ImageURL = "https:" + r.ImageURL
	}

	// Distinction / Rating from detail page
	r.Rating = extractRatingFromPage(e)

	// Region (extracted from location context or address)
	r.Region = parseRegionFromAddress(r.Address)

	return r
}

// extractRatingFromPage tries to determine the Michelin distinction from the detail page HTML.
func extractRatingFromPage(e *colly.XMLElement) model.Rating {
	distinction := firstNonEmpty(e,
		"//div[@class='data-sheet__classification-item--content'][2]",
		"//ul[contains(@class,'restaurant-details__classification--list')]//li",
		"//div[contains(@class,'restaurant__classification')]//p[contains(@class,'flex-fill')]",
	)
	distinction = strings.ToLower(trimWhitespace(distinction))

	switch {
	case strings.Contains(distinction, "3") && strings.Contains(distinction, "star"):
		return model.RatingThreeStar
	case strings.Contains(distinction, "2") && strings.Contains(distinction, "star"):
		return model.RatingTwoStar
	case strings.Contains(distinction, "1") && strings.Contains(distinction, "star"):
		return model.RatingOneStar
	case strings.Contains(distinction, "bib"):
		return model.RatingBibGourmand
	default:
		return ""
	}
}

// firstNonEmpty tries multiple XPath selectors and returns the first non-empty text.
func firstNonEmpty(e *colly.XMLElement, selectors ...string) string {
	for _, sel := range selectors {
		if text := e.ChildText(sel); text != "" {
			return text
		}
	}
	return ""
}

// parsePriceAndCuisine splits a combined string like "₩₩₩₩ · Korean" into price range and cuisine.
func parsePriceAndCuisine(s string) (int, string) {
	if s == "" {
		return 0, ""
	}

	delimiters := []string{"·", "•", "-", "|", "–", "—"}
	var parts []string
	for _, d := range delimiters {
		if strings.Contains(s, d) {
			parts = strings.SplitN(s, d, 2)
			break
		}
	}

	if len(parts) != 2 {
		return 0, trimWhitespace(s)
	}

	priceStr := trimWhitespace(parts[0])
	cuisine := trimWhitespace(parts[1])

	priceRange := countPriceSymbols(priceStr)

	return priceRange, cuisine
}

// countPriceSymbols counts currency symbols (₩, $, €, £, ¥, ฿) in a string to determine price range.
func countPriceSymbols(s string) int {
	count := 0
	for _, r := range s {
		switch r {
		case '₩', '$', '€', '£', '¥', '฿':
			count++
		}
	}
	if count == 0 {
		return 1
	}
	if count > 4 {
		return 4
	}
	return count
}

// extractCoordinates tries to find lat/lng from the page.
func extractCoordinates(e *colly.XMLElement) (float64, float64) {
	// Try JSON-LD structured data
	jsonLD := e.ChildText("//script[@type='application/ld+json']")
	if jsonLD != "" {
		lat, lng, ok := parseJSONLDCoordinates(jsonLD)
		if ok {
			return lat, lng
		}
	}

	// Try Google Maps iframe src
	iframeSrc := e.ChildAttr("//div[@class='google-map__static']/iframe", "src")
	if iframeSrc == "" {
		iframeSrc = e.ChildAttr("//iframe[contains(@src,'google.com/maps')]", "src")
	}
	if iframeSrc != "" {
		lat, lng, ok := parseMapsURL(iframeSrc)
		if ok {
			return lat, lng
		}
	}

	// Try data attributes on map div
	latStr := e.ChildAttr("//div[@id='map']", "data-lat")
	lngStr := e.ChildAttr("//div[@id='map']", "data-lng")
	if latStr != "" && lngStr != "" {
		lat, lng, ok := parseLatLng(latStr, lngStr)
		if ok {
			return lat, lng
		}
	}

	return 0, 0
}

// trimWhitespace removes excess whitespace from a string.
func trimWhitespace(s string) string {
	s = strings.TrimSpace(s)
	re := regexp.MustCompile(`\s+`)
	return re.ReplaceAllString(s, " ")
}

// cleanPhoneNumber extracts a clean phone number from a tel: link.
func cleanPhoneNumber(s string) string {
	s = strings.TrimPrefix(s, "tel:")
	s = strings.TrimSpace(s)
	return s
}

// parseRegionFromAddress extracts the region (city) from a Korean address.
func parseRegionFromAddress(address string) string {
	if address == "" {
		return ""
	}

	regionMap := map[string]string{
		"Seoul":  "Seoul",
		"서울":     "Seoul",
		"Busan":  "Busan",
		"부산":     "Busan",
		"Incheon": "Incheon",
		"인천":     "Incheon",
		"Jeju":   "Jeju",
		"제주":     "Jeju",
		"Daegu":  "Daegu",
		"대구":     "Daegu",
		"Daejeon": "Daejeon",
		"대전":     "Daejeon",
		"Gwangju": "Gwangju",
		"광주":     "Gwangju",
		"Gyeonggi": "Gyeonggi",
		"경기":      "Gyeonggi",
	}

	for keyword, region := range regionMap {
		if strings.Contains(address, keyword) {
			return region
		}
	}

	parts := strings.Split(address, ",")
	if len(parts) >= 2 {
		return trimWhitespace(parts[len(parts)-2])
	}

	return ""
}
