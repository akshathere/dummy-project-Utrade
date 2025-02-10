import  express, { NextFunction, Request, Response } from 'express';
import  cors  from 'cors';
import {Auth, DataRouter, Router} from './routes/index';
import errorMiddleware from "./middleware/error.middleware";
import path from 'path';
import { authenticate } from './middleware/authentication.middleware';
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
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
app.use('/api/auth',Auth)
app.use('/api/stocks',Router ); // All stock-related routes
app.use('/mm',DataRouter); 
app.use('/data', express.static(path.join(__dirname, '../data.json')));

// Error handling middleware
app.use(errorMiddleware);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


