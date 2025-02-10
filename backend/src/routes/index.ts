import express from 'express';
import { MarketDepthSymbol} from '../controllers/stock.controller';

import { GetFreshAcessToken, login, signup } from '../controllers/authentication.controller';
import { deleteDataFromWishlist, getAllSymbolsWithIsAdded, getWishlistDataOfUser, pushWishlistDataa } from '../controllers/wishList.controller';
import { authenticate } from '../middleware/authentication.middleware';
import { getProfileData } from '../controllers/data.controller';
const Router = express.Router();
const DataRouter= express.Router();
const Auth= express.Router();
// Route to get a stock by ticker
DataRouter.use(authenticate)
Router.post('/market-depth', MarketDepthSymbol);
// DataRouter.post('/filteredData',getFilteredData)
DataRouter.post('/addData',pushWishlistDataa)
DataRouter.post('/removeData',deleteDataFromWishlist)
DataRouter.post('/wishlist',getWishlistDataOfUser)
DataRouter.get('/profile',getProfileData)

// DataRouter.get('/getSymbols',getAllSymbols)
Auth.post('/signup',signup );
Auth.post('/login',login);
Auth.post('/refresh',GetFreshAcessToken)
DataRouter.post('/symbolData',getAllSymbolsWithIsAdded)
// router.get('/signin',)
// Export the router
export{ Router, DataRouter , Auth};