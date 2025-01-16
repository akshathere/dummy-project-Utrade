import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';

interface Stock {
    "ticker": string,
    "last_trade_price": number,
    "data": Array<{
        "volume": number,
        "bid": number,
        "ask": number,
        "bid_volume": number,
        "ask_volume": number
    }>
}

export const StockController = async (req: Request, res: Response) => {
    const { symbol } = req.params;
    const priceRange: number = parseFloat(req.query.priceRange as string) || 5.50; // Price Range
    const numOrders = parseInt(req.query.numOrders as string) || 5; // Number of Buyers/Sellers
    const maxQuantity = parseInt(req.query.maxQuantity as string) || 1000; // Max Quantity


    // Path to the data.json file
    const dataPath = path.join(__dirname, '../../data.json');

        try {
            // Define the Binance API URL for fetching market data
            const formattedSymbol = symbol.toUpperCase(); // Ensure compatibility with Binance API
            
            const jsonData = await fs.readFile(dataPath, 'utf8'); // Read the file as a string
            const stockData = JSON.parse(jsonData); 

            const response = stockData.stocks.find((stock: Stock) => stock.ticker === formattedSymbol);


            const lastTradePrice = parseFloat(response.last_trade_price);

            // Calculate the price ranges for generating random buy and sell prices
            const minBuyPrice = lastTradePrice - priceRange; // Min buy price
            const maxBuyPrice = lastTradePrice; // Max buy price
            const minSellPrice = lastTradePrice; // Min sell price
            const maxSellPrice = lastTradePrice + priceRange; // Max sell price

            // Generate random buy prices and quantities
            const buyers = generateRandomOrders(minBuyPrice, maxBuyPrice, numOrders, maxQuantity, 'desc');

            // Generate random sell prices and quantities
            const sellers = generateRandomOrders(minSellPrice, maxSellPrice, numOrders, maxQuantity, 'asc');

            // Respond with the fetched and generated data
            res.json({
                lastTradePrice,
                marketDepth: {
                    buyers,
                    sellers,
                },
                totalBuyersQuantity: calculateTotalQuantity(buyers),
                totalSellersQuantity: calculateTotalQuantity(sellers),
            });
        } catch (error: any) {
            console.error('Error fetching data from Binance API:', error.message);
            res.status(500).json({ error: 'Failed to fetch data from API', details: error.message });
        }
}

function generateRandomOrders(minPrice: number, maxPrice: number, numOrders: number, maxQuantity: number, sortOrder: string) {
    const orders = [];
    interface Order { price: number, quantity: number }
    const seenPrices = new Set(); // To ensure unique prices that are multiples of 0.05

    while (orders.length < numOrders) {
        // Generate a random price within the range and round to nearest 0.05

        const minMultiple = Math.ceil(minPrice / 0.05);
        const maxMultiple = Math.floor(maxPrice / 0.05);
        const randomPrice = globalThis.Math.floor(Math.random() * (maxMultiple - minMultiple + 1)) + minMultiple;
        const adjRandomPrice = parseFloat((randomPrice * 0.05).toFixed(2))
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
    } else if (sortOrder === 'asc') {
        orders.sort((a, b) => a.price - b.price); // Ascending order for sellers
    }
    return orders;
}
function calculateTotalQuantity(orderBook: { quantity: number }[]) {
    return orderBook.reduce((total, order) => total + order.quantity, 0);
}
