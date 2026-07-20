import recommendationService from '../services/recommendationService.js';

export function getRecommendations(req, res, next) {
  try {
    const result = recommendationService.calculateRecommendations(req.body);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    next(err);
  }
}
