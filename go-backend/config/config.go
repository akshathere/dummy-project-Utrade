package config

import (
	"log"
	"os"
)

var (
	AccessTokenSecret  string
	RefreshTokenSecret string
	DatabaseURL        string
)

func LoadConfig() {
	AccessTokenSecret = os.Getenv("ACCESS_TOKEN_SECRET")
	if AccessTokenSecret == "" {
		AccessTokenSecret = "your_access_secret_key"
	}
	RefreshTokenSecret = os.Getenv("REFRESH_TOKEN_SECRET")
	if RefreshTokenSecret == "" {
		RefreshTokenSecret = "your_refresh_token_key"
	}
	DatabaseURL = os.Getenv("DATABASE_URL")
	if DatabaseURL == "" {
		log.Fatal("DATABASE_URL not set")
	}
}
