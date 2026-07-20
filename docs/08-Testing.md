# QtyWise Testing & Quality Assurance Specification

**Document Version:** 1.0.0-AP  
**Target Region:** Andhra Pradesh (Coastal Andhra, Rayalaseema, Uttarandhra)  
**Document Status:** Production-Ready Verification Specification  
**Intended Audience:** QA Engineers, Software Test Leads, Frontend/Backend Developers, Product Managers  

---

## 1. Testing Strategy

The QtyWise testing strategy outlines the quality gates required to verify the application shell and calculation engine. Given the serverless-style runtime architecture and decoupled REST APIs, testing is divided into five key layers:

```
┌────────────────────────────────────────────────────────┐
│                   5. E2E UI Testing                     │
│  - Verifies Responsive Grid columns (Mobile/Tablet/PC) │
│  - Checks checkable card states and scroll tabs        │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               4. Integration API Testing                │
│  - Verifies HTTP client POST /api/recommend payloads   │
│  - Checks categories JSON contract validations         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               3. Portion Validation Testing             │
│  - Validates rounding quantization (e.g. 50g steps)   │
│  - Validates yield ratios, regional/seasonal factors   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               2. Input Boundary Validation             │
│  - Enforces people count constraints (1 to 50)         │
│  - Enforces duration limits (1 to 30 days)             │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               1. Master Data Integrity Lint            │
│  - Checks CSV structure via validate_csv.py lint script│
│  - Enforces ID formatting (QTY-AP-XXX-0000)            │
└────────────────────────────────────────────────────────┘
```

*   **Continuous Ingestion Validation**: Master database updates in the Git repository are validated by linter scripts to catch structural errors before releases.
*   **Decoupled Integration Tests**: Verifies REST API contracts to ensure the UI client and backend service remain aligned.
*   **Deterministic Regression Tests**: Leverages fixed inputs to verify that calculations remain consistent across versions.

---

## 2. Test Plan

### 2.1 Scope of Testing
*   *In-Scope*: Validation of input steppers, catalog searches, localization engines, core math calculations, rounding quantization, storage shelf life alerts, clipboard/WhatsApp sharing, and responsive layouts.
*   *Out-of-Scope*: Production payment systems, dynamic user accounts/profiles, and dynamic e-commerce catalog integrations.

### 2.2 Test Environments
*   **Local Staging**: Node.js v24.18.0 backend API server and static web frontend client.
*   **Browsers**: Google Chrome (Mobile view), Apple Safari (Mobile view), Firefox, Edge, and standard Android WebView.

### 2.3 Pass / Fail Criteria
*   **Pass**: $100\%$ of Functional and Validation test cases execute successfully. Average recommendation response times remain under $100\text{ms}$. No visible layout issues across target device sizes.
*   **Fail**: Any portion calculation math deviations, uncaught input parameters validation bypasses, or layout issues on mobile viewports.

---

## 3. Functional Test Cases

