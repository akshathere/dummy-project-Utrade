import express from 'express';
import { StockController } from '../controllers/stock.controller';
import { AddData,  getFilteredData,   getWishlistData,  RemoveData } from '../controllers/data.controller';
const Router = express.Router();
const DataRouter= express.Router();
// Route to get a stock by ticker
Router.get('/market-depth', StockController);
DataRouter.post('/filteredData',getFilteredData)
DataRouter.post('/addData',AddData)
DataRouter.post('/removeData',RemoveData)
DataRouter.get('/wishlist',getWishlistData)
// router.get('/signin',)
// Export the router
export{ Router, DataRouter };