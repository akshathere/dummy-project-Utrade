"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = exports.DataRouter = exports.Router = void 0;
const express_1 = __importDefault(require("express"));
const stock_controller_1 = require("../controllers/stock.controller");
const authentication_controller_1 = require("../controllers/authentication.controller");
const wishList_controller_1 = require("../controllers/wishList.controller");
const authentication_middleware_1 = require("../middleware/authentication.middleware");
const data_controller_1 = require("../controllers/data.controller");
const Router = express_1.default.Router();
exports.Router = Router;
const DataRouter = express_1.default.Router();
exports.DataRouter = DataRouter;
const Auth = express_1.default.Router();
exports.Auth = Auth;
// Route to get a stock by ticker
DataRouter.use(authentication_middleware_1.authenticate);
Router.post('/market-depth', stock_controller_1.MarketDepthSymbol);
// DataRouter.post('/filteredData',getFilteredData)
DataRouter.post('/addData', wishList_controller_1.pushWishlistDataa);
DataRouter.post('/removeData', wishList_controller_1.deleteDataFromWishlist);
DataRouter.post('/wishlist', wishList_controller_1.getWishlistDataOfUser);
DataRouter.get('/profile', data_controller_1.getProfileData);
// DataRouter.get('/getSymbols',getAllSymbols)
Auth.post('/signup', authentication_controller_1.signup);
Auth.post('/login', authentication_controller_1.login);
Auth.post('/refresh', authentication_controller_1.GetFreshAcessToken);
DataRouter.post('/symbolData', wishList_controller_1.getAllSymbolsWithIsAdded);
