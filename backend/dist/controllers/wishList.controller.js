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
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushWishlistDataa = exports.getWishlistDataOfUser = exports.deleteDataFromWishlist = exports.getAllSymbolsWithIsAdded = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const pushWishlistDataa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, type } = req.body;
    try {
        // Find or create the stock
        let stock = yield prisma.stock.findUnique({ where: { symbol: name } });
        if (!stock) {
            stock = yield prisma.stock.create({
                data: {
                    symbol: name,
                    name: name, // Replace with real stock name if available
                },
            });
        }
        // Add stock to user's wishlist
        const wishlistEntry = yield prisma.wishlist.create({
            data: {
                //@ts-ignore
                userId: req.userId,
                stockId: stock.id,
                type: type
            },
        });
        console.log("data added");
        res.json({ message: "Stock added to wishlist", wishlistEntry });
    }
    catch (error) {
        console.error("Error fetching symbols with isAdded:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.pushWishlistDataa = pushWishlistDataa;
const getWishlistDataOfUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the wishlist for the user
        const wishlist = yield prisma.wishlist.findMany({
            //@ts-ignore
            where: { userId: parseInt(req.userId), type: req.body.type },
            include: { stock: true },
        });
        res.json(wishlist.map((entry) => entry.stock));
    }
    catch (error) {
        console.error("Error fetching symbols with isAdded:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getWishlistDataOfUser = getWishlistDataOfUser;
const deleteDataFromWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, type } = req.body;
    try {
        // Find the stock
        const stock = yield prisma.stock.findUnique({ where: { symbol: name } });
        if (!stock) {
            res.status(404).json({ error: "Stock not found" });
            return;
        }
        // Remove stock from wishlist
        yield prisma.wishlist.deleteMany({
            where: {
                //@ts-ignore
                userId: req.userId,
                stockId: stock.id,
                type: type
            },
        });
        res.json({ message: "Stock removed from wishlist" });
    }
    catch (error) {
        console.error("Error fetching symbols with isAdded:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.deleteDataFromWishlist = deleteDataFromWishlist;
const getAllSymbolsWithIsAdded = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allStocks = yield prisma.stock.findMany();
        // Fetch user's wishlist stocks
        const userWishlist = yield prisma.wishlist.findMany({
            //@ts-ignore
            where: { userId: parseInt(req.userId), type: req.body.type },
            select: { stockId: true },
        });
        // Create a Set of stock IDs from the wishlist for quick lookup
        const wishlistStockIds = new Set(userWishlist.map((entry) => entry.stockId));
        // Map stocks to include `isAdded` field
        const result = allStocks.map((stock) => ({
            name: stock.symbol,
            isAdded: wishlistStockIds.has(stock.id), // true if stock is in the wishlist
        }));
        res.json(result);
        return;
    }
    catch (error) {
        res.status(403).json({ error: "Internal Server Error" });
        return;
    }
});
exports.getAllSymbolsWithIsAdded = getAllSymbolsWithIsAdded;
