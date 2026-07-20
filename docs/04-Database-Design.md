# QtyWise Database Design Specification

**Document Version:** 1.0.0-AP  
**Target Region:** Andhra Pradesh (Coastal Andhra, Rayalaseema, Uttarandhra)  
**Document Status:** Production-Ready Specification  
**Intended Audience:** Principal Architects, Database Designers, Backend Engineers, QA Engineers  

---

## 1. Database Overview

The QtyWise application operates as a smart decision support system designed to calculate purchase quantity recommendations for household grocery procurement in Andhra Pradesh. 

To ensure system stability, scalability, and ease of vertical and horizontal expansion, the database layer must serve as the structured master registry. The data model is designed to support:
1.  **Strict Metric Representation**: Standardizing all measurements to integer grams (`g`) to prevent client-side float rounding issues.
2.  **Multi-Language Localization**: Decoupling localization data from item master definitions to allow the horizontal addition of regional languages (e.g. Telugu, Tamil, Kannada) without DDL modifications.
3.  **Dynamic Parameter Scaling**: Structuring storage rules, seasonal adjustments, and micro-regional consumption multipliers as normalized relations rather than static columns.
4.  **Schema-Less Extensions**: Utilizing JSON-based attribute maps to store category-specific properties for future grocery catalog expansions.

The blueprint described below represents the logical relational design of the database. It is database-engine-agnostic, meaning it can be implemented on standard relational engines (PostgreSQL, MySQL) or compiled into structured document databases (MongoDB) for client-side storage.

---

## 2. Relational Architecture Design

The database architecture decouples the invariant physical attributes of food items (such as yield ratios, purchase increments, and category codes) from localized vernacular terms and variable calculation coefficients.

### Logical Entity Relationship Model

```
 ┌──────────────┐          ┌─────────────────┐
 │   Category   │ 1 ─── N  │   SubCategory   │
 └──────────────┘          └────────┬────────┘
                                    │ 1
                                    │
                                    ▼ N
 ┌──────────────┐          ┌─────────────────┐          ┌─────────────────┐
 │ StorageRule  │ N ─── 1  │   MasterItem    │ 1 ─── N  │ ItemTranslation │
 └──────────────┘          └────────┬────────┘          └─────────────────┘
                                    │ 1
                    ┌───────────────┼───────────────┐
                    ▼ N             ▼ N             ▼ 1
             ┌──────────────┐┌──────────────┐┌──────────────┐
             │SeasonalityCal││RegMultiplier ││ItemExtension │
             └──────────────┘└──────────────┘└──────────────┘
```

---

## 3. Entity List & Registry

The system is organized around 8 logical entities:

1.  **Category (`Category`)**: High-level classification taxonomy (e.g. Vegetables, Meat).
2.  **SubCategory (`SubCategory`)**: Mid-level botanical or culinary classification (e.g. Tubers, Nightshades).
3.  **MasterItem (`MasterItem`)**: Central catalog registry defining the physical properties and purchase rules of food items.
4.  **ItemTranslation (`ItemTranslation`)**: Localized language translation matrix for names, synonyms, and selection criteria.
5.  **StorageRule (`StorageRule`)**: Environmental shelf-life thresholds and decay profiles.
6.  **SeasonalityCalibration (`SeasonalityCalibration`)**: Monthly consumption adjustment factors mapping production volumes.
7.  **RegionalMultiplier (`RegionalMultiplier`)**: District-level portion scaling coefficients based on local habits.
8.  **ItemExtension (`ItemExtension`)**: Dynamic data properties mapping parameters for future grocery categories.

---

## 4. Entity Descriptions & Attribute Schemas

This section outlines the attribute properties, nullability, and primary/foreign key definitions for all database entities.

### 4.1 Entity: Category
*   **Purpose**: High-level system classification grouping.
*   **Description**: Groups food items for UI categorization and dietary filtering (Vegetarian vs Non-Vegetarian).

| Attribute | Logical Type | Key Type | Nullability | Constraints & Validation |
| :--- | :--- | :--- | :--- | :--- |
| `category_id` | String | Primary Key | **NOT NULL** | 3-letter capital string (e.g., `VEG`, `MEA`). |
| `category_name` | String | Unique Key | **NOT NULL** | Title case. Max length 30 characters. |
| `is_non_veg` | Boolean | - | **NOT NULL** | Defaults to `false`. Flags categories containing meat/seafood. |

---

### 4.2 Entity: SubCategory
*   **Purpose**: Second-tier taxonomy grouping.
*   **Description**: Enables groupings in output lists (e.g. Bulbs, Legumes).

