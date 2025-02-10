package controllers

import (
	"encoding/json"
	"io/ioutil"
	"math"
	"math/rand"
	"net/http"
	"path/filepath"
	"sort"
)

// Order represents a market order.
type Order struct {
	Price    float64 `json:"price"`
	Quantity int     `json:"quantity"`
}

// MarketDepthData represents the data structure for market depth.
type MarketDepthData struct {
	LastTradePrice float64 `json:"lastTradePrice"`
	MarketDepth    struct {
		Buyers  []Order `json:"buyers,omitempty"`
		Sellers []Order `json:"sellers,omitempty"`
	} `json:"marketDepth"`
	TotalBuyersQuantity  int `json:"totalBuyersQuantity"`
	TotalSellersQuantity int `json:"totalSellersQuantity"`
}

// MarketDepthResponse wraps the market depth data.
type MarketDepthResponse struct {
	Symbol string          `json:"symbol"`
	Data   MarketDepthData `json:"data"`
}

// generateDataForSymbol simulates market depth data.
func generateDataForSymbol(symbol string, lastTradePrice float64) MarketDepthResponse {
	priceRange := 5.50
	numOrders := 5
	maxQuantity := 1000

	minBuyPrice := lastTradePrice - priceRange
	maxBuyPrice := lastTradePrice
	minSellPrice := lastTradePrice
	maxSellPrice := lastTradePrice + priceRange

	buyers := generateRandomOrders(minBuyPrice, maxBuyPrice, numOrders, maxQuantity, "desc")
	sellers := generateRandomOrders(minSellPrice, maxSellPrice, numOrders, maxQuantity, "asc")

	totalBuyersQuantity := calculateTotalQuantity(buyers)
	totalSellersQuantity := calculateTotalQuantity(sellers)

	var md MarketDepthData
	md.LastTradePrice = lastTradePrice
	md.MarketDepth.Buyers = buyers
	md.MarketDepth.Sellers = sellers
	md.TotalBuyersQuantity = totalBuyersQuantity
	md.TotalSellersQuantity = totalSellersQuantity

	return MarketDepthResponse{
		Symbol: symbol,
		Data:   md,
	}
}

func generateRandomOrders(minPrice, maxPrice float64, numOrders, maxQuantity int, sortOrder string) []Order {
	orders := []Order{}
	seenPrices := make(map[float64]bool)
	for len(orders) < numOrders {
		minMultiple := math.Ceil(minPrice / 0.05)
		maxMultiple := math.Floor(maxPrice / 0.05)
		randomMultiple := rand.Intn(int(maxMultiple-minMultiple+1)) + int(minMultiple)
		adjRandomPrice := math.Round(float64(randomMultiple)*0.05*100) / 100
		if !seenPrices[adjRandomPrice] {
			randomQuantity := rand.Intn(maxQuantity + 1)
			orders = append(orders, Order{Price: adjRandomPrice, Quantity: randomQuantity})
			seenPrices[adjRandomPrice] = true
		}
	}
	if sortOrder == "desc" {
		sort.Slice(orders, func(i, j int) bool { return orders[i].Price > orders[j].Price })
	} else {
		sort.Slice(orders, func(i, j int) bool { return orders[i].Price < orders[j].Price })
	}
	return orders
}

func calculateTotalQuantity(orders []Order) int {
	total := 0
	for _, o := range orders {
		total += o.Quantity
	}
	return total
}

// MarketDepthSymbolHandler handles POST /api/stocks/market-depth.
func MarketDepthSymbolHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Symbol string `json:"symbol"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Symbol == "" {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		dataPath := filepath.Join("data.json")
		dataBytes, err := ioutil.ReadFile(dataPath)
		if err != nil {
			http.Error(w, "Error reading data file", http.StatusInternalServerError)
			return
		}
		var fileData struct {
			Stocks []struct {
				Ticker         string  `json:"ticker"`
				LastTradePrice float64 `json:"last_trade_price"`
			} `json:"stocks"`
		}
		if err := json.Unmarshal(dataBytes, &fileData); err != nil {
			http.Error(w, "Error parsing data file", http.StatusInternalServerError)
			return
		}
		var ltp float64
		found := false
		for _, stock := range fileData.Stocks {
			if stock.Ticker == req.Symbol {
				ltp = stock.LastTradePrice
				found = true
				break
			}
		}
		if !found {
			http.Error(w, "Symbol not found", http.StatusNotFound)
			return
		}
		mdResponse := generateDataForSymbol(req.Symbol, ltp)
		json.NewEncoder(w).Encode(mdResponse)
	}
}

// StockControllerHandler handles GET /api/stocks/all.
func StockControllerHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		dataPath := filepath.Join("data.json")
		dataBytes, err := ioutil.ReadFile(dataPath)
		if err != nil {
			http.Error(w, "Error reading data file", http.StatusInternalServerError)
			return
		}
		var fileData struct {
			Stocks []struct {
				Ticker         string  `json:"ticker"`
				LastTradePrice float64 `json:"last_trade_price"`
			} `json:"stocks"`
		}
		if err := json.Unmarshal(dataBytes, &fileData); err != nil {
			http.Error(w, "Error parsing data file", http.StatusInternalServerError)
			return
		}
		var responses []MarketDepthResponse
		for _, stock := range fileData.Stocks {
			resp := generateDataForSymbol(stock.Ticker, stock.LastTradePrice)
			responses = append(responses, resp)
		}
		json.NewEncoder(w).Encode(responses)
	}
}
