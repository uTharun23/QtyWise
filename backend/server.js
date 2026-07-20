import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/serverConfig.js';
import apiRoutes from './routes/api.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for local web clients
app.use(cors());

// Parse JSON request payloads
app.use(express.json());

// Log HTTP requests
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// Mount API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    env: config.env,
    uptime: process.uptime()
  });
});

// Default 404 Route handler for unknown endpoints
app.use((req, res, next) => {
  const error = new Error(`Cannot find endpoint '${req.originalUrl}' on this server`);
  error.status = 404;
  error.code = 'ENDPOINT_NOT_FOUND';
  next(error);
});

// Centralized error handling middleware
app.use(errorHandler);

// Start Server
app.listen(config.port, () => {
  console.log(`======================================`);
  console.log(`🚀 QtyWise Backend Started`);
  console.log(`Environment:  ${config.env.charAt(0).toUpperCase() + config.env.slice(1)}`);
  console.log(`Port:         ${config.port}`);
  console.log(`Health API:   http://localhost:${config.port}/health`);
  console.log(`Catalog API:  http://localhost:${config.port}/api/items`);
  console.log(`======================================`);
});

export default app;
