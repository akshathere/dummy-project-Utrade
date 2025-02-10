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
export interface MarketDepthData {
    lastTradePrice: number;
    marketDepth: {
      buyers: { price: number; quantity: number }[] | undefined;
      sellers: { price: number; quantity: number }[] | undefined;
    } | null;
  }
function generateDataForSymbol(symbol: string,lastTradePrice : number){
    const priceRange: number =  5.50; // Price Range
    const numOrders =  5; // Number of Buyers/Sellers
    const maxQuantity =  1000; // Max Quantity

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
        symbol:symbol,
        data:{
        lastTradePrice,
        marketDepth: {
            buyers,
            sellers,
        },
        totalBuyersQuantity: calculateTotalQuantity(buyers),
        totalSellersQuantity: calculateTotalQuantity(sellers),
    }
})
}

export const MarketDepthSymbol= async (req: Request , res: Response) => {
    const {symbol} = req.body
    const dataPath = path.join(__dirname, '../../data.json');
    const jsonData = await fs.readFile(dataPath, 'utf8');
    const stockData = JSON.parse(jsonData); 
    let ltp
    for (const stock of stockData.stocks) {
        if (stock.ticker === symbol) {
          ltp = stock.last_trade_price;
          console.log(ltp,symbol)
          const data= generateDataForSymbol(symbol,ltp)
          res.json(data)
          break
           // Stop the loop once the symbol is found
        }
      }
    
}




// export const StockController = async (req: Request, res: Response) => {
//     // Path to the data.json file
//     const dataPath = path.join(__dirname, '../../data.json');
//     const GeneratedStocksData :{ symbol: string; data: MarketDepthData }[]= []
//         try {
//             // Define the Binance API URL for fetching market data
//             const jsonData = await fs.readFile(dataPath, 'utf8'); // Read the file as a string
//             const stockData = JSON.parse(jsonData); 
            
//             stockData.stocks.forEach((stock :Stock) => {
//                 const ticker = stock.ticker;
//                 const lastTradePrice = stock.last_trade_price;
//                 GeneratedStocksData.push( generateDataForSymbol(ticker,lastTradePrice))
//             });
//             // Respond with the fetched and generated data
//             res.json(GeneratedStocksData);
//         } catch (error: any) {
//             console.error('Error fetching data from Binance API:', error.message);
//             res.status(500).json({ error: 'Failed to fetch data from API', details: error.message });
//         }
// }

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
