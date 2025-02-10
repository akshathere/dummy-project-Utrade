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
exports.getProfileData = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProfileData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Access the userId (ensure you’ve added it to your Express Request type)
        //@ts-ignore    
        const userId = req.userId; // or however you're attaching userId to req
        // Find the user by ID, including any nested data you want (e.g., wishlists)
        const user = yield prisma.user.findUnique({
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
        console.log(user);
        // If user not found, respond accordingly
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Otherwise, send the user’s data
        res.json(user);
        return;
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
});
exports.getProfileData = getProfileData;
