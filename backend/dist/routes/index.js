"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRouter = exports.Router = void 0;
const express_1 = __importDefault(require("express"));
const stockController_1 = require("../controllers/stockController");
const dataController_1 = require("../controllers/dataController");
const Router = express_1.default.Router();
exports.Router = Router;
const DataRouter = express_1.default.Router();
exports.DataRouter = DataRouter;
// Route to get a stock by ticker
Router.get('/market-depth', stockController_1.StockController);
DataRouter.post('/filteredData', dataController_1.getFilteredData);
DataRouter.post('/addData', dataController_1.AddData);
DataRouter.post('/removeData', dataController_1.RemoveData);
DataRouter.get('/wishlist', dataController_1.getWishlistData);
