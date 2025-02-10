package controllers

import (
	"encoding/json"
	"net/http"

	"go-backend/config"
	"go-backend/models"
	"go-backend/utils"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"

	"gorm.io/gorm"
)

var RefreshTokens []string

// SignupHandler registers a new user.
func SignupHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Username string `json:"username"`
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		var existingUser models.User
		if err := db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
			http.Error(w, "User already exists", http.StatusBadRequest)
			return
		}
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Error hashing password", http.StatusInternalServerError)
			return
		}
		user := models.User{
			Username: req.Username,
			Email:    req.Email,
			Password: string(hashedPassword),
		}
		if err := db.Create(&user).Error; err != nil {
			http.Error(w, "Error creating user", http.StatusInternalServerError)
			return
		}
		user.Password = ""
		resp := map[string]interface{}{
			"message": "User created successfully",
			"user":    user,
		}
		json.NewEncoder(w).Encode(resp)
	}
}

// LoginHandler authenticates a user and returns JWT tokens.
func LoginHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		var user models.User
		if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
			http.Error(w, "Invalid email or password", http.StatusBadRequest)
			return
		}
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			http.Error(w, "Invalid email or password", http.StatusBadRequest)
			return
		}
		accessToken, err := utils.GenerateAccessToken(user.ID, config.AccessTokenSecret)
		if err != nil {
			http.Error(w, "Error generating access token", http.StatusInternalServerError)
			return
		}
		refreshToken, err := utils.GenerateRefreshToken(user.ID, config.RefreshTokenSecret)
		if err != nil {
			http.Error(w, "Error generating refresh token", http.StatusInternalServerError)
			return
		}
		RefreshTokens = append(RefreshTokens, refreshToken)
		resp := map[string]interface{}{
			"Accesstoken":  accessToken,
			"Refreshtoken": refreshToken,
		}
		json.NewEncoder(w).Encode(resp)
	}
}

// RefreshTokenHandler generates a new access token given a valid refresh token.
func RefreshTokenHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Token string `json:"token"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Token == "" {
			http.Error(w, "Token required", http.StatusUnauthorized)
			return
		}
		found := false
		for _, t := range RefreshTokens {
			if t == req.Token {
				found = true
				break
			}
		}
		if !found {
			http.Error(w, "Invalid refresh token", http.StatusForbidden)
			return
		}
		token, err := jwt.ParseWithClaims(req.Token, &utils.Claims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(config.RefreshTokenSecret), nil
		})
		if err != nil {
			http.Error(w, "Token no longer valid", http.StatusForbidden)
			return
		}
		if claims, ok := token.Claims.(*utils.Claims); ok && token.Valid {
			newAccessToken, err := utils.GenerateAccessToken(claims.UserID, config.AccessTokenSecret)
			if err != nil {
				http.Error(w, "Error generating access token", http.StatusInternalServerError)
				return
			}
			json.NewEncoder(w).Encode(map[string]interface{}{
				"Accesstoken": newAccessToken,
			})
		} else {
			http.Error(w, "Token no longer valid", http.StatusForbidden)
			return
		}
	}
}
