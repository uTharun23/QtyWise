import fs from 'fs';
import config from '../config/serverConfig.js';
import { parseCSV } from '../utils/csvParser.js';

const categoryIcons = {
  'Leafy Vegetables': '🥬',
  'Fruit Vegetables': '🍅',
  'Root Vegetables': '🥔',
  'Gourds': '🥒',
  'Beans & Pods': '🫘',
  'Bulbs & Aromatics': '🧅',
  'Herbs': '🌿',
  'Mushrooms': '🍄',
  'Meat': '🥩',
  'Fish': '🐟',
  'Seafood': '🦐',
  'Eggs': '🥚'
};

function getCategoryIcon(category) {
  return categoryIcons[category] || '🥗';
}

class CatalogService {
  constructor() {
    this.categories = [];
    this.items = [];
    this.itemsMap = new Map();
    this.initialized = false;
  }

  /**
   * Initializes the catalog service by loading categories and items from disk.
   */
  initialize() {
    if (this.initialized) return;

    try {
      console.log(`[CatalogService] Initializing master data...`);
      
      // 1. Load Categories
      console.log(`[CatalogService] Loading categories from: ${config.categoriesPath}`);
      const categoriesRaw = fs.readFileSync(config.categoriesPath, 'utf8');
      const categoriesJson = JSON.parse(categoriesRaw);
      this.categories = categoriesJson.categories || [];
      console.log(`[CatalogService] Loaded ${this.categories.length} categories.`);

      // 2. Load Items
      console.log(`[CatalogService] Loading items from: ${config.masterDataPath}`);
      const itemsRaw = fs.readFileSync(config.masterDataPath, 'utf8');
      const itemsParsed = parseCSV(itemsRaw);
      
      // Standardize and enrich items
      this.items = itemsParsed.map(item => {
        const isKg = item.measurement_unit === 'kg';
        const isUnit = item.measurement_unit === 'unit';

        // Convert weekly average consumption, min and max bounds to system integer grams/counts
        const weeklyConsumption = parseFloat(item.avg_weekly_consumption_pp);
        const minQty = parseFloat(item.min_quantity);
        const maxQty = parseFloat(item.max_quantity);

        const normalizedWeekly = isKg ? Math.round(weeklyConsumption * 1000) : Math.round(weeklyConsumption);
        const normalizedMin = isKg ? Math.round(minQty * 1000) : Math.round(minQty);
        const normalizedMax = isKg ? Math.round(maxQty * 1000) : Math.round(maxQty);

        // Deduce edible yield ratio based on category and subcategory
        let edibleYieldRatio = 1.00;
        const categoryLower = (item.category || '').toLowerCase();
        const subCategoryLower = (item.sub_category || '').toLowerCase();

        if (categoryLower.includes('leafy')) {
          edibleYieldRatio = 0.65; // High stem waste
        } else if (categoryLower.includes('root')) {
          edibleYieldRatio = 0.85; // Tuber/taproot peel waste
        } else if (categoryLower.includes('gourds')) {
          edibleYieldRatio = 0.90; // Seed/peel waste
        } else if (categoryLower.includes('meat') || categoryLower.includes('poultry')) {
          edibleYieldRatio = 0.80; // Bone waste
        } else if (categoryLower.includes('fish')) {
          edibleYieldRatio = 0.70; // Head, bones, scales waste
        } else if (categoryLower.includes('seafood')) {
          edibleYieldRatio = 0.60; // Heavy shell waste (prawns, crabs)
        } else if (categoryLower.includes('vegetable') || categoryLower.includes('beans') || categoryLower.includes('bulbs') || categoryLower.includes('mushrooms')) {
          edibleYieldRatio = 0.95; // Small cap/stem/peel trim
        } else if (categoryLower.includes('herbs')) {
          edibleYieldRatio = 0.80; // Stalk trim
        }

        // Establish incremental steps in grams/units
        let purchaseIncrement = 50; // default 50g increment
        if (isUnit) {
          purchaseIncrement = 1; // discrete count increment
        } else if (item.category === 'Meat' || item.category === 'Fish' || item.category === 'Seafood') {
          purchaseIncrement = 250; // meat/fish rounded to 250g blocks
        }

        // Parse shelf life numbers
        const shelfLifeAmbient = item.shelf_life_days_ambient ? parseInt(item.shelf_life_days_ambient, 10) : null;
        const shelfLifeRefrigerated = item.shelf_life_days_refrigerated ? parseInt(item.shelf_life_days_refrigerated, 10) : null;
        const shelfLifeFrozen = item.shelf_life_days_frozen ? parseInt(item.shelf_life_days_frozen, 10) : null;

        // Parse common usage array
        let commonDishes = [];
        if (item.common_household_usage) {
          commonDishes = item.common_household_usage.split('|').map(s => s.trim());
        }

        // Parse seasons list
        let seasons = [];
        if (item.season_availability) {
          seasons = item.season_availability.split('|').map(s => s.trim());
        }

        const isLeafy = (item.category || '') === 'Leafy Vegetables';
        const baseUnit = isLeafy ? 'bundle' : (isKg ? 'g' : (isUnit ? 'pcs' : (item.measurement_unit || 'g')));
        const recommendedPerPersonPerDay = normalizedWeekly / 7;

        const structuredItem = {
          item_id: item.item_id,
          english_name: item.english_name,
          telugu_name: item.telugu_name,
          category: item.category || 'Vegetables',
          subcategory: item.sub_category || '',
          base_unit: baseUnit,
          recommended_per_person_per_day: recommendedPerPersonPerDay,
          minimum_quantity: normalizedMin,
          maximum_quantity: normalizedMax,
          storage_type: item.recommended_storage || 'AMBIENT',
          aliases: item.aliases || '',
          search_keywords: item.search_keywords || '',
          icon: getCategoryIcon(item.category),
          seasonal: (item.season_availability && item.season_availability !== 'Year-Round') || false,
          availability: item.season_availability || 'Year-Round',
          
          // Preserve backward compatibility properties
          shelf_life: {
            ambient: shelfLifeAmbient,
            refrigerated: shelfLifeRefrigerated,
            frozen: shelfLifeFrozen
          },
          display_name: item.display_name,
          avg_weekly_consumption_pp_g: normalizedWeekly,
          min_purchase_qty_g: normalizedMin,
          max_quantity_g: normalizedMax,
          edible_yield_ratio: edibleYieldRatio,
          purchase_increment_g: purchaseIncrement,
          discrete_unit_weight_g: isLeafy ? 200 : (isUnit ? 55 : null),
          display_in_units: isLeafy || isUnit || baseUnit === 'pcs' || baseUnit === 'bundle',
          purchase_notes: item.purchase_notes,
          common_household_usage: commonDishes,
          season_availability: seasons,
          popularity_score: parseInt(item.popularity_score, 10) || 5,
          calculation_priority: parseInt(item.calculation_priority, 10) || 2,
          recommendation_notes: item.recommendation_notes
        };

        this.itemsMap.set(structuredItem.item_id, structuredItem);
        return structuredItem;
      });

      console.log(`[CatalogService] Successfully loaded and normalized ${this.items.length} master items.`);
      this.initialized = true;
    } catch (err) {
      console.error(`[CatalogService] Error loading master catalogs:`, err);
      throw err;
    }
  }

  getCategories() {
    this.initialize();
    return this.categories;
  }

  getItems() {
    this.initialize();
    return this.items;
  }

  getItemById(itemId) {
    this.initialize();
    return this.itemsMap.get(itemId) || null;
  }

  isValidItem(itemId) {
    this.initialize();
    return this.itemsMap.has(itemId);
  }
}

// Export singleton instance
export default new CatalogService();
