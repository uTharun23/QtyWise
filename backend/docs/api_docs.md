# QtyWise API Documentation

This document outlines the REST API endpoints exposed by the QtyWise backend service.

---

## Base URL
All endpoints are relative to:
```
http://localhost:5000/api
```

---

## 1. Retrieve Categories
Retrieves the two-tier category hierarchy registry for navigation filters.

*   **Endpoint**: `GET /categories`
*   **Method**: `GET`
*   **Response Headers**: `Content-Type: application/json`
*   **Success Response** (Status Code: `200 OK`):
    ```json
    {
      "status": "success",
      "data": [
        {
          "name": "Vegetables",
          "sub_categories": ["Solanaceous", "Cucurbits", "Legumes"]
        },
        {
          "name": "Leafy Vegetables",
          "sub_categories": ["Acidic Greens", "Neutral Greens"]
        }
      ]
    }
    ```

---

## 2. Retrieve Catalog Items
Retrieves all normalized food items currently registered in the master dataset.

*   **Endpoint**: `GET /items`
*   **Method**: `GET`
*   **Response Headers**: `Content-Type: application/json`
*   **Success Response** (Status Code: `200 OK`):
    ```json
    {
      "status": "success",
      "count": 6,
      "data": [
        {
          "item_id": "QTY-AP-VEG-0001",
          "english_name": "Brinjal (Local)",
          "telugu_name": "వంకాయ",
          "category": "Vegetables",
          "sub_category": "Solanaceous",
          "measurement_unit": "g",
          "shelf_life": {
            "ambient": 3,
            "refrigerated": 7,
            "frozen": null
          },
          "recommended_storage": "Ambient Ventilated",
          "avg_weekly_consumption_pp_g": 400,
          "min_purchase_qty_g": 250,
          "max_quantity_g": 1000,
          "edible_yield_ratio": 0.95,
          "purchase_increment_g": 50,
          "discrete_unit_weight_g": null,
          "display_in_units": false,
          "purchase_notes": "Choose firm shiny skins without insect entry holes.",
          "common_household_usage": ["Vankaya Fry", "Vankaya Bajji", "Pappu Charu"],
          "season_availability": ["Year-Round"],
          "popularity_score": 10,
          "calculation_priority": 1,
          "recommendation_notes": "Staple vegetable in AP. Calculate first in vegetable budget."
        }
      ]
    }
    ```

---

## 3. Retrieve Single Catalog Item
Retrieves the details of a specific item.

*   **Endpoint**: `GET /items/:id`
*   **Method**: `GET`
*   **Success Response** (Status Code: `200 OK`):
    ```json
    {
      "status": "success",
      "data": {
        "item_id": "QTY-AP-VEG-0001",
        "english_name": "Brinjal (Local)",
        "telugu_name": "వంకాయ"
      }
    }
    ```
*   **Error Response** (Status Code: `404 Not Found`):
    ```json
    {
      "status": "error",
      "code": "ITEM_NOT_FOUND",
      "message": "Item with ID 'INVALID-ID' was not found"
    }
    ```

---

## 4. Calculate Purchase Recommendations
Calculates rounded purchase weights or count recommendations for selected items based on people counts and Items Required For (days).

*   **Endpoint**: `POST /recommend`
*   **Method**: `POST`
*   **Request Headers**: `Content-Type: application/json`
*   **Request Payload**:
    ```json
    {
      "people_count": 4,
      "duration_days": 7,
      "storage_preference": "REFRIGERATED",
      "selected_items": ["QTY-AP-VEG-0001", "QTY-AP-EGG-0006"],
      "regional_profile": "AP_RAYALASEEMA",
      "calculation_month": 7
    }
    ```
*   **Success Response** (Status Code: `200 OK`):
    ```json
    {
      "status": "success",
      "data": {
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
            "category": "Vegetables",
            "sub_category": "Solanaceous",
            "recommended_display_value": 1.7,
            "recommended_display_unit": "kg",
            "storage_warning_triggered": false,
            "storage_warning_message": null,
            "purchase_notes": "Choose firm shiny skins without insect entry holes.",
            "common_household_usage": ["Vankaya Fry", "Vankaya Bajji", "Pappu Charu"],
            "season_availability": ["Year-Round"],
            "popularity_score": 10,
            "calculation_priority": 1,
            "recommendation_notes": "Staple vegetable in AP. Calculate first in vegetable budget."
          },
          {
            "item_id": "QTY-AP-EGG-0006",
            "english_name": "Country Chicken Egg",
            "telugu_name": "నాటు కోడి గుడ్డు",
            "category": "Eggs",
            "sub_category": "Avian Eggs",
            "recommended_display_value": 16,
            "recommended_display_unit": "unit",
            "storage_warning_triggered": false,
            "storage_warning_message": null,
            "purchase_notes": "Shells should be clean and uncracked.",
            "common_household_usage": ["Guddu Pulusu", "Boiled Egg", "Egg Porutu"],
            "season_availability": ["Year-Round"],
            "popularity_score": 9,
            "calculation_priority": 1,
            "recommendation_notes": "Standard calculation unit is whole counts never weight."
          }
        ]
      }
    }
    ```
*   **Error Response** (Status Code: `400 Bad Request`):
    ```json
    {
      "status": "error",
      "code": "VALIDATION_FAILED",
      "message": "Invalid request payload parameters",
      "errors": [
        {
          "field": "people_count",
          "message": "people_count must be an integer between 1 and 50"
        }
      ]
    }
    ```
