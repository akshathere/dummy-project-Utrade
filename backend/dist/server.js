"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = require("./routes/index");
const error_middleware_1 = __importDefault(require("./middleware/error.middleware"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        // Set the Access-Control-* headers to handle CORS
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        // This is the key: let the browser cache the preflight for 600 seconds (10 minutes)
        res.header('Access-Control-Max-Age', '600');
        // Respond to the preflight request immediately
        res.sendStatus(204); // 204: No Content
    }
    next();
});
app.use('/api/auth', index_1.Auth);
app.use('/api/stocks', index_1.Router); // All stock-related routes
app.use('/mm', index_1.DataRouter);
app.use('/data', express_1.default.static(path_1.default.join(__dirname, '../data.json')));
// Error handling middleware
app.use(error_middleware_1.default);
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
