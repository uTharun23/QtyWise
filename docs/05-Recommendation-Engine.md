# QtyWise Recommendation Engine Specification

**Document Version:** 1.0.0-AP  
**Target Region:** Andhra Pradesh (Coastal Andhra, Rayalaseema, Uttarandhra)  
**Document Status:** Production-Ready Specification  
**Intended Audience:** Principal Architects, Systems Integrators, Backend Developers, Frontend Developers, QA Leads  

---

## 1. Recommendation Engine Overview

The QtyWise Recommendation Engine is the core calculation module of the application. It computes the recommended purchase quantities of vegetables, leafy vegetables, root vegetables, meat, fish, seafood, eggs, and herbs for household grocery planning. 

The calculation engine is designed to:
1.  **Process User Input**: Validate demographic counts, planning durations, and storage parameters.
2.  **Query Master Database Parameters**: Retrieve portion sizes, edible yield ratios, retail packaging limits, seasonal yield multipliers, and regional coefficients.
3.  **Execute Portion Calculations**: Translate net consumption demands into gross purchase quantities, adjusting for prep waste and regional preferences.
4.  **Enforce Retail Constraints**: Quantize raw weights into standard increments and verify storage safety limits.

The engine executes entirely client-side on the user's browser, ensuring sub-second response times and supporting offline operations.

---

## 2. Input Specification

The engine accepts a structured input payload defining the planning parameters.

### 2.1 Input Data Dictionary

| Input Param | Logical Type | Requirement | Ingestion & Validation Rules | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `people_count` | Integer | **Required** | Range: `1` to `50` (Standard household/community scale). | `4` |
| `duration_days` | Integer | **Required** | Range: `1` to `30`. | `7` |
| `storage_preference` | Enum (String) | **Required** | Value must match: `AMBIENT`, `REFRIGERATED`. | `REFRIGERATED` |
| `selected_items` | Array of Strings| **Required** | Array of unique item IDs (e.g. `QTY-AP-VEG-0001`). Max length 100. | `["QTY-AP-VEG-0001", "QTY-AP-LVE-0002"]` |
| `regional_profile` | String | **Required** | Value must match: `AP_COASTAL`, `AP_RAYALASEEMA`, `AP_UTTARANDHRA`. | `AP_RAYALASEEMA` |
| `calculation_month` | Integer | **Required** | Range: `1` (Jan) to `12` (Dec). Defaults to current calendar month. | `7` |

### 2.2 Input Parameters Deep Dive

#### 1. People Count (`people_count`)
*   **Purpose**: Define the scale of the target consumer group.
*   **Validation Rules**: Positive integer. Must be between 1 and 50. Counts above 50 are rejected to prevent calculations that exceed standard consumer volumes (catering events over 50 require distinct wholesale logic).
*   **Business Importance**: Serves as the primary linear scaling multiplier for portion calculations.

#### 2. Planning Duration (`duration_days`)
*   **Purpose**: Define the length of the consumption cycle.
*   **Validation Rules**: Positive integer. Must be between 1 and 30. Cycles exceeding 30 days are rejected (fresh produce and perishables rot within 30 days under standard household storage conditions).
*   **Business Importance**: Serves as the secondary linear scaling multiplier.

#### 3. Storage Preference (`storage_preference`)
*   **Purpose**: Declare the user's home storage equipment (refrigerator availability).
*   **Validation Rules**: Enum string: `AMBIENT` or `REFRIGERATED`.
*   **Business Importance**: Determines the shelf-life safety checks applied to the selected items.

#### 4. Selected Items (`selected_items`)
*   **Purpose**: List the target food catalog items to calculate.
*   **Validation Rules**: Array of valid item IDs. Must contain at least 1 item and no duplicates.
*   **Business Importance**: Restricts calculations to the items selected by the user.

#### 5. Regional Profile (`regional_profile`)
*   **Purpose**: Map calculations to regional eating habits.
*   **Validation Rules**: String matching registered regional codes.
*   **Business Importance**: Selects the appropriate regional portion scaling multiplier.

#### 6. Calculation Month (`calculation_month`)
*   **Purpose**: Map calculations to seasonal crop cycles.
*   **Validation Rules**: Integer between 1 and 12.
*   **Business Importance**: Selects the appropriate seasonal yield multiplier.

---

## 3. Processing Workflow

The processing pipeline processes inputs through a 6-stage verification, calculation, and formatting loop:

