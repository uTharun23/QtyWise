import catalogService from '../services/catalogService.js';

/**
 * Middleware that validates the recommendation request payload.
 */
export function validateRecommendationRequest(req, res, next) {
  const {
    people_count,
    duration_days,
    storage_preference,
    selected_items,
    regional_profile,
    calculation_month
  } = req.body;

  const errors = [];

  // 1. Validate people_count
  if (people_count === undefined || people_count === null) {
    errors.push({ field: 'people_count', message: 'people_count is a required field' });
  } else {
    const pc = Number(people_count);
    if (!Number.isInteger(pc) || pc < 1 || pc > 50) {
      errors.push({ field: 'people_count', message: 'people_count must be an integer between 1 and 50' });
    }
  }

  // 2. Validate duration_days (Items Required For)
  if (duration_days === undefined || duration_days === null) {
    errors.push({ field: 'duration_days', message: 'duration_days (Items Required For) is a required field' });
  } else {
    const dd = Number(duration_days);
    if (!Number.isInteger(dd) || dd < 1 || dd > 30) {
      errors.push({ field: 'duration_days', message: 'duration_days (Items Required For) must be an integer between 1 and 30' });
    }
  }

  // 3. Validate storage_preference
  if (!storage_preference) {
    errors.push({ field: 'storage_preference', message: 'storage_preference is a required field' });
  } else if (storage_preference !== 'AMBIENT' && storage_preference !== 'REFRIGERATED') {
    errors.push({ field: 'storage_preference', message: 'storage_preference must be one of: AMBIENT, REFRIGERATED' });
  }

  // 4. Validate selected_items
  if (!selected_items) {
    errors.push({ field: 'selected_items', message: 'selected_items is a required field' });
  } else if (!Array.isArray(selected_items) || selected_items.length === 0) {
    errors.push({ field: 'selected_items', message: 'selected_items must be a non-empty array of item IDs' });
  } else if (selected_items.length > 100) {
    errors.push({ field: 'selected_items', message: 'selected_items array length cannot exceed 100 items' });
  } else {
    // Check duplicates and existence
    const seen = new Set();
    const invalidIds = [];
    
    selected_items.forEach(id => {
      if (typeof id !== 'string') {
        errors.push({ field: 'selected_items', message: `Item ID '${id}' must be a string` });
        return;
      }
      
      seen.add(id);
      
      if (!catalogService.isValidItem(id)) {
        invalidIds.push(id);
      }
    });

    if (seen.size !== selected_items.length) {
      errors.push({ field: 'selected_items', message: 'selected_items array cannot contain duplicate item IDs' });
    }

    if (invalidIds.length > 0) {
      errors.push({
        field: 'selected_items',
        message: `The following item IDs are invalid or do not exist: ${invalidIds.join(', ')}`
      });
    }
  }

  // 5. Validate regional_profile (Optional)
  if (regional_profile !== undefined) {
    const validRegions = ['AP_COASTAL', 'AP_RAYALASEEMA', 'AP_UTTARANDHRA', 'AP_GENERAL'];
    if (!validRegions.includes(regional_profile)) {
      errors.push({
        field: 'regional_profile',
        message: `regional_profile must be one of: ${validRegions.join(', ')}`
      });
    }
  }

  // 6. Validate calculation_month (Optional)
  if (calculation_month !== undefined) {
    const month = Number(calculation_month);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      errors.push({ field: 'calculation_month', message: 'calculation_month must be an integer between 1 and 12' });
    }
  }

  // If any errors exist, reject the request
  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_FAILED',
      message: 'Invalid request payload parameters',
      errors
    });
  }

  next();
}
