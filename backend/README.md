# QtyWise Backend Service

This is the Node.js Express backend service for QtyWise, managing the master data catalog and recommendation calculation engine.

---

## 📂 Project Structure

```
backend/
├── config/
│   └── config.js             # Environment parser and validator
├── controllers/
│   ├── catalogController.js  # Category and item detail routers
│   └── recommendationController.js # Portion engine router
├── docs/
│   └── api_docs.md           # API specification schemas
├── middleware/
│   ├── errorHandler.js       # Centralized error formatter
│   └── validator.js          # Ingestion request validator
├── routes/
│   └── api.js                # API endpoint routing matrix
├── services/
│   ├── catalogService.js     # Data manager (caching and normalization)
│   └── recommendationService.js # Math formula execution engine
├── utils/
│   └── csvParser.js          # Synchronous CSV parser
├── .env                      # Local configuration variables
├── package.json              # System dependencies manifest
└── server.js                 # Server startup entry point
```

---

## 🛠️ Getting Started & Setup

### Prerequisites
*   Node.js (v24 or above)
*   npm (v11 or above)

### 1. Installation
Install all Node dependencies:
```bash
# On systems with unrestricted PowerShell script executions:
npm install

# On Windows systems with restricted execution policies:
npm.cmd install
```

### 2. Environment Variables Configuration
Configure a `.env` file in the root of the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MASTER_DATA_PATH=../database/master_data/ap_master_dataset_v1.0.csv
CATEGORIES_PATH=../database/master_data/categories.json
```

### 3. Execution
Start the server:

*   **Development Mode** (Runs with hot-reloading using Node's watch mode):
    ```bash
    npm.cmd run dev
    ```
*   **Production Mode**:
    ```bash
    npm.cmd start
    ```

---

## 🧪 Testing the API
You can verify the backend is running by loading the health check endpoint in your browser:
*   [http://localhost:5000/health](http://localhost:5000/health)

To calculate a recommendation, perform a `POST` request to `/api/recommend` using curl:
```bash
curl -X POST http://localhost:5000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"people_count":4,"duration_days":7,"storage_preference":"REFRIGERATED","selected_items":["QTY-AP-VEG-0001","QTY-AP-EGG-0006"]}'
```
