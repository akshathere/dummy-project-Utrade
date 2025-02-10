"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockController = exports.MarketDepthSymbol = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
function generateDataForSymbol(symbol, lastTradePrice) {
    const priceRange = 5.50; // Price Range
    const numOrders = 5; // Number of Buyers/Sellers
    const maxQuantity = 1000; // Max Quantity
    // Calculate the price ranges for generating random buy and sell prices
    const minBuyPrice = lastTradePrice - priceRange; // Min buy price
    const maxBuyPrice = lastTradePrice; // Max buy price
    const minSellPrice = lastTradePrice; // Min sell price
    const maxSellPrice = lastTradePrice + priceRange; // Max sell price
    // Generate random buy prices and quantities
    const buyers = generateRandomOrders(minBuyPrice, maxBuyPrice, numOrders, maxQuantity, 'desc');
    // Generate random sell prices and quantities
    const sellers = generateRandomOrders(minSellPrice, maxSellPrice, numOrders, maxQuantity, 'asc');
    return ({
        symbol: symbol,
        data: {
            lastTradePrice,
            marketDepth: {
                buyers,
                sellers,
            },
            totalBuyersQuantity: calculateTotalQuantity(buyers),
            totalSellersQuantity: calculateTotalQuantity(sellers),
        }
    });
}
const MarketDepthSymbol = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { symbol } = req.body;
    const dataPath = path_1.default.join(__dirname, '../../data.json');
    const jsonData = yield promises_1.default.readFile(dataPath, 'utf8');
    const stockData = JSON.parse(jsonData);
    let ltp;
    for (const stock of stockData.stocks) {
        if (stock.ticker === symbol) {
            ltp = stock.last_trade_price;
            console.log(ltp, symbol);
            const data = generateDataForSymbol(symbol, ltp);
            res.json(data);
            break;
            // Stop the loop once the symbol is found
        }
    }
});
exports.MarketDepthSymbol = MarketDepthSymbol;
const StockController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Path to the data.json file
    const dataPath = path_1.default.join(__dirname, '../../data.json');
    const GeneratedStocksData = [];
    try {
        // Define the Binance API URL for fetching market data
        const jsonData = yield promises_1.default.readFile(dataPath, 'utf8'); // Read the file as a string
        const stockData = JSON.parse(jsonData);
        stockData.stocks.forEach((stock) => {
            const ticker = stock.ticker;
            const lastTradePrice = stock.last_trade_price;
            GeneratedStocksData.push(generateDataForSymbol(ticker, lastTradePrice));
        });
        // Respond with the fetched and generated data
        res.json(GeneratedStocksData);
    }
    catch (error) {
        console.error('Error fetching data from Binance API:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from API', details: error.message });
    }
});
exports.StockController = StockController;
function generateRandomOrders(minPrice, maxPrice, numOrders, maxQuantity, sortOrder) {
    const orders = [];
    const seenPrices = new Set(); // To ensure unique prices that are multiples of 0.05
    while (orders.length < numOrders) {
        // Generate a random price within the range and round to nearest 0.05
        const minMultiple = Math.ceil(minPrice / 0.05);
        const maxMultiple = Math.floor(maxPrice / 0.05);
        const randomPrice = globalThis.Math.floor(Math.random() * (maxMultiple - minMultiple + 1)) + minMultiple;
        const adjRandomPrice = parseFloat((randomPrice * 0.05).toFixed(2));
        //   const randomPrice = Math.round((Math.random() * (maxPrice - minPrice) + minPrice) * 20) / 20;
        // Ensure the price is unique and a valid multiple of 0.05
        //   console.log(randomPrice % 0.05)
        if (!seenPrices.has(adjRandomPrice)) {
            const randomQuantity = Math.floor(Math.random() * (maxQuantity + 1)); // Random quantity [0, maxQuantity]
            orders.push({ price: adjRandomPrice, quantity: randomQuantity });
            seenPrices.add(adjRandomPrice); // Mark this price as used
        }
    }
    // Sort the prices based on the required order
    if (sortOrder === 'desc') {
        orders.sort((a, b) => b.price - a.price); // Descending order for buyers
    }
    else if (sortOrder === 'asc') {
        orders.sort((a, b) => a.price - b.price); // Ascending order for sellers
    }
    return orders;
}
function calculateTotalQuantity(orderBook) {
    return orderBook.reduce((total, order) => total + order.quantity, 0);
}
