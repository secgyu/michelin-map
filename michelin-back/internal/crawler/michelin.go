package crawler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"sync"
	"time"

	"github.com/gocolly/colly/v2"
	"github.com/gocolly/colly/v2/extensions"
	"michelin-back/internal/model"
)

// startURL holds the URL and corresponding Michelin rating for a category.
type startURL struct {
	Rating model.Rating
	URL    string
}

// Crawler orchestrates scraping Michelin Guide South Korea data.
type Crawler struct {
	collector       *colly.Collector
	detailCollector *colly.Collector
	restaurants     []model.Restaurant
	seen            map[string]bool
	mu              sync.Mutex
	idCounter       int
}

// New creates a new Crawler with sensible defaults.
func New() *Crawler {
	cacheDir := filepath.Join("cache", "michelin")

	c := colly.NewCollector(
		colly.AllowedDomains("guide.michelin.com"),
		colly.CacheDir(cacheDir),
	)

	c.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Delay:       2 * time.Second,
		RandomDelay: 1 * time.Second,
		Parallelism: 1,
	})

	extensions.RandomUserAgent(c)
	extensions.Referer(c)

	dc := c.Clone()

	return &Crawler{
		collector:       c,
		detailCollector: dc,
		restaurants:     make([]model.Restaurant, 0, 120),
		seen:            make(map[string]bool),
	}
}

// Run executes the full crawl pipeline and saves results to outputPath.
func (cr *Crawler) Run(outputPath string) error {
	urls := []startURL{
		{model.RatingThreeStar, "https://guide.michelin.com/kr/en/selection/south-korea/restaurants/3-stars-michelin"},
		{model.RatingTwoStar, "https://guide.michelin.com/kr/en/selection/south-korea/restaurants/2-stars-michelin"},
		{model.RatingOneStar, "https://guide.michelin.com/kr/en/selection/south-korea/restaurants/1-star-michelin"},
		{model.RatingBibGourmand, "https://guide.michelin.com/kr/en/selection/south-korea/restaurants/bib-gourmand"},
	}

	cr.setupListingHandlers()
	cr.setupDetailHandlers()

	for _, u := range urls {
		log.Printf("[crawl] starting category: %s", u.Rating)
		ctx := colly.NewContext()
		ctx.Put("rating", string(u.Rating))
		cr.collector.Request(http.MethodGet, u.URL, nil, ctx, nil)
	}

	cr.collector.Wait()
	cr.detailCollector.Wait()

	log.Printf("[crawl] total restaurants collected: %d", len(cr.restaurants))

	// Assign sequential IDs
	for i := range cr.restaurants {
		cr.restaurants[i].ID = i + 1
	}

	return cr.saveJSON(outputPath)
}

