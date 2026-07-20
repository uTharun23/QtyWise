-- PostgreSQL Master Data Schema DDL for QtyWise

CREATE TABLE master_items (
    item_id VARCHAR(15) PRIMARY KEY CONSTRAINT check_item_id CHECK (item_id ~ '^QTY-AP-[A-Z]{3}-[0-9]{4}$'),
    english_name VARCHAR(50) UNIQUE NOT NULL CONSTRAINT check_english_name CHECK (english_name ~ '^[A-Z][a-zA-Z\s()]+$'),
    telugu_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(25) NOT NULL CHECK (category IN ('Vegetables', 'Leafy Vegetables', 'Root Vegetables', 'Meat', 'Fish', 'Seafood', 'Eggs', 'Herbs')),
    sub_category VARCHAR(50) NOT NULL,
    measurement_unit VARCHAR(10) NOT NULL CHECK (measurement_unit IN ('kg', 'g', 'unit')),
    shelf_life_days JSONB NOT NULL,
    recommended_storage VARCHAR(25) NOT NULL CHECK (recommended_storage IN ('Ambient Dry', 'Ambient Ventilated', 'Refrigerated', 'Frozen')),
    avg_weekly_consumption_pp NUMERIC(5,2) NOT NULL CHECK (avg_weekly_consumption_pp > 0),
    min_quantity NUMERIC(5,2) NOT NULL CHECK (min_quantity > 0),
    max_quantity NUMERIC(5,2) NOT NULL CHECK (max_quantity > 0),
    purchase_notes TEXT,
    common_household_usage JSONB,
    season_availability JSONB,
    popularity_score INTEGER NOT NULL CHECK (popularity_score BETWEEN 1 AND 10),
    calculation_priority INTEGER NOT NULL CHECK (calculation_priority BETWEEN 1 AND 3),
    recommendation_notes TEXT,
    CONSTRAINT check_quantities CHECK (min_quantity <= avg_weekly_consumption_pp AND avg_weekly_consumption_pp <= max_quantity)
);

-- Indexing for lookup performance
CREATE INDEX idx_master_items_category ON master_items(category);
CREATE INDEX idx_master_items_english_name ON master_items(english_name);
