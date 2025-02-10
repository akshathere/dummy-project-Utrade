package controllers

import (
	"encoding/json"
	"net/http"

	"go-backend/middleware"
	"go-backend/models"

	"gorm.io/gorm"
)

// GetProfileDataHandler handles GET /mm/profile.
func GetProfileDataHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := middleware.GetUserIDFromContext(r)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		var user models.User
		if err := db.Preload("Wishlists.Stock").First(&user, userID).Error; err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		json.NewEncoder(w).Encode(user)
	}
}
