package crawler

import (
	"encoding/json"
	"net/url"
	"regexp"
	"strconv"
	"strings"
)

// parseJSONLDCoordinates extracts latitude/longitude from a JSON-LD script tag.
func parseJSONLDCoordinates(raw string) (float64, float64, bool) {
	// Try multiple possible JSON-LD structures
	var data map[string]interface{}
	if err := json.Unmarshal([]byte(raw), &data); err != nil {
		// Might be an array
		var arr []map[string]interface{}
		if err := json.Unmarshal([]byte(raw), &arr); err != nil {
			return 0, 0, false
		}
		for _, item := range arr {
			if lat, lng, ok := extractGeoFromJSONLD(item); ok {
				return lat, lng, true
			}
		}
		return 0, 0, false
	}
	return extractGeoFromJSONLD(data)
}

// extractGeoFromJSONLD navigates the JSON-LD object to find geo coordinates.
func extractGeoFromJSONLD(data map[string]interface{}) (float64, float64, bool) {
	// Check direct geo field
	if geo, ok := data["geo"].(map[string]interface{}); ok {
		lat, latOk := toFloat(geo["latitude"])
		lng, lngOk := toFloat(geo["longitude"])
		if latOk && lngOk {
			return lat, lng, true
		}
	}

	// Check address.geo
	if addr, ok := data["address"].(map[string]interface{}); ok {
		if geo, ok := addr["geo"].(map[string]interface{}); ok {
			lat, latOk := toFloat(geo["latitude"])
			lng, lngOk := toFloat(geo["longitude"])
			if latOk && lngOk {
				return lat, lng, true
			}
		}
	}

	// Check location.geo
	if loc, ok := data["location"].(map[string]interface{}); ok {
		if geo, ok := loc["geo"].(map[string]interface{}); ok {
			lat, latOk := toFloat(geo["latitude"])
			lng, lngOk := toFloat(geo["longitude"])
			if latOk && lngOk {
				return lat, lng, true
			}
		}
	}

	return 0, 0, false
}

// parseMapsURL extracts lat/lng from a Google Maps embed URL.
func parseMapsURL(src string) (float64, float64, bool) {
	// Try ?q=lat,lng pattern
	u, err := url.Parse(src)
	if err != nil {
		return 0, 0, false
	}

	q := u.Query().Get("q")
	if q != "" {
		parts := strings.SplitN(q, ",", 2)
		if len(parts) == 2 {
			lat, err1 := strconv.ParseFloat(strings.TrimSpace(parts[0]), 64)
			lng, err2 := strconv.ParseFloat(strings.TrimSpace(parts[1]), 64)
			if err1 == nil && err2 == nil {
				return lat, lng, true
			}
		}
	}

	// Try @lat,lng pattern in URL path
	re := regexp.MustCompile(`@(-?\d+\.\d+),(-?\d+\.\d+)`)
	if matches := re.FindStringSubmatch(src); len(matches) == 3 {
		lat, err1 := strconv.ParseFloat(matches[1], 64)
		lng, err2 := strconv.ParseFloat(matches[2], 64)
		if err1 == nil && err2 == nil {
			return lat, lng, true
		}
	}

	return 0, 0, false
}

// parseLatLng parses lat/lng strings to float64 values.
func parseLatLng(latStr, lngStr string) (float64, float64, bool) {
	lat, err1 := strconv.ParseFloat(strings.TrimSpace(latStr), 64)
	lng, err2 := strconv.ParseFloat(strings.TrimSpace(lngStr), 64)
	if err1 != nil || err2 != nil {
		return 0, 0, false
	}
	return lat, lng, true
}

// toFloat converts an interface{} to float64.
func toFloat(v interface{}) (float64, bool) {
	switch val := v.(type) {
	case float64:
		return val, true
	case string:
		f, err := strconv.ParseFloat(val, 64)
		return f, err == nil
	case json.Number:
		f, err := val.Float64()
		return f, err == nil
	default:
		return 0, false
	}
}
