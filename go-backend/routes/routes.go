package routes

import (
	"net/http"

	"go-backend/controllers"
	"go-backend/middleware"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// RegisterRoutes sets up the router with all endpoints.
func RegisterRoutes(router *mux.Router, db *gorm.DB) {
	// Authentication routes
	authRouter := router.PathPrefix("/api/auth").Subrouter()
	authRouter.HandleFunc("/signup", controllers.SignupHandler(db)).Methods("POST")
	authRouter.HandleFunc("/login", controllers.LoginHandler(db)).Methods("POST")
	authRouter.HandleFunc("/refresh", controllers.RefreshTokenHandler()).Methods("POST")

	// Stock routes
	stockRouter := router.PathPrefix("/api/stocks").Subrouter()
	stockRouter.HandleFunc("/market-depth", controllers.MarketDepthSymbolHandler()).Methods("POST")
	stockRouter.HandleFunc("/all", controllers.StockControllerHandler()).Methods("GET")

	// Data routes (protected)
	dataRouter := router.PathPrefix("/mm").Subrouter()
	dataRouter.Use(middleware.Authenticate)
	dataRouter.HandleFunc("/addData", controllers.PushWishlistDataHandler(db)).Methods("POST")
	dataRouter.HandleFunc("/removeData", controllers.DeleteDataFromWishlistHandler(db)).Methods("POST")
	dataRouter.HandleFunc("/wishlist", controllers.GetWishlistDataOfUserHandler(db)).Methods("POST")
	dataRouter.HandleFunc("/profile", controllers.GetProfileDataHandler(db)).Methods("GET")
	dataRouter.HandleFunc("/symbolData", controllers.GetAllSymbolsWithIsAddedHandler(db)).Methods("POST")

	// Serve static file (data.json) for /data endpoint.
	router.PathPrefix("/data").Handler(http.StripPrefix("/data", http.FileServer(http.Dir("./"))))
}
