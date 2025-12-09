import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow requests from the dashboard
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.send('FlowFli Backend is running.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`FlowFli Backend listening on http://localhost:${PORT}`);
});
