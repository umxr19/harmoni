import express from 'express';
import activityRoutes from './routes/activityRoutes';
import userRoutes from './routes/userRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// ... rest of the existing code ...

export default app; 