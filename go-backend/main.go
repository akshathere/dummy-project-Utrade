package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"go-backend/config"
	"go-backend/middleware"
	"go-backend/models"
	"go-backend/routes"

	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Seed random
	rand.Seed(time.Now().UnixNano())

	// Load configuration
	config.LoadConfig()

	// Initialize the database
	db, err := gorm.Open(postgres.Open(config.DatabaseURL), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect to database:", err)
	}
	// Auto-migrate models
	if err := db.AutoMigrate(&models.User{}, &models.Stock{}, &models.Wishlist{}); err != nil {
		log.Fatal("failed to migrate database:", err)
	}

	// Create a new router
	router := mux.NewRouter()
	// Apply global CORS middleware
	router.Use(middleware.CORSMiddleware)
	// Register routes
	routes.RegisterRoutes(router, db)

	fmt.Println("Server running on http://localhost:3000")
	log.Fatal(http.ListenAndServe(":3000", router))
}
