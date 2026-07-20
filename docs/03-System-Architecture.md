# QtyWise System Architecture Specification

**Document Version:** 1.0.0-AP  
**Target Region:** Andhra Pradesh (Coastal Andhra, Rayalaseema, Uttarandhra)  
**Document Status:** Production-Ready Specification  
**Intended Audience:** Enterprise Architects, Solution Architects, Backend Developers, Frontend Developers, DevOps Leads  

---

## 1. System Overview

QtyWise is designed as a **serverless client-side web application (Jamstack)**. Rather than relying on dynamic web servers or server-side database lookups at runtime, the application compiles its master dataset (CSV) and categories registry into a static client bundle (`client_data_bundle.json`) during the build phase.

The compiled web application shell and static data bundle are distributed globally using static Content Delivery Networks (CDNs). When a user launches QtyWise, the client browser downloads the app shell and data bundle once, executing all recommendation calculations and localizations locally. This client-side architecture guarantees:
*   **Sub-Second TTI**: Immediate Time-To-Interactive (TTI) on slow 3G connections.
*   **Infinite Scalability**: High user volumes are handled by the edge CDN, eliminating server load bottlenecks.
*   **Zero Infrastructure Costs**: Operates without dynamic application servers or runtime database servers.
*   **Offline Functionality**: PWAs and Service Workers cache the assets, allowing calculations to work in deep bazaar basements with poor cellular coverage.

---

## 2. High-Level System Architecture

The system consists of two primary environments: the **Build Pipeline** (where data standardization and validation occur) and the **Client Runtime Environment** (where user inputs are processed and calculations are performed).

```
   [Data changes in Git]
             │
             ▼
┌───────────────────────────┐
│     Build Pipeline        │
│  - CI Ingestion Rules     │
│  - validate_csv.py script │
│  - compile_db_bundle.py   │
└────────────┬──────────────┘
             │
             │ (Deploys static bundle)
             ▼
┌───────────────────────────┐
│     Edge CDNs (Hosting)   │
│  - App Shell (HTML/JS/CSS)│
│  - client_data_bundle.json│
└────────────┬──────────────┘
             │
             │ (Downloads once)
             ▼
┌───────────────────────────┐
│  Client Web Browser       │
│  - Presentation Layer     │
│  - Recommendation Engine  │
│  - Local Storage Cache    │
└───────────────────────────┘
```

### High-Level Components

*   **Build Pipeline (CI/CD)**: Validates dataset changes and compiles CSV/JSON files into a unified client data bundle.
*   **Edge CDN (Static Hosting)**: Serves static assets (HTML, CSS, JS, and the compiled JSON data bundle) globally.
*   **Client Web Browser (Runtime)**: Runs the application logic, processes user inputs, and displays calculated recommendations.

---

## 3. Application Layers

QtyWise enforces separation of concerns by organizing its client-side code into three layers:

```
┌────────────────────────────────────────────────────────┐
│                   Presentation Layer                   │
│  - SPA Layout View (HTML5 Semantic Elements)           │
│  - UI Components (Steppers, Checkable Produce Cards)   │
│  - Localization Interface Toggle (EN / TE UI State)    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                 Business Logic Layer                   │
│  - Input Validation Controllers (Sanitize Parameters)  │
│  - Recommendation Engine (Math, Quantization Core)      │
│  - Regional & Seasonal Adjuster Modules                │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                       Data Layer                       │
│  - Client Memory Lookup Cache (Static Data Bundle)     │
│  - Local Storage Adapter (Saves config and selections) │
└────────────────────────────────────────────────────────┘
```

### 3.1 Presentation Layer
*   **Responsibility**: Renders UI components, captures user inputs, and displays purchase recommendations.
*   **Decoupled localization**: Handles translation toggles dynamically using local translation assets (`app_ui_te.json`).

### 3.2 Business Logic Layer
*   **Responsibility**: Validates user inputs, retrieves master coefficients, and calculates purchase quantities using portion calculations, prep waste corrections, and regional scaling factors.