```
[User Input Payload]
       │
       ▼
[Stage 1: Input Validation] ──── (Fails) ───► [Reject Build & Return Errors]
       │ (Passes)
       ▼
[Stage 2: Database Parameter Retrieval]
       │
       ▼
[Stage 3: Portion Demand Calculation]
       │
       ▼
[Stage 4: Seasonality & Regional Scaling]
       │
       ▼
[Stage 5: Retail Quantization & Storage Warnings]
       │
       ▼
[Stage 6: Output Package Compilation] ───────► [Client UI Presentation]
```

*   **Stage 1: Input Validation**: Check that all required fields are present and verify parameter values against defined boundaries.
*   **Stage 2: Database Parameter Retrieval**: Query database records for the selected item IDs, retrieving baseline portion sizes, yield ratios, storage limits, and multipliers.
*   **Stage 3: Portion Demand Calculation**: Calculate the raw edible portion requirement for each item based on demographic parameters.
*   **Stage 4: Seasonality & Regional Scaling**: Adjust portion calculations using the appropriate seasonal and regional multipliers.
*   **Stage 5: Retail Quantization & Storage Warnings**: Format recommendations to match retail packaging increments, enforce minimum transaction floors, and flag items that exceed safe storage limits.
*   **Stage 6: Output Package Compilation**: Compile recommendations into a structured JSON payload for the client UI.

---

## 4. Recommendation Rules & Mathematical Framework

Portion recommendations are processed through the following mathematical steps:

### 4.1 Step 1: Base Demand Calculation

Calculates the net edible portion weight required to feed the target group for the specified duration:

$$Q_{base} = P \times D \times \text{base\_consumption\_g\_pp\_pd}$$

*   $P$: `people_count`
*   $D$: `duration_days`

### 4.2 Step 2: Prep Waste Correction

Adjusts the net consumption weight to account for preparation waste (peels, seeds, stalks, bones), yielding the raw gross weight:

$$Q_{gross} = \frac{Q_{base}}{\text{edible\_yield\_ratio}}$$

### 4.3 Step 3: Seasonality and Regional Scaling

Applies seasonal and regional multipliers to adjust portions based on local availability and habits:

$$Q_{scaled} = Q_{gross} \times \text{yield\_multiplier[month]} \times \text{portion\_multiplier[region]}$$

### 4.4 Step 4: Quantization and Retail Formatting

Rounds raw gross weights to match standard retail increments and minimum transaction limits:

#### Case A: Standard Weight Display (`display_in_units` is `false`)
*   **Condition**: If $Q_{scaled} < \text{min\_purchase\_qty\_g}$, the engine returns the minimum purchase floor:
    $$Q_{final} = \text{min\_purchase\_qty\_g}$$
*   **Condition**: If $Q_{scaled} \ge \text{min\_purchase\_qty\_g}$, the engine rounds up to the nearest standard increment:
    $$Q_{final} = \text{min\_purchase\_qty\_g} + \left( \left\lceil \frac{Q_{scaled} - \text{min\_purchase\_qty\_g}}{\text{purchase\_increment\_g}} \right\rceil \times \text{purchase\_increment\_g} \right)$$

#### Case B: Discrete Count Display (`display_in_units` is `true`)
*   **Condition**: If $Q_{scaled} < \text{min\_purchase\_qty\_g}$, the engine returns the minimum purchase floor:
    $$Q_{final} = \text{min\_purchase\_qty\_g}$$
*   **Condition**: Convert the scaled weight into discrete integer counts (rounding up):
    $$U_{raw} = \frac{\max(Q_{scaled}, \text{min\_purchase\_qty\_g})}{\text{discrete\_unit\_weight\_g}}$$
    $$U_{final} = \lceil U_{raw} \rceil$$
    $$Q_{final} = U_{final} \times \text{discrete\_unit\_weight\_g}$$

---

## 5. Input Validation Rules

The engine rejects input payloads that violate the following boundary conditions:

| Checked Param | Error Code | Validation Rule | Business Error Returned to User |
| :--- | :--- | :--- | :--- |
| `people_count` | `ERR_PC_RANGE` | Must be an integer between 1 and 50. | "People count must be between 1 and 50." |
| `duration_days` | `ERR_DD_RANGE` | Must be an integer between 1 and 30. | "Shopping duration must be between 1 and 30 days." |
| `selected_items`| `ERR_SI_EMPTY` | Array must contain $\ge 1$ item ID. | "Select at least one food item." |
| `selected_items`| `ERR_SI_MAX` | Array must contain $\le 100$ item IDs. | "Maximum 100 items can be calculated at once." |
| `storage_pref` | `ERR_SP_VALUE` | Must match `AMBIENT` or `REFRIGERATED`. | "Selected storage option is invalid." |
| `region_code` | `ERR_RC_VALUE` | Must match registered regional codes. | "Selected region option is invalid." |
| `month_index` | `ERR_MI_RANGE` | Must be an integer between 1 and 12. | "Calculation month must be between 1 and 12." |

