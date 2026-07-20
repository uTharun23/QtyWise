import catalogService from '../services/catalogService.js';

export function getCategories(req, res, next) {
  try {
    const categories = catalogService.getCategories();
    res.status(200).json({
      status: 'success',
      data: categories
    });
  } catch (err) {
    next(err);
  }
}

export function getItems(req, res, next) {
  try {
    const items = catalogService.getItems();
    res.status(200).json({
      status: 'success',
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
}

export function getItemById(req, res, next) {
  try {
    const item = catalogService.getItemById(req.params.id);
    if (!item) {
      const error = new Error(`Item with ID '${req.params.id}' was not found`);
      error.status = 404;
      error.code = 'ITEM_NOT_FOUND';
      throw error;
    }
    res.status(200).json({
      status: 'success',
      data: item
    });
  } catch (err) {
    next(err);
  }
}
