import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { Request,Response } from "express";
const pushWishlistDataa =  async (req:Request, res:Response) => {
    const { userId, stockSymbol } = req.body;
  
    // Find or create the stock
    let stock = await prisma.stock.findUnique({ where: { symbol: stockSymbol } });
    if (!stock) {
      stock = await prisma.stock.create({
        data: {
          symbol: stockSymbol,
          name: stockSymbol, // Replace with real stock name if available
        },
      });
    }
  
    // Add stock to user's wishlist
    const wishlistEntry = await prisma.wishlist.create({
      data: {
        userId,
        stockId: stock.id,
      },
    });
  
    res.json({ message: "Stock added to wishlist", wishlistEntry });
  };
const getWishlistDataOfUser= async (req :Request, res: Response) => {
    const { userId } = req.params;
  
    // Get the wishlist for the user
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: parseInt(userId) },
      include: { stock: true },
    });
  
    res.json(wishlist.map((entry:any) => entry.stock));
  };
const deleteDataFromWishlist=async (req : Request, res : Response) => {
    const { userId, stockSymbol } = req.body;
  
    // Find the stock
    const stock = await prisma.stock.findUnique({ where: { symbol: stockSymbol } });
    if (!stock) return res.status(404).json({ error: "Stock not found" });
  
    // Remove stock from wishlist
    await prisma.wishlist.deleteMany({
      where: {
        userId,
        stockId: stock.id,
      },
    });
  
    res.json({ message: "Stock removed from wishlist" });
  };