| Attribute | Logical Type | Key Type | Nullability | Constraints & Validation |
| :--- | :--- | :--- | :--- | :--- |
| `subcategory_id` | String | Primary Key | **NOT NULL** | 3-letter capital string (e.g., `SOL`, `TUB`). |
| `category_id` | String | Foreign Key | **NOT NULL** | References `Category(category_id)`. |
| `subcategory_name` | String | Unique Key | **NOT NULL** | Title case. Max length 50 characters. |

---

### 4.3 Entity: MasterItem
*   **Purpose**: Central food item specification.
*   **Description**: Holds physical portion metrics, retail constraints, and display rules.

| Attribute | Logical Type | Key Type | Nullability | Constraints & Validation |
| :--- | :--- | :--- | :--- | :--- |
| `item_id` | String | Primary Key | **NOT NULL** | Format: `QTY-[State]-[CAT]-[SEQ]`. |
| `subcategory_id` | String | Foreign Key | **NOT NULL** | References `SubCategory(subcategory_id)`. |
| `base_consumption_g_pp_pd`| Integer | - | **NOT NULL** | Grams per person per day. Range: `1` to `5000`. |
| `edible_yield_ratio` | Decimal | - | **NOT NULL** | Portion value. Range: `0.01` to `1.00`. |
| `min_purchase_qty_g` | Integer | - | **NOT NULL** | Value must be $\ge$ `purchase_increment_g`. |
| `purchase_increment_g` | Integer | - | **NOT NULL** | Integer gram step (e.g. `50`, `100`, `250`). |
| `discrete_unit_weight_g` | Integer | - | *Nullable* | Gram weight of single piece. Required if `display_in_units` is true. |
| `display_in_units` | Boolean | - | **NOT NULL** | Defaults to `false`. Renders output list in counts instead of weight. |
| `recommended_storage_type`| Enum (String) | - | **NOT NULL** | Values: `AMBIENT_DRY`, `AMBIENT_VENTILATED`, `REFRIGERATED`, `FROZEN`.|
| `popularity_score` | Integer | - | **NOT NULL** | Range: `1` to `10`. Search and ordering priority. |
| `priority_class` | Integer | - | **NOT NULL** | Range: `1` to `3` (1: Staple, 2: Regular, 3: Optional). |

---

### 4.4 Entity: ItemTranslation
*   **Purpose**: Vernacular text translation matrix.
*   **Description**: Implements language decoupling, enabling localized lookups without modifying the core dataset.

| Attribute | Logical Type | Key Type | Nullability | Constraints & Validation |
| :--- | :--- | :--- | :--- | :--- |
| `translation_id` | Integer | Primary Key | **NOT NULL** | Auto-incrementing identifier. |
| `item_id` | String | Foreign Key | **NOT NULL** | References `MasterItem(item_id)`. |
| `locale_code` | String | Unique Composite| **NOT NULL** | ISO language-country code (e.g. `en-US`, `te-IN`). |
| `localized_name` | String | Unique Composite| **NOT NULL** | Local item title (English Title Case or Telugu Unicode). Max 100. |
| `localized_synonyms` | JSON Array | - | **NOT NULL** | Array of search aliases (lowercase plain strings). |
| `selection_criteria` | String | - | **NOT NULL** | Vernacular guidelines for inspection at market. Max 300. |
| `common_dishes` | JSON Array | - | **NOT NULL** | Array of string names of local dishes. Maximum 5. |

---

### 4.5 Entity: StorageRule
*   **Purpose**: Storage-specific preservation thresholds.
*   **Description**: Declares item shelf-life limits under various storage preferences.

| Attribute | Logical Type | Key Type | Nullability | Constraints & Validation |
| :--- | :--- | :--- | :--- | :--- |
| `rule_id` | Integer | Primary Key | **NOT NULL** | Auto-incrementing identifier. |
| `item_id` | String | Foreign Key | **NOT NULL** | References `MasterItem(item_id)`. |
| `storage_environment` | Enum (String) | Unique Composite| **NOT NULL** | Values: `ambient`, `refrigerated`, `frozen`. |
| `max_safe_days` | Integer | - | *Nullable* | Maximum storage duration. `null` indicates storage is unsafe. |
| `daily_decay_factor` | Decimal | - | *Nullable* | Yield decay multiplier per day. |

---

### 4.6 Entity: SeasonalityCalibration
*   **Purpose**: Seasonal crop adjustments.
*   **Description**: Adjusts portion parameters based on monthly agricultural yields.

