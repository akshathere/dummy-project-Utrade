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
exports.GetFreshAcessToken = exports.login = exports.signup = exports.deleteRefreshToken = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_access_secret_key'; // Replace with your secure secret
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_key';
let refreshTokens = [];
const deleteRefreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204);
});
exports.deleteRefreshToken = deleteRefreshToken;
// Signup
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists.' });
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create the new user
        const user = yield prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        console.log("User created, ", username, email, password);
        res.json({ message: 'User created successfully.', user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
exports.signup = signup;
// Login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'All fields are required.' });
    }
    try {
        // Find the user by email
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(400).json({ error: 'Invalid email or password.' });
        }
        // Compare passwords
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ error: 'Invalid email or password.' });
        }
        // Generate JWT token
        const Accesstoken = generateAccessToken(user === null || user === void 0 ? void 0 : user.id);
        const Refreshtoken = generateRefreshToken(user === null || user === void 0 ? void 0 : user.id);
        refreshTokens.push(Refreshtoken);
        res.status(200).json({ Accesstoken: Accesstoken, Refreshtoken: Refreshtoken });
    }
    catch (error) {
        console.error(error);
        res.status(403).json({ error: 'Internal server error.' });
    }
});
exports.login = login;
const GetFreshAcessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.body.token;
    if (refreshToken == null)
        res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken))
        res.sendStatus(403);
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_TOKEN_SECRET);
        //@ts-ignore
        const Accesstoken = generateAccessToken(decoded.userId);
        res.status(200).json({ Accesstoken: Accesstoken });
        // Assuming the token payload contains `userId`
    }
    catch (error) {
        console.log("error");
        console.error("Error jwt token authentication", error);
        res.sendStatus(403).json({ error: "Token no longer valid" }); // 403 for token is not valid now
    }
});
exports.GetFreshAcessToken = GetFreshAcessToken;
function generateAccessToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '1m' });
}
function generateRefreshToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '24h' });
}
