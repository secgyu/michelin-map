package main

import (
	"flag"
	"log"
	"path/filepath"

	"michelin-back/internal/crawler"
)

func main() {
	output := flag.String("output", filepath.Join("data", "restaurants.json"), "output JSON file path")
	flag.Parse()

	log.Println("Starting Michelin Guide South Korea crawler...")

	c := crawler.New()

	if err := c.Run(*output); err != nil {
		log.Fatalf("Crawler failed: %v", err)
	}

	log.Println("Crawling complete!")
}