| Test ID | Feature | Objective | Preconditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FT-001** | Language Toggle | Verify UI locale updates when language button is tapped. | App is loaded in English. | 1. Tap the "తెలుగు" language toggle button.<br>2. Observe UI text labels and card titles. | 1. Toggle button text changes to "English".<br>2. UI labels (e.g., Number of People) and item titles translate to Telugu. | [Pending] | [Untested] |
| **FT-002** | Stepper Limits | Verify people count stepper does not exceed bounds (1-50). | People count is at 1. | 1. Tap the minus `-` button.<br>2. Tap the plus `+` button until count reaches 50.<br>3. Tap the plus `+` button again. | 1. Minus button is disabled at 1; count remains 1.<br>2. Plus button is disabled at 50; count remains 50. | [Pending] | [Untested] |
| **FT-003** | Catalog Search | Verify catalog items are filtered dynamically by search query. | Catalog is loaded. | 1. Focus search input.<br>2. Type "వంకాయ" (or "Brinjal").<br>3. Observe catalog card list. | 1. Catalog grid filters to show only Brinjal card.<br>2. Clear button `X` appears in the search input. | [Pending] | [Untested] |
| **FT-004** | Item Selection | Verify selecting a card updates selection states. | Catalog is loaded with no items selected. | 1. Tap the "Brinjal" card.<br>2. Observe selection checkbox and slide-up recommendations sheet. | 1. Card borders turn green and checkbox shows a checkmark.<br>2. Recommendations sheet slides up from viewport bottom. | [Pending] | [Untested] |
| **FT-005** | Clipboard Sharing | Verify shopping list text format copies to clipboard. | Recommendations sheet is open with items. | 1. Tap the "Copy List" button.<br>2. Paste clipboard contents into a text editor. | 1. Toast shows "Shopping list copied to clipboard!".<br>2. Button label changes to "Copied!".<br>3. Pasted text matches expected shopping list layout. | [Pending] | [Untested] |
| **FT-006** | WhatsApp Share | Verify WhatsApp share URL formats correctly. | Recommendations sheet is open with items. | 1. Tap the "WhatsApp" share button. | 1. Opens new browser window pointing to `https://api.whatsapp.com/send?text=...` with formatted text. | [Pending] | [Untested] |

---

## 4. Validation Test Cases

| Test ID | Input Parameter | Test Input Payload | Expected Action / API Response | Status |
| :--- | :--- | :--- | :--- | :--- |
| **VT-001** | People Count | `{"people_count": 0, "duration_days": 7, "storage_preference": "AMBIENT", "selected_items": ["QTY-AP-VEG-0001"]}` | Status `400 Bad Request`. Error details point to `people_count` failing integer range limits. | [Untested] |
| **VT-002** | Duration Days | `{"people_count": 4, "duration_days": 35, "storage_preference": "AMBIENT", "selected_items": ["QTY-AP-VEG-0001"]}` | Status `400 Bad Request`. Error details point to `duration_days` exceeding maximum 30-day limit. | [Untested] |
| **VT-003** | Storage Type | `{"people_count": 4, "duration_days": 7, "storage_preference": "FREEZER", "selected_items": ["QTY-AP-VEG-0001"]}` | Status `400 Bad Request`. Error details point to `storage_preference` failing ENUM check. | [Untested] |
| **VT-004** | Selected Items | `{"people_count": 4, "duration_days": 7, "storage_preference": "AMBIENT", "selected_items": []}` | Status `400 Bad Request`. Error details point to `selected_items` failing non-empty array check. | [Untested] |
| **VT-005** | Item Existence | `{"people_count": 4, "duration_days": 7, "storage_preference": "AMBIENT", "selected_items": ["INVALID-ID"]}` | Status `400 Bad Request`. Error details list the invalid item ID as non-existent. | [Untested] |

---

## 5. Integration Test Cases

### 5.1 Server-Side Database Initialization
*   **Test Case ID**: IT-001
*   **Objective**: Verify database initialization loads and standardizes master datasets.
*   **Preconditions**: Server is stopped. CSV and JSON files are present.
*   **Steps**:
    1. Start the backend application server (`node server.js`).
    2. Review console startup logs.
*   **Expected Result**:
    *   Console log prints category count (8 categories loaded).
    *   Console log prints normalized item count (6 items loaded).
    *   No parsing errors or unhandled file exceptions are thrown.

### 5.2 Client to Server Calculation Hook
*   **Test Case ID**: IT-002
*   **Objective**: Verify client frontend dispatches valid calculation requests and processes recommendation payloads.
*   **Preconditions**: Backend server is running. Frontend client is loaded.
*   **Steps**:
    1. Set people count to 5 and duration to 7 days.
    2. Check the "Country Chicken Egg" card.
    3. Observe the network traffic and slide-up sheet.
*   **Expected Result**:
    *   Client sends a `POST` request to `http://localhost:5000/api/recommend`.
    *   Payload contains parameters matching current states.
    *   Server responds with `200 OK` and calculated recommendation (e.g., 20 eggs).
    *   Client parses response and displays recommended quantity.