### 3.3 Data Layer
*   **Responsibility**: Provides data interfaces. Houses the compiled static data bundle in memory and manages client-side preferences (such as people counts and storage preferences) using browser local storage.

---

## 4. Module Specifications

The system is organized into six functional modules:

### 4.1 Input Validation Controller (`InputController`)
*   **Purpose**: Sanitizes and validates user input parameters.
*   **Responsibilities**: Checks people counts, Items Required For parameters, and storage selections against boundary constraints.
*   **Inputs**: Raw parameters from UI inputs (people counts, Items Required For values, storage choices).
*   **Outputs**: Sanitized input object or validation error codes.
*   **Dependencies**: None.

### 4.2 Master Database Registry (`DataRegistry`)
*   **Purpose**: In-memory catalog database manager.
*   **Responsibilities**: Loads the static data bundle into browser memory on launch and retrieves record parameters for calculation modules.
*   **Inputs**: Static client data bundle file (`client_data_bundle.json`).
*   **Outputs**: Structured item parameters (portion sizes, yield ratios, storage limits, and multipliers).
*   **Dependencies**: Static client data bundle.

### 4.3 Portion Calculation Engine (`CalculationEngine`)
*   **Purpose**: Core calculation engine.
*   **Responsibilities**: Calculates portion quantities, applies prep waste adjustments, and outputs raw recommended weights in grams.
*   **Inputs**: Sanitized user parameters and database portion metrics.
*   **Outputs**: Raw recommended portion weights in grams.
*   **Dependencies**: `InputController` and `DataRegistry`.

### 4.4 Regional & Seasonal Adjuster (`ScalingAdjuster`)
*   **Purpose**: Portions scaling module.
*   **Responsibilities**: Applies seasonal crop yield multipliers and regional consumption coefficients.
*   **Inputs**: Raw calculated portion weights, seasonal indexes, and regional factors.
*   **Outputs**: Adjusted recommended portion weights in grams.
*   **Dependencies**: `CalculationEngine`.

### 4.5 Quantization & Formatting Manager (`QuantizationFormatter`)
*   **Purpose**: Rounds calculations to match retail packaging and increments.
*   **Responsibilities**: Rounds calculated weights to standard retail increments, caps recommendations at minimum purchase floors, and formats discrete items as unit counts.
*   **Inputs**: Adjusted portion weights and item rounding rules.
*   **Outputs**: Final display values and measurement units (e.g. `1.5 kg`, `750 g`, `12 units`).
*   **Dependencies**: `ScalingAdjuster`.

### 4.6 Local Storage Adapter (`StateStorage`)
*   **Purpose**: Persist user configurations client-side.
*   **Responsibilities**: Saves people counts, Items Required For values, storage preferences, and item selections to browser storage, restoring them on subsequent visits.
*   **Inputs**: Active user preferences.
*   **Outputs**: Saved user configurations on load.
*   **Dependencies**: None.

---

## 5. System Data Flow

The system processes data in a 6-stage flow:

```
[User Interface Actions]
       │
       ▼ (1. Captures raw inputs)
[InputController]
       │
       ▼ (2. Passes sanitized inputs)
[CalculationEngine] ◄─── (3. Queries portion metrics) ─── [DataRegistry]
       │
       ▼ (4. Passes raw weights)
[ScalingAdjuster]
       │
       ▼ (5. Passes adjusted weights)
[QuantizationFormatter]
       │
       ▼ (6. Compiles final list payload)
[User Interface View]
```

1.  **User Input**: User changes parameter inputs (e.g., people counts) or selects items on the UI.
2.  **Validation**: `InputController` sanitizes parameters and flags validation errors.
3.  **Core Calculation**: `CalculationEngine` retrieves portion coefficients and calculates raw portion weights in grams.
4.  **Scaling**: `ScalingAdjuster` applies seasonal and regional multipliers.
5.  **Quantization**: `QuantizationFormatter` rounds weights to match standard retail increments and converts discrete items to counts.
6.  **Presentation**: UI displays the final recommendation list and highlights storage safety warnings.

