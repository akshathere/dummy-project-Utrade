package middleware

import (
	"context"
	"net/http"
	"strings"

	"go-backend/config"
	"go-backend/utils"

	"github.com/golang-jwt/jwt/v4"
)

type contextKey string

const userContextKey = contextKey("userId")

// Authenticate verifies the JWT token and adds the userId to the request context.
func Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Authorization token missing or invalid", http.StatusUnauthorized)
			return
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.ParseWithClaims(tokenString, &utils.Claims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(config.AccessTokenSecret), nil
		})
		if err != nil {
			http.Error(w, "Token no longer valid", http.StatusForbidden)
			return
		}
		if claims, ok := token.Claims.(*utils.Claims); ok && token.Valid {
			ctx := context.WithValue(r.Context(), userContextKey, claims.UserID)
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			http.Error(w, "Token no longer valid", http.StatusForbidden)
			return
		}
	})
}

// GetUserIDFromContext retrieves the userId from the request context.
func GetUserIDFromContext(r *http.Request) (uint, bool) {
	userID, ok := r.Context().Value(userContextKey).(uint)
	return userID, ok
}
