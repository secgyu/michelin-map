package main

import (
	"flag"
	"log"
	"path/filepath"

	"michelin-back/internal/handler"
	"michelin-back/internal/repository"
	"michelin-back/internal/router"
)

func main() {
	dataPath := flag.String("data", filepath.Join("data", "restaurants.json"), "path to restaurant JSON data")
	port := flag.String("port", "8080", "server port")
	flag.Parse()

	log.Printf("Loading restaurant data from %s...", *dataPath)
	repo, err := repository.NewRestaurantRepository(*dataPath)
	if err != nil {
		log.Fatalf("Failed to load data: %v", err)
	}

	h := handler.NewRestaurantHandler(repo)
	r := router.New(h)

	log.Printf("Starting API server on :%s", *port)
	if err := r.Run(":" + *port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