// setupListingHandlers registers callbacks for parsing restaurant listing pages.
func (cr *Crawler) setupListingHandlers() {
	cr.collector.OnRequest(func(r *colly.Request) {
		log.Printf("[list] visiting: %s", r.URL.String())
	})

	cr.collector.OnError(func(r *colly.Response, err error) {
		log.Printf("[list] error %d on %s: %v", r.StatusCode, r.Request.URL, err)
	})

	// Extract the total expected restaurant count from the page header (e.g., "1-48 of 113 restaurants")
	// to avoid collecting "Discover the newly added" cards at the bottom.
	cr.collector.OnXML("//h1", func(e *colly.XMLElement) {
		text := e.Text
		re := regexp.MustCompile(`of\s+(\d+)\s+restaurant`)
		if matches := re.FindStringSubmatch(text); len(matches) == 2 {
			total, _ := strconv.Atoi(matches[1])
			e.Request.Ctx.Put("expectedTotal", strconv.Itoa(total))
		}
	})

	// Each restaurant card on the listing page
	cr.collector.OnXML("//div[contains(@class, 'card__menu') and contains(@class, 'selection-card')]", func(e *colly.XMLElement) {
		// Track how many cards we've processed from this listing page
		countStr := e.Request.Ctx.Get("cardCount")
		count, _ := strconv.Atoi(countStr)
		count++
		e.Request.Ctx.Put("cardCount", strconv.Itoa(count))

		// Stop if we've exceeded the expected total for this page (max 48 per page)
		expectedStr := e.Request.Ctx.Get("expectedTotal")
		if expectedStr != "" {
			expected, _ := strconv.Atoi(expectedStr)
			pageSize := 48
			if expected < pageSize {
				pageSize = expected
			}
			if count > pageSize {
				return
			}
		}

		detailHref := e.ChildAttr(".//a[contains(@class,'link')]", "href")
		if detailHref == "" {
			detailHref = e.ChildAttr(".//a", "href")
		}
		if detailHref == "" {
			return
		}

		detailURL := e.Request.AbsoluteURL(detailHref)

		location := e.ChildText(".//div[contains(@class,'card__menu-footer--score')]")
		if location == "" {
			location = e.ChildText(".//div[contains(@class,'card__menu-footer')]//p")
		}

		rating := e.Request.Ctx.Get("rating")

		ctx := colly.NewContext()
		ctx.Put("rating", rating)
		ctx.Put("location", location)

		cr.detailCollector.Request(e.Request.Method, detailURL, nil, ctx, nil)
	})

	// Follow pagination "next page" links
	cr.collector.OnXML("//li[contains(@class,'arrow')]/a", func(e *colly.XMLElement) {
		nextURL := e.Request.AbsoluteURL(e.Attr("href"))
		log.Printf("[list] next page: %s", nextURL)
		ctx := colly.NewContext()
		ctx.Put("rating", e.Request.Ctx.Get("rating"))
		cr.collector.Request(e.Request.Method, nextURL, nil, ctx, nil)
	})

	// Alternative pagination: numbered page links
	cr.collector.OnXML("//a[contains(@class,'btn-outline-secondary') and contains(@href,'page=')]", func(e *colly.XMLElement) {
		href := e.Attr("href")
		if href != "" {
			nextURL := e.Request.AbsoluteURL(href)
			ctx := colly.NewContext()
			ctx.Put("rating", e.Request.Ctx.Get("rating"))
			cr.collector.Request(e.Request.Method, nextURL, nil, ctx, nil)
		}
	})
}

// setupDetailHandlers registers callbacks for parsing individual restaurant pages.
func (cr *Crawler) setupDetailHandlers() {
	cr.detailCollector.OnRequest(func(r *colly.Request) {
		log.Printf("[detail] visiting: %s", r.URL.String())
	})

	cr.detailCollector.OnError(func(r *colly.Response, err error) {
		log.Printf("[detail] error %d on %s: %v", r.StatusCode, r.Request.URL, err)
	})

	cr.detailCollector.OnXML("//html", func(e *colly.XMLElement) {
		restaurant := parseDetailPage(e)
		if restaurant.Name == "" {
			log.Printf("[detail] skipping (no name found): %s", e.Request.URL)
			return
		}

		// Prefer the rating extracted from the detail page HTML; fall back to URL context
		if restaurant.Rating == "" {
			restaurant.Rating = model.Rating(e.Request.Ctx.Get("rating"))
		}
		restaurant.MichelinURL = e.Request.URL.String()

		if loc := e.Request.Ctx.Get("location"); loc != "" && restaurant.Region == "" {
			restaurant.Region = loc
		}

		// Only include restaurants with a valid star/bib-gourmand rating
		if restaurant.Rating == "" {
			log.Printf("[detail] skipping (no valid distinction): %s at %s", restaurant.Name, restaurant.MichelinURL)
			return
		}

		cr.mu.Lock()
		if !cr.seen[restaurant.MichelinURL] {
			cr.seen[restaurant.MichelinURL] = true
			cr.restaurants = append(cr.restaurants, restaurant)
		}
		cr.mu.Unlock()

		log.Printf("[detail] collected: %s (%s)", restaurant.Name, restaurant.Rating)
	})
}

// saveJSON writes the collected restaurants to a JSON file.
func (cr *Crawler) saveJSON(outputPath string) error {
	dir := filepath.Dir(outputPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create output directory: %w", err)
	}

	data, err := json.MarshalIndent(cr.restaurants, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal JSON: %w", err)
	}

	if err := os.WriteFile(outputPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	log.Printf("[save] wrote %d restaurants to %s", len(cr.restaurants), outputPath)
	return nil
}