---

## 6. Project Directory Layout

The project repository implements the following structure:

```
QtyWise/
├── docs/                               # System Specifications
│   ├── 01-Project-Blueprint.md         # Foundation plans
│   ├── 03-System-Architecture.md       # This specifications file
│   ├── 04-Database-Design.md           # Database relational definitions
│   ├── 05-Recommendation-Engine.md     # Portion formulas specifications
│   ├── 06-UI-UX.md                     # Responsive layout definitions
│   └── 12-Master-Dataset-Specification.md # Field schema blueprint
├── database/                           # Master Data Pipelines
│   ├── schemas/
│   │   └── validation_schema.json      # JSON Schema validation file
│   ├── master_data/
│   │   ├── categories.json             # Category definitions
│   │   └── ap_master_dataset_v1.0.csv  # Production CSV master data
│   └── scripts/
│       ├── validate_csv.py             # Pre-commit validation linter
│       └── compile_db_bundle.py        # CSV/JSON compilation script
├── frontend/                           # Responsive Web App Shell
│   ├── public/
│   │   ├── client_data_bundle.json     # Compiled master dataset
│   │   └── locales/
│   │       ├── te_IN.json              # Telugu translations
│   │       └── en_US.json              # English translations
│   └── src/
│       ├── components/                 # UI components
│       ├── controllers/                # Validation modules
│       ├── engine/                     # Calculation engines
│       └── data/                       # State and Storage adapters
└── README.md                           # Developer entry page
```

---

## 7. Architectural Principles

QtyWise enforces the following software architecture standards:
*   **Separation of Concerns**: Presentation (UI), logic (calculators), and data (caches) are fully decoupled. UI components render state variables without executing math formulas directly.
*   **Modularity**: System logic is divided into self-contained modules (`InputController`, `CalculationEngine`, `QuantizationFormatter`). Each module is testable and maintainable in isolation.
*   **Reusability**: Core calculation engines and quantization formatters are separated from UI frameworks, allowing the engine to be integrated into native mobile platforms (React Native, Flutter) without rewrite.
*   **Deterministic Execution**: Given the same inputs and dataset version, the recommendation engine returns identical output lists, supporting automated integration testing.

---

## 8. Error Handling & Resilience Strategy

QtyWise implements validation at the boundaries of each module to catch input errors:

### 8.1 Ingestion Validation
*   Input values are validated against boundary constraints immediately. Invalid inputs block calculation flows and trigger validation errors in the UI.

### 8.2 Client-Side Fallback Mechanisms
*   **Empty Search Fallbacks**: If search inputs return zero matching results, the catalog panel displays fallback search instructions.
*   **Corrupted Data Fallbacks**: If client local storage parameters are corrupted, the application catches the error, clears the invalid keys, and resets state parameters to system defaults.

---

## 9. Future Scalability

The serverless client-side architecture is designed to support the system as it scales:
*   **Native Mobile Applications (iOS / Android)**:
    *   *Approach*: Because core calculation and formatting modules are written in standard Javascript, the recommendation engine can be integrated into native frameworks (React Native, Ionic) without rewriting codebase logic.
*   **Adding New Food Categories**:
    *   *Approach*: New items and category definitions are compiled into the static data bundle (`client_data_bundle.json`) at build time, updating recommendations for all users without requiring backend updates.
*   **Scaling to New States (Multi-Region)**:
    *   *Approach*: Additional states are integrated by appending state prefixes to item IDs and adding regional keys to translation catalogs. Edge CDNs handle the distribution of state-specific bundles.

---

## 10. Final Architectural Summary

The QtyWise System Architecture Specification establishes a modular client-side PWA framework. By compiling data catalogs at build time and executing all validation and recommendation calculations on the client browser, the system ensures sub-second load times, offline availability, and scalability. 

This serverless architecture provides the system foundation for the development and deployment of QtyWise.
