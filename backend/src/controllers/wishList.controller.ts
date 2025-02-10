import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { Request, Response } from "express";
const pushWishlistDataa = async (req: Request, res: Response) => {
  const { name ,type } = req.body;
  try {
    // Find or create the stock
    let stock = await prisma.stock.findUnique({ where: { symbol: name} });
    if (!stock) {
      stock = await prisma.stock.create({
        data: {
          symbol: name,
          name: name, // Replace with real stock name if available
        },
      });
    }

    // Add stock to user's wishlist
    const wishlistEntry = await prisma.wishlist.create({
      data: {
        //@ts-ignore
        userId: req.userId,
        stockId: stock.id,
        type: type
      },
    });
    console.log("data added")
    res.json({ message: "Stock added to wishlist", wishlistEntry });
  } catch (error) {
    console.error("Error pushing symbols: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getWishlistDataOfUser = async (req: Request, res: Response) => {
  try {
  // Get the wishlist for the user
  const wishlist = await prisma.wishlist.findMany({
    //@ts-ignore
    where: { userId: parseInt(req.userId) ,type: req.body.type},
    include: { stock: true },
  });

  res.json(wishlist.map((entry: any) => entry.stock));
} catch (error) {
  console.error("Error fetching wishlist data of user: ", error);
  res.status(500).json({ error: "Internal Server Error" });
}
};
const deleteDataFromWishlist = async (req: Request, res: Response) => {
  const { name , type } = req.body;

  try {
    // Find the stock
    const stock = await prisma.stock.findUnique({ where: { symbol: name } });
    if (!stock){
    res.status(404).json({ error: "Stock not found" });
    return
    }

    // Remove stock from wishlist
    await prisma.wishlist.deleteMany({
      where: {
        //@ts-ignore
        userId: req.userId,
        stockId: stock.id,
        type: type
      },
    });

    res.json({ message: "Stock removed from wishlist" });
  } catch (error) {
    console.error("Error removing data from wishlist: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllSymbolsWithIsAdded = async (req: Request, res: Response) => {
  try {
    const allStocks = await prisma.stock.findMany();
    // Fetch user's wishlist stocks
    const userWishlist = await prisma.wishlist.findMany({
      //@ts-ignore
      where: { userId: parseInt(req.userId) ,type: req.body.type},
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
    return
  } catch (error) {
    console.error("error getting initial wishlist of symbols : ", error);
    res.status(500).json({ error: "Internal Server Error" });
    return
  }
};
export { getAllSymbolsWithIsAdded, deleteDataFromWishlist, getWishlistDataOfUser, pushWishlistDataa }