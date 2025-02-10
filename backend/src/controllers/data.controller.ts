import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfileData = async (req: Request, res: Response) => {
  try {
    // Access the userId (ensure you’ve added it to your Express Request type)
    //@ts-ignore    
    const userId = req.userId; // or however you're attaching userId to req

    // Find the user by ID, including any nested data you want (e.g., wishlists)
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        // Include the wishlists, as an example of nested data
        wishlists: {
          select: {
            id: true,
            type: true,
            createdAt: true,
            stock: {
              select: {
                id: true,
                symbol: true,
                name: true,
              },
            },
          },
        },
      },
    });
    console.log(user)
    // If user not found, respond accordingly
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return
    }

    // Otherwise, send the user’s data
    res.json(user);
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
    return 
  }
};
