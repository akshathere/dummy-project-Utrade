import express from 'express';
import { StockController } from '../controllers/stockController';
const router = express.Router();

// Route to get a stock by ticker
router.get('/market-depth/:symbol', StockController);

// Export the router
export default router;