import  express from 'express';
import  cors  from 'cors';
import {DataRouter, Router} from './routes/index';
import errorMiddleware from "./middleware/error.middleware";
import path from 'path';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
// app.use('/api/signin',AuthenticeRouter); // Signup route
// Market depth route
app.use('/api/stocks',Router ); // All stock-related routes
app.use('/mm',DataRouter); 
app.use('/data', express.static(path.join(__dirname, '../data.json')));

// Error handling middleware
app.use(errorMiddleware);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


