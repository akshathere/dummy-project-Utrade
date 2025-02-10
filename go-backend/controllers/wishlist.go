package controllers

import (
	"encoding/json"
	"net/http"

	"go-backend/middleware"
	"go-backend/models"

	"gorm.io/gorm"
)

// PushWishlistDataHandler adds a stock to the user's wishlist.
func PushWishlistDataHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Name string `json:"name"`
			Type string `json:"type"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		userID, ok := middleware.GetUserIDFromContext(r)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		var stock models.Stock
		if err := db.Where("symbol = ?", req.Name).First(&stock).Error; err != nil {
			// Create the stock if it doesn't exist.
			stock = models.Stock{
				Symbol: req.Name,
				Name:   req.Name,
			}
			if err := db.Create(&stock).Error; err != nil {
				http.Error(w, "Error creating stock", http.StatusInternalServerError)
				return
			}
		}
		wishlist := models.Wishlist{
			UserID:  userID,
			StockID: stock.ID,
			Type:    req.Type,
		}
		if err := db.Create(&wishlist).Error; err != nil {
			http.Error(w, "Error adding to wishlist", http.StatusInternalServerError)
			return
		}
		resp := map[string]interface{}{
			"message":       "Stock added to wishlist",
			"wishlistEntry": wishlist,
		}
		json.NewEncoder(w).Encode(resp)
	}
}

// GetWishlistDataOfUserHandler returns the stocks from the user's wishlist for a given type.
func GetWishlistDataOfUserHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Type string `json:"type"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		userID, ok := middleware.GetUserIDFromContext(r)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		var wishlists []models.Wishlist
		if err := db.Preload("Stock").Where("user_id = ? AND type = ?", userID, req.Type).Find(&wishlists).Error; err != nil {
			http.Error(w, "Error fetching wishlist", http.StatusInternalServerError)
			return
		}
		var stocks []models.Stock
		for _, wl := range wishlists {
			stocks = append(stocks, wl.Stock)
		}
		json.NewEncoder(w).Encode(stocks)
	}
}

// DeleteDataFromWishlistHandler removes a stock from the user's wishlist.
func DeleteDataFromWishlistHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Name string `json:"name"`
			Type string `json:"type"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		userID, ok := middleware.GetUserIDFromContext(r)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		var stock models.Stock
		if err := db.Where("symbol = ?", req.Name).First(&stock).Error; err != nil {
			http.Error(w, "Stock not found", http.StatusNotFound)
			return
		}
		if err := db.Where("user_id = ? AND stock_id = ? AND type = ?", userID, stock.ID, req.Type).Delete(&models.Wishlist{}).Error; err != nil {
			http.Error(w, "Error removing from wishlist", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Stock removed from wishlist",
		})
	}
}

// GetAllSymbolsWithIsAddedHandler returns all stocks with an "isAdded" flag for a given wishlist type.
func GetAllSymbolsWithIsAddedHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Type string `json:"type"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		userID, ok := middleware.GetUserIDFromContext(r)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		var allStocks []models.Stock
		if err := db.Find(&allStocks).Error; err != nil {
			http.Error(w, "Error fetching stocks", http.StatusInternalServerError)
			return
		}
		var wishlists []models.Wishlist
		if err := db.Where("user_id = ? AND type = ?", userID, req.Type).Find(&wishlists).Error; err != nil {
			http.Error(w, "Error fetching wishlist", http.StatusInternalServerError)
			return
		}
		wishlistStockIDs := make(map[uint]bool)
		for _, wl := range wishlists {
			wishlistStockIDs[wl.StockID] = true
		}
		var resultList []map[string]interface{}
		for _, stock := range allStocks {
			resultList = append(resultList, map[string]interface{}{
				"name":    stock.Symbol,
				"isAdded": wishlistStockIDs[stock.ID],
			})
		}
		json.NewEncoder(w).Encode(resultList)
	}
}
