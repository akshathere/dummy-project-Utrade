"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const error_middleware_1 = __importDefault(require("./middleware/error.middleware"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
// Market depth route
app.use('/api/stocks', index_1.default); // All stock-related routes
app.use('/data', express_1.default.static(path_1.default.join(__dirname, '../data.json')));
// Error handling middleware
app.use(error_middleware_1.default);
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