---

## 6. Output Specification

The recommendation engine outputs a structured JSON payload containing the calculated quantities and validation alerts.

### 6.1 Output JSON Structure

```json
{
  "summary": {
    "target_people": 4,
    "target_duration_days": 7,
    "selected_region": "AP_RAYALASEEMA",
    "calculation_month": 7,
    "total_items_processed": 2
  },
  "recommendations": [
    {
      "item_id": "QTY-AP-VEG-0001",
      "english_name": "Brinjal (Local)",
      "telugu_name": "వంకాయ",
      "calculated_gross_g": 1120,
      "recommended_display_value": 1.15,
      "recommended_display_unit": "kg",
      "storage_warning_triggered": false,
      "storage_warning_message": null
    },
    {
      "item_id": "QTY-AP-EGG-0006",
      "english_name": "Country Chicken Egg",
      "telugu_name": "నాటు కోడి గుడ్డు",
      "calculated_gross_g": 660,
      "recommended_display_value": 12,
      "recommended_display_unit": "unit",
      "storage_warning_triggered": true,
      "storage_warning_message": "Ambient storage shelf life is 10 days. Refrigerator storage is recommended."
    }
  ]
}
```

---

## 7. Edge Case Handling

The engine implements fallback logic to handle boundary conditions:

### 7.1 Single Person Calculations (`people_count = 1`)
*   **Risk**: Standard portions scaled down for a single person may fall below retail purchasing minimums (e.g., calculating 15g of green chillies).
*   **Handling**: The engine applies the minimum purchase floor (`min_purchase_qty_g`), recommending standard retail portions (e.g., 100g) to align with retail availability.

### 7.2 Large Household Scale (`people_count` $\ge 15$)
*   **Risk**: Linear portion scaling for large groups can recommend excessive weights that exceed normal storage capacities (e.g., recommending 8kg of tomatoes).
*   **Handling**: The engine applies a safety factor of $0.85$ to calculations for groups of 15 or more, accounting for shared consumption efficiencies:
    $$Q_{base\_large} = Q_{base} \times 0.85$$

### 7.3 Large Events / Catering ($30 \le$ `people_count` $\le 50$)
*   **Risk**: Calculations for large events can recommend quantities that exceed typical residential storage capacities.
*   **Handling**: The engine forces `storage_preference` warnings to alert users that cold-storage preservation may be required.

### 7.4 Multi-Week Shopping Cycle (`duration_days` $\ge 14$)
*   **Risk**: Planning for durations that exceed the shelf life of fresh produce.
*   **Handling**: The engine applies storage safety checks. For items that exceed safe storage limits (e.g., leafy greens rot within 3 days under ambient storage), the engine triggers warning flags to advise the user to purchase those items in smaller, weekly increments.

---

## 8. Performance Strategy

To ensure sub-second response times on mobile web clients, the engine utilizes the following optimization patterns:
*   **In-Memory Parameter Caching**: Database portion registries are loaded into memory as static lookup tables, avoiding database queries during calculation loops.
*   **Linear Calculation Overhead**: Portion calculations are processed in a single loop over selected items ($O(N)$ execution time), allowing the engine to calculate quantities for 100 items in under $10\text{ms}$.
*   **Zero-Dependency Engine**: The engine relies on native arithmetic functions rather than external mathematical libraries, keeping code bundle sizes minimal.

---

## 9. Future Scalability

The calculation rules are structured to support future expansion:
*   **Category Parameters**: New categories (e.g., Dairy) map portion metrics directly (e.g., using density factors to convert weight recommendations into volume milliliters).
*   **Expansion of Regional Multipliers**: Adding new states or districts is handled by appending the appropriate region key to the multiplier lookup table.
*   **Adaptive Portions**: The calculation loop can accept demographic scaling factors (e.g., adjusting portions based on adult vs. child counts) without requiring structural updates.

---

## 10. Final Architectural Summary

The QtyWise Recommendation Engine Specification defines a structured calculation framework. By using native integer math in grams and applying yield, seasonal, and regional multipliers in sequence, the engine ensures recommendations remain mathematically accurate and culturally relevant.

The engine handles boundary conditions and limits to ensure purchase recommendations align with retail market standards. This calculation framework provides the recommendation engine foundation for QtyWise.