| Attribute | Logical Type | Key Type | Nullability | Constraints & Validation |
| :--- | :--- | :--- | :--- | :--- |
| `calibration_id` | Integer | Primary Key | **NOT NULL** | Auto-incrementing identifier. |
| `item_id` | String | Foreign Key | **NOT NULL** | References `MasterItem(item_id)`. |
| `month_index` | Integer | Unique Composite| **NOT NULL** | Range: `1` (January) to `12` (December). |
| `yield_multiplier` | Decimal | - | **NOT NULL** | Portion modifier. Range: `0.00` to `3.00`. |

---

### 4.7 Entity: RegionalMultiplier
*   **Purpose**: Micro-regional consumption adjustments.
*   **Description**: Adjusts portion sizes based on geographic culinary habits.

| Attribute | Logical Type | Key Type | Nullability | Constraints & Validation |
| :--- | :--- | :--- | :--- | :--- |
| `multiplier_id` | Integer | Primary Key | **NOT NULL** | Auto-incrementing identifier. |
| `item_id` | String | Foreign Key | **NOT NULL** | References `MasterItem(item_id)`. |
| `region_code` | String | Unique Composite| **NOT NULL** | Unique region identifier (e.g. `AP_RAYALASEEMA`, `AP_COASTAL`). |
| `portion_multiplier` | Decimal | - | **NOT NULL** | Portion modifier. Range: `0.10` to `2.50`. |

---

### 4.8 Entity: ItemExtension
*   **Purpose**: Schema-less vertical metadata sandboxing.
*   **Description**: Stores category-specific parameters (e.g. dairy fat content, spice heat indexes) without requiring table modifications.

| Attribute | Logical Type | Key Type | Nullability | Constraints & Validation |
| :--- | :--- | :--- | :--- | :--- |
| `extension_id` | String | Primary Key | **NOT NULL** | References `MasterItem(item_id)`. |
| `extended_attributes` | JSON Object | - | **NOT NULL** | Dynamic properties (spiciness rating, packaging type). |

---

## 5. Relationship Design Matrix

| Source Entity | Target Entity | Relationship Type | Key Reference | Business & Cascading Rule |
| :--- | :--- | :--- | :--- | :--- |
| `Category` | `SubCategory` | One-to-Many | `Category.category_id` | Restricts orphaned subcategories. Delete operations cascade. |
| `SubCategory` | `MasterItem` | One-to-Many | `SubCategory.subcategory_id` | Restricts orphaned items. Delete operations cascade. |
| `MasterItem` | `ItemTranslation`| One-to-Many | `MasterItem.item_id` | Restricts orphan localization logs. Delete operations cascade. |
| `MasterItem` | `StorageRule` | One-to-Many | `MasterItem.item_id` | Limits redundant definitions. Delete operations cascade. |
| `MasterItem` | `SeasonalityCal` | One-to-Many | `MasterItem.item_id` | Enforces standard calendar limits. Delete operations cascade. |
| `MasterItem` | `RegMultiplier` | One-to-Many | `MasterItem.item_id` | Restricts orphan geographic records. Delete operations cascade. |
| `MasterItem` | `ItemExtension` | One-to-One | `MasterItem.item_id` | Extends schema properties. Delete operations cascade. |

---

## 6. Data Integrity & Constraints

To maintain reliability, the system enforces the following constraints:

### 6.1 Database Referential Constraints
1.  **Uniqueness Constraints**:
    *   `Category(category_name)` must be unique.
    *   `SubCategory(subcategory_name)` must be unique.
    *   `ItemTranslation(locale_code, localized_name)` composite must be unique to prevent spelling conflicts in translation registries.
    *   `StorageRule(item_id, storage_environment)` composite must be unique.
    *   `SeasonalityCalibration(item_id, month_index)` composite must be unique.
    *   `RegionalMultiplier(item_id, region_code)` composite must be unique.
2.  **Foreign Key Constraints**:
    *   All relationships must implement `ON DELETE CASCADE` and `ON UPDATE CASCADE`. This prevents orphaned records if an item is updated or deleted.
3.  **Boundary Constraints**:
    *   All multipliers (seasonal, regional) must remain above zero: `portion_multiplier > 0` and `yield_multiplier >= 0`.
    *   The purchase constraints must be satisfied:
        $$\text{MasterItem.min\_purchase\_qty\_g} \pmod{\text{MasterItem.purchase\_increment\_g}} = 0$$

---

## 7. Performance & Indexing Strategy

To support fast load times on mobile devices, database tables must be indexed for lookups:

