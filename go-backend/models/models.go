package models

import "time"

type User struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	Username  string     `gorm:"unique" json:"username"`
	Email     string     `gorm:"unique" json:"email"`
	Password  string     `json:"-"`
	Wishlists []Wishlist `json:"wishlists"`
}

type Stock struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	Symbol    string     `gorm:"unique" json:"symbol"`
	Name      string     `json:"name"`
	Wishlists []Wishlist `json:"-"`
}

type Wishlist struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"userId"`
	StockID   uint      `json:"stockId"`
	Type      string    `json:"type"`
	CreatedAt time.Time `json:"createdAt"`
	Stock     Stock     `json:"stock"`
}
