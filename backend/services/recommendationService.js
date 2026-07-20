import catalogService from './catalogService.js';

class RecommendationService {
  /**
   * Calculates purchase quantities based on user demographic and duration inputs.
   * 
   * @param {Object} input - Sanitized client input parameters.
   * @returns {Object} Structured recommendation output payload.
   */
  calculateRecommendations(input) {
    const {
      people_count,
      duration_days,
      storage_preference,
      selected_items,
      regional_profile = 'AP_GENERAL',
      calculation_month = new Date().getMonth() + 1
    } = input;

    const recommendations = [];

    for (const itemId of selected_items) {
      const item = catalogService.getItemById(itemId);
      if (!item) continue;

      // 1. Portion Demand Base using standardized formula
      let baseGrams = people_count * duration_days * item.recommended_per_person_per_day;

      // Apply Large Family/Event scale adjustments (efficiency factor)
      if (people_count >= 15) {
        baseGrams = baseGrams * 0.85; // 15% portion reduction for bulk cooking efficiencies
      }

      // 2. Prep Waste Correction (Yield Factor)
      let grossGrams = baseGrams / item.edible_yield_ratio;

      // 3. Regional Multiplier Adjustments
      let regionalMultiplier = 1.0;
      const categoryLower = item.category.toLowerCase();
      if (regional_profile === 'AP_COASTAL') {
        if (categoryLower.includes('fish') || categoryLower.includes('seafood')) {
          regionalMultiplier = 1.20; // 20% higher seafood portion in coastal regions
        }
      } else if (regional_profile === 'AP_RAYALASEEMA') {
        if (categoryLower.includes('meat')) {
          regionalMultiplier = 1.20; // 20% higher meat portion in Rayalaseema
        }
      }
      grossGrams = grossGrams * regionalMultiplier;

      // 4. Seasonal Calibration Adjustments
      let seasonalMultiplier = 1.0;
      if (categoryLower.includes('leafy')) {
        // Leafy greens suffer from dry rot in summer
        if (calculation_month >= 3 && calculation_month <= 6) {
          seasonalMultiplier = 0.80; // scale down greens consumption in summer peak
        }
      } else if (categoryLower.includes('root')) {
        // Roots are popular winter staples
        if (calculation_month === 12 || calculation_month === 1 || calculation_month === 2) {
          seasonalMultiplier = 1.15; // scale up root vegetables in winter
        }
      }
      grossGrams = grossGrams * seasonalMultiplier;

      // 5. Quantization & Standard Base Quantity Calculation
      let finalQuantity = grossGrams;
      if (item.display_in_units) {
        const rawCounts = grossGrams / item.discrete_unit_weight_g;
        let finalCounts = Math.ceil(rawCounts);
        
        if (finalCounts < item.min_purchase_qty_g) {
          finalCounts = item.min_purchase_qty_g;
        }

        finalQuantity = finalCounts;
      } else {
        let finalGrams = Math.round(grossGrams);

        if (finalGrams < item.min_purchase_qty_g) {
          finalGrams = item.min_purchase_qty_g;
        } else {
          const delta = finalGrams - item.min_purchase_qty_g;
          const steps = Math.ceil(delta / item.purchase_increment_g);
          finalGrams = item.min_purchase_qty_g + (steps * item.purchase_increment_g);
        }

        finalQuantity = finalGrams;
      }

      // 6. Shelf Life Warning Validation
      let storageWarningTriggered = false;
      let storageWarningMessage = null;

      if (storage_preference === 'AMBIENT') {
        const ambientLimit = item.shelf_life.ambient;
        if (ambientLimit !== null && duration_days > ambientLimit) {
          storageWarningTriggered = true;
          storageWarningMessage = `${item.english_name} (${item.telugu_name}) has an ambient shelf life of only ${ambientLimit} day(s), which is less than your planned Items Required For of ${duration_days} day(s). Refrigerator storage is recommended, or purchase in smaller quantities.`;
        }
      }

      recommendations.push({
        item_id: item.item_id,
        english_name: item.english_name,
        telugu_name: item.telugu_name,
        category: item.category,
        sub_category: item.subcategory,
        raw_quantity: finalQuantity,
        base_unit: item.base_unit,
        storage_warning_triggered: storageWarningTriggered,
        storage_warning_message: storageWarningMessage,
        purchase_notes: item.purchase_notes,
        common_household_usage: item.common_household_usage,
        season_availability: item.season_availability,
        popularity_score: item.popularity_score,
        calculation_priority: item.calculation_priority,
        recommendation_notes: item.recommendation_notes
      });
    }

    // Sort by popularity (descending) first, then calculation priority (ascending), then English name (ascending)
    recommendations.sort((a, b) => {
      if (b.popularity_score !== a.popularity_score) {
        return b.popularity_score - a.popularity_score;
      }
      if (a.calculation_priority !== b.calculation_priority) {
        return a.calculation_priority - b.calculation_priority;
      }
      return a.english_name.localeCompare(b.english_name);
    });

    return {
      summary: {
        target_people: people_count,
        target_duration_days: duration_days,
        selected_region: regional_profile,
        calculation_month: calculation_month,
        total_items_processed: recommendations.length
      },
      recommendations
    };
  }
}

export default new RecommendationService();