### 7.1 Index Allocation Design
*   **Search Acceleration Index**:
    *   *Target*: `ItemTranslation(localized_name)`
    *   *Justification*: Accelerates user text searches.
*   **Category Filtration Index**:
    *   *Target*: `MasterItem(subcategory_id)`
    *   *Justification*: Accelerates queries when filtering by category tabs.
*   **Storage Evaluation Index**:
    *   *Target*: Composite index on `StorageRule(item_id, storage_environment)`.
    *   *Justification*: Resolves safety checks when validating storage profiles.
*   **Regional Scaling Index**:
    *   *Target*: Composite index on `RegionalMultiplier(item_id, region_code)`.
    *   *Justification*: Resolves portion scaling values for localized areas.

---

## 8. Naming Standards

The database configuration utilizes these naming standards:
*   **Table Naming**: PascalCase pluralized strings (e.g. `Categories`, `SubCategories`, `MasterItems`, `ItemTranslations`).
*   **Attribute Naming**: lowercase separated by underscores (e.g. `item_id`, `localized_name`, `min_purchase_qty_g`).
*   **Foreign Key Fields**: Target entity primary key column name (e.g. `item_id` in `ItemTranslations`).
*   **Constraint Naming**: Follow the syntax `chk_[table_name]_[field_name]_[rule]`, such as `chk_master_items_yield_ratio_range`.

---

## 9. Folder & Migration Structure

To manage database migration DDLs, schemas, and testing scripts in a git repository, the following folder layout is enforced:

```
database/
├── schemas/
│   ├── postgres_master_schema.sql      # Postgres Table Definitions (DDL)
│   └── validation_schema.json          # JSON Schema config files
├── master_data/
│   ├── categories.json                 # Category definitions
│   └── ap_master_dataset_v1.0.csv      # Production CSV master records
├── migrations/
│   ├── 0001_initial_schema.sql         # Base table structure DDL
│   ├── 0002_add_translations.sql       # Translation model additions
│   └── 0003_add_regional_scaling.sql   # Regional multiplier additions
└── scripts/
    ├── compile_db_bundle.py            # Generates compiled client JSON package
    └── validate_data_integrity.py      # Verification and integrity engine
```

---

## 10. Database Versioning Strategy

Data changes are managed under the **Semantic Data Versioning** standard (`vD.M.P`):

1.  **D (Data Model Version)**: Incremented when the **logical schema changes** (e.g. adding the `ItemExtension` table or dropping attributes). Requires database migrations.
2.  **M (Major Data Version)**: Incremented when **items are added/removed** or baseline portion values (`base_consumption_g_pp_pd`) are adjusted.
3.  **P (Patch Data Version)**: Incremented for **typographical corrections, translation updates**, or selection criteria revisions.

---

## 11. Future Scalability Blueprint

This specification is designed to support the system as it scales to new categories, regions, and languages.

```
                  ┌─────────────────────────────────────┐
                  │        QtyWise Database Core        │
                  └──────────────────┬──────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│Category Expansion│        │Regional Expansion│        │Language Expansion│
│ (ItemExtension)  │        │ (RegMultiplier)  │        │(ItemTranslation) │
│ - Spices, Dairy  │        │ - Telangana, KA  │        │ - Tamil, Kannada │
└──────────────────┘        └──────────────────┘        └──────────────────┘
```

*   **Vertical Category Scaling (Spices, Dairy, Groceries)**:
    *   *Challenge*: Dairy requires volume (ml) metrics, spices require dry/whole attributes, and packaged goods require barcodes.
    *   *Solution*: The `ItemExtension` entity houses these custom properties inside `extended_attributes`. New categories map to this record without requiring database migrations.
*   **Horizontal Regional Expansion (Multi-State Profiles)**:
    *   *Challenge*: Consumers in Telangana or Tamil Nadu have different baseline portion sizes and seasonal crop cycles.
    *   *Solution*: Adding a region is handled by inserting new rows in `RegionalMultiplier` (e.g. `TG_HYDERABAD`), preventing the need to clone items.
*   **Multilingual Expansion**:
    *   *Challenge*: Launching the application in new languages.
    *   *Solution*: Decoupled text attributes are stored in `ItemTranslation` as separate rows. Translating the catalog is handled by inserting rows matching the target locale (e.g. `ta-IN` for Tamil).

---

## 12. Final Architectural Summary

The QtyWise Database Design Specification provides a normalized database structure. By decoupling core item metadata from localization files, storage profiles, seasonal cycles, and regional multipliers, the database remains scalable.

The database architecture supports fast data loading on mobile web clients, ensuring the system remains responsive. This design provides the database foundation for the development of QtyWise.
