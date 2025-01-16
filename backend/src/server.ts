import  express from 'express';
import  cors  from 'cors';
import DepthRouter from './routes/index';
import errorMiddleware from "./middleware/error.middleware";
import path from 'path';

const app = express();
const PORT = 3000;

app.use(cors());
// Market depth route
app.use('/api/stocks',DepthRouter ); // All stock-related routes
app.use('/data', express.static(path.join(__dirname, '../data.json')));
// Error handling middleware
app.use(errorMiddleware);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