---

## 6. Responsive Test Plan

The frontend responsive layouts must be verified across three screen width ranges to ensure accessibility and usability:

```
┌────────────────────────────────────────────────────────┐
│              1. Mobile Layout (<= 480px)               │
│  - Viewport stack is single column                     │
│  - Catalog cards display in 2 columns                  │
│  - Recommendations display in bottom slide-up sheet    │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             2. Tablet Layout (481px - 1024px)          │
│  - Viewport split: left config card, right catalog     │
│  - Catalog cards display in 3 columns                  │
│  - Recommendations display in bottom slide-up sheet    │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│            3. Desktop Layout (>= 1025px)               │
│  - Viewport split: left config, center catalog,        │
│    right recommendation sidebar (fixed static view)     │
│  - Catalog cards display in 4 columns                  │
└────────────────────────────────────────────────────────┘
```

### Verification Checks:
1.  **Mobile viewports**: Verify that no elements overflow horizontally and that touch targets remain separated by at least $8\text{px}$.
2.  **Tablet viewports**: Verify that the configuration card sticks to the left side when scrolling the catalog.
3.  **Desktop viewports**: Verify that the bottom slide-up sheet transitions to a static sidebar on the right side of the screen.

---

## 7. Error Handling Test Plan

The system must handle runtime and user errors gracefully:

*   **API Server Offline Fallback**:
    *   *Test Steps*: Shut down backend server. Load the frontend and check an item.
    *   *Expected Result*: UI displays a warning toast: "Failed to retrieve recommendations from engine." The catalog display remains stable.
*   **Search Empty State**:
    *   *Test Steps*: Enter random characters (e.g. `xyz123`) in the search input.
    *   *Expected Result*: Grid displays search empty state message: "No items match your search. Try another spelling."
*   **Local Storage Corruption Recovery**:
    *   *Test Steps*: Inject random text values into local storage keys (`qtywise_people = "corrupted"`). Reload the application.
    *   *Expected Result*: System catches parsing exceptions, resets configurations to default values (4 people, 7 days), and initializes normally.

---

## 8. Release Quality Checklist

Before moving QtyWise V1 to production, the release must pass this checklist:

### Functionality
- [ ] Language toggle updates labels and item descriptions dynamically.
- [ ] Steppers disable at boundary limits (people: 1-50, days: 1-30).
- [ ] Clear buttons remove search terms and restore catalog layouts.
- [ ] Item selection card borders toggle selection states.

### Accuracy
- [ ] Calculated quantities match portion formulas, yield ratios, and multipliers.
- [ ] Rounding logic rounds weights to nearest registered retail increments.
- [ ] Discrete items (eggs) display as whole count integer units.
- [ ] Ambient duration violations trigger storage warnings.

### Performance
- [ ] First load time is under $500\text{ms}$ on standard mobile connections.
- [ ] Recalculation calculations complete in under $50\text{ms}$ on typical mobile hardware.
- [ ] Page scrolling remains smooth.

### Consistency
- [ ] Font scales, CSS variables, and spacing grids align with styling variables.
- [ ] Layout scales across mobile, tablet, and desktop viewports.

---

## 9. QA Guidelines for Updates

To maintain quality as the application scales:
1.  **Data Changes**: Any modifications to `ap_master_dataset_v1.0.csv` must be run through the `validate_csv.py` linter script prior to commits.
2.  **Calculation Changes**: If portion logic is updated, regression test calculations must be run to verify output values.
3.  **UI Updates**: Any UI modifications must be verified across mobile, tablet, and desktop layout modes.

---

## 10. Final Testing Summary

The QtyWise Testing & Quality Assurance Specification defines the verification framework for the web client and calculation engine. By validating input parameters, catalog searches, calculations, and layouts, developers can ensure the application is stable, accurate, and ready for release.

This Testing & QA Specification provides the verification framework for the release of QtyWise.
