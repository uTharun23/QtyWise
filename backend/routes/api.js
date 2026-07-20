import express from 'express';
import { getCategories, getItems, getItemById } from '../controllers/catalogController.js';
import { getRecommendations } from '../controllers/recommendationController.js';
import { validateRecommendationRequest } from '../middleware/validator.js';

const router = express.Router();

// Catalog Routes
router.get('/categories', getCategories);
router.get('/items', getItems);
router.get('/items/:id', getItemById);

// Recommendation Engine Calculation Route
router.post('/recommend', validateRecommendationRequest, getRecommendations);

export default router;
