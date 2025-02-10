"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_access_secret_key'; // Replace with your secure secret
const authenticate = (req, res, next) => {
    // Skip if it's an OPTIONS request, because we've handled that above
    if (req.method === 'OPTIONS') {
        next();
    }
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authorization token missing or invalid' }); // they have not send a token to us
        return;
    }
    const token = authHeader.split(' ')[1]; // Extract the token
    try {
        console.log("validating token");
        console.log(token);
        const decoded = jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
        //@ts-ignore
        req.userId = decoded.userId; // Assuming the token payload contains `userId`
    }
    catch (error) {
        console.log("token invalid");
        res.status(403).json({ error: "Token no longer valid" }); // 403 for token is not valid now
        return;
    }
    next();
};
exports.authenticate = authenticate;
