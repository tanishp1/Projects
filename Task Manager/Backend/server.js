require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/UserRoutes');
const taskRoutes = require('./routes/TaskRoutes');
const reportRoutes = require('./routes/ReportRoutes')

const app = express();

// Middlware to handle to cors
app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods:['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders:['Content-Type','Authorization'],
    })
);

// Middleware
app.use(express.json());

// ConnectDB
connectDB();

// Route
app.use('/api/auth', authRoutes);
app.use('/api/report', reportRoutes)
app.use('/api/tasks', taskRoutes);
app.use('/api/user', userRoutes);

// Start servera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));