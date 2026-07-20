# QtyWise — Smart Purchase Quantity Advisory Utility

[![Build Status](https://img.shields.io/badge/build-passing-green.svg)](#)
[![Version](https://img.shields.io/badge/version-1.0.0--AP-blue.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](#)
[![Region](https://img.shields.io/badge/region-Andhra%20Pradesh-orange.svg)](#)

QtyWise is a smart, mobile-first purchase quantity advisory utility designed for households and community kitchens in Andhra Pradesh. It helps users calculate the exact raw quantity of vegetables, leafy vegetables, meat, fish, seafood, herbs, and eggs to purchase based on portion requirements, Items Required For (days), and refrigerator storage preferences, minimizing retail food waste and optimizing grocery budgets.

> [!IMPORTANT]
> **Functional Boundary**: QtyWise is a portion size calculator and shopping list planner. It is **NOT** an e-commerce platform, it does **NOT** sell products, and it does **NOT** provide food recipes.

---

## 📂 Repository Structure & Documentation Index

The repository is organized to maintain a clear separation of design blueprints, master data sets, backend computing API services, and responsive web client interfaces.

```
QtyWise/
├── docs/                               # Architectural & Design Blueprints
│   ├── 01-Project-Blueprint.md         # Project Goals & Scope Outline
│   ├── 02-Requirements.md              # Software Requirements Specifications (SRS)
│   ├── 03-System-Architecture.md       # Jamstack & Serverless Containers Infrastructure
│   ├── 04-Database-Design.md           # 8 normalized entities relational schema
│   ├── 05-Recommendation-Engine.md     # Portion math, yield ratios, and rounding rules
│   ├── 06-UI-UX.md                     # Responsive interface grids and accessibility
│   ├── 07-API-Documentation.md         # API route schemas and JSON formats
│   ├── 08-Testing.md                   # QA checklists & test suite specifications
│   ├── 09-Deployment.md                # Cloud hosting setup & rollback strategies
│   ├── 10-Future-Roadmap.md            # Category expansions and multi-region scaling
│   ├── 11-Master-Data-Framework.md     # Agricultural sourcing & trust score strategy
│   └── 12-Master-Dataset-Specification.md # 23-field master schema & casing rules
├── database/                           # Master Data Pipelines
│   ├── schemas/
│   │   └── validation_schema.json      # JSON Schema parameters validator
│   ├── master_data/
│   │   ├── categories.json             # Two-tier category hierarchy definitions
│   │   └── ap_master_dataset_v1.0.csv  # Production CSV master data records
│   └── scripts/
│       ├── validate_csv.py             # Pre-commit dataset validator linter
│       └── compile_db_bundle.py        # Dataset compilation script
├── backend/                            # Node.js Express REST API Service
│   ├── config/                         # Environment config loader
│   ├── controllers/                    # Routing controllers
│   ├── middleware/                     # Validators and error filters
│   ├── routes/                         # API routers
│   ├── services/                       # Normalizer and portion engines
│   └── utils/                          # Synchronous CSV parsers
├── frontend/                           # Responsive Static PWA Client
│   ├── app.js                          # SPA state manager & API client
│   ├── index.css                       # CSS custom styling variable system
│   └── index.html                      # Semantic markup and ARIA tags
└── README.md                           # This Developer & Repository Index
```

---

## 🛠️ Technology Stack

QtyWise V1 utilizes a lightweight, zero-overhead tech stack to ensure sub-second page loads on budget mobile devices and zero dynamic database licensing costs:
*   **Frontend**: Vanilla HTML5 (semantic layout), CSS3 (CSS variables design system, flex/grid viewports), and ES6 JavaScript (Single-Page Application state logic).
*   **Backend**: Node.js (v24+) with Express, CORS, Morgan logging, and Dotenv configurations.
*   **Database**: Static in-memory CSV/JSON database files. Data is parsed and normalized to integer grams on startup to prevent binary floating-point rounding errors.

---

## ⚙️ Setup & Installation Guide

To get QtyWise running locally on your workstation, follow these steps:

### 1. Backend API Service Setup
1.  Open your terminal and navigate to the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies (using the Windows batch command helper if running PowerShell with restricted execution policies):
    ```bash
    # Standard:
    npm install

    # Windows PowerShell Restricted Bypass:
    npm.cmd install
    ```
3.  Configure your environment parameters. Create a `.env` file in the `backend/` directory:
    ```env
    PORT=5000
    NODE_ENV=development
    MASTER_DATA_PATH=../database/master_data/ap_master_dataset_v1.0.csv
    CATEGORIES_PATH=../database/master_data/categories.json
    ```
4.  Start the development server with watch-mode enabled:
    ```bash
    npm.cmd run dev
    ```
    *The API will boot and be accessible at `http://localhost:5000`.*

### 2. Frontend Client Setup
1.  Open a new terminal window and navigate to the `frontend/` directory:
    ```bash
    cd frontend
    ```
2.  Serve the static assets using Node's lightweight static web server:
    ```bash
    npx.cmd -y serve ./ -p 3000
    ```
3.  Open your web browser or mobile emulator and load:
    *   [http://localhost:3000](http://localhost:3000)

---

## 📖 User Guide & How to Use

QtyWise provides a single-screen interface for selecting items and calculating recommendations:

```
┌────────────────────────────────────────────────────────┐
│  1. Configure Parameters                               │
│  - Adjust People count (stepper +/-)                   │
│  - Adjust Items Required For days (stepper +/-)        │
│  - Select storage preference (Ambient vs. Refrigerator)│
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  2. Choose Produce Items                               │
│  - Tap category tabs to filter produce categories      │
│  - Use search input to filter specific items           │
│  - Select item cards (turns green with checkmark)      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  3. Review Recommended Shopping List                   │
│  - Review rounded portion quantities on slide-up sheet │
│  - Note yellow warning banners for shelf life limits   │
│  - Click "Copy List" or "WhatsApp" to share list      │
└────────────────────────────────────────────────────────┘
```

### Frequently Asked Questions (FAQ)
*   **Q: Why do some recommendations show as units instead of kg/g?**  
    *A: Discrete items like eggs are sold as whole counts. The engine converts their weight portion equivalents into counts and rounds up to the nearest whole integer.*
*   **Q: Why does a yellow warning block show below some of my items?**  
    *A: This indicates a storage safety alert. If you choose "Ambient storage" and your planned Items Required For days exceed the ambient shelf life of that item (e.g. Gongura leaves for 7 days), a warning is triggered recommending refrigerator storage or smaller purchase intervals.*

---

## 💻 Developer & Contribution Guidelines

### Branching Workflows & Commit Conventions
To contribute to QtyWise:
1.  Branch from `staging` using branch naming tags (e.g. `feat/telugu-font-support`, `bug/egg-rounding-ceil`, `data/ap-meat-coefficients`).
2.  Follow conventional commit structures for message logs:
    *   `feat: add coastal and Rayalaseema region multipliers`
    *   `fix: resolve brinjal minimum portion floor bounds`
    *   `docs: update system architecture database structures`
    *   `data: update shelf life days for Gongura leaves`
3.  Submit a Pull Request targeting the `staging` branch for integration testing.

### Coding Standards
*   **ES Modules**: Use modern JavaScript ES Modules syntax (`import` / `export`) instead of CommonJS (`require`).
*   **Separation of Concerns**: Keep calculations and display format logic out of UI controller files. Enforce validators at API boundary interfaces.
*   **Weight Metric Standards**: Always execute calculations internally using integer **grams (`g`)** to maintain accuracy. Only convert to kilograms (`kg`) at the presentation boundary when rendering output values.

---

## 🔧 Maintenance Guidelines

To maintain accuracy and security:
*   **Seasonal Dataset Refinements**: Audit portion consumption averages and seasonal multipliers monthly to align recommendations with regional crop calendars in Andhra Pradesh.
*   **Dependency Auditing**: Run `npm audit` bi-weekly to identify and patch security vulnerabilities in third-party library containers.
*   **Linter Checks**: Run the Python lint script (`validate_csv.py`) before committing dataset changes to `ap_master_dataset_v1.0.csv` to verify field data types, casings, and unique IDs.

---

## 📄 License Information

This project is licensed under the MIT License. See [LICENSE](#) for details.
