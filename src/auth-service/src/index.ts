// src/auth-service/src/index.ts
// TODO: Complete the Express app setup

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';

// TODO: Uncomment these after implementing:
// import 'dotenv/config';                          // Load .env FIRST (install: bun add dotenv)
// import { connectDB } from './config/mongodb.js'; // MongoDB connection
// import emailRoutes from './routes/email.js';     // Email sync + query routes

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true, // Allow cookies
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
// TODO: Uncomment after implementing email routes:
// app.use('/email', emailRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
// TODO: Connect to MongoDB before starting the server:
// connectDB().then(() => {
//     app.listen(PORT, () => {
//         console.log(`Auth service running on http://localhost:${PORT}`);
//     });
// });
// For now (before MongoDB is implemented), keep the simple version:
app.listen(PORT, () => {
    console.log(`Auth service running on http://localhost:${PORT}`);
});

export default app;
