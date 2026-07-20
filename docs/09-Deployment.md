# QtyWise Deployment & Production Release Guide

**Document Version:** 1.0.0-AP  
**Target Region:** Andhra Pradesh (Coastal Andhra, Rayalaseema, Uttarandhra)  
**Document Status:** Production-Ready Release Blueprint  
**Intended Audience:** DevOps Engineers, Cloud Architects, Release Managers, Software Leads  

---

## 1. Deployment Strategy

QtyWise V1 utilizes a hybrid static-compute hosting strategy to maintain infinite scalability, zero client-side load latency, and cost-efficient backend processing:

```
┌────────────────────────────────────────────────────────┐
│               1. Static Frontend Shell                 │
│  - Hosted on globally distributed Edge CDNs            │
│  - Serves static assets (HTML/CSS/JS)                  │
│  - Integrates with Backend API endpoints               │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ (API requests)
                           ▼
┌────────────────────────────────────────────────────────┐
│                2. Serverless Backend API               │
│  - Deployed as a Docker container on GCP Cloud Run    │
│  - Automatically scales down to zero when idle         │
│  - Loads CSV/JSON datasets into memory on boot         │
└────────────────────────────────────────────────────────┘
```

*   **Static Frontend SPA Shell**: Deployed to a static web hosting platform (e.g. AWS S3 + CloudFront CDN, Vercel, Netlify, or Cloudflare Pages). This ensures sub-second Time-To-Interactive (TTI) on slow 3G devices and infinite horizontal scaling.
*   **Serverless Backend API Container**: Packed as a Docker container and deployed to serverless container environments (e.g., AWS App Runner, Google Cloud Run, or Render). The container scales down to zero during inactive periods to minimize costs.
*   **Master Data Compilation**: The backend container parses and caches the master dataset (`ap_master_dataset_v1.0.csv`) in memory on container boot, providing in-memory database performance without the cost of a running SQL server.

---

## 2. Production Deployment Checklist

Before triggering a release, the release pipeline must complete these quality checks:

### 2.1 Build Verification
- [ ] Frontend static assets build passes without linter or structural errors.
- [ ] Backend dependencies install successfully and clean audit checks show 0 vulnerabilities.
- [ ] Docker container build executes successfully and image is registered.

### 2.2 Environment & API Check
- [ ] Production `.env` file variables are loaded in cloud configuration dashboards.
- [ ] CORS policies are locked down to match production frontend domains.
- [ ] Server health check endpoint (`GET /health`) responds with `200 OK` and active uptime.

### 2.3 Security & Performance Check
- [ ] HTTPS SSL certificates are active on both frontend and backend domains.
- [ ] API rate limiters are active to protect calculation endpoints.
- [ ] Average calculation endpoint latency is verified under $100\text{ms}$.

---

## 3. Environment Configuration Guide

To ensure consistency across staging steps, QtyWise is organized across three deployment environments:

| Configuration Parameter | Development Environment | Testing (Staging) Environment | Production Environment |
| :--- | :--- | :--- | :--- |
| **Purpose** | Code authoring, validation script testing, and local feature additions. | Integration contract tests, QA regression testing, and mobile view testing. | Public application delivery for users in Andhra Pradesh. |
| **Frontend URL** | `http://localhost:3000` | `https://test.qtywise.in` | `https://qtywise.in` |
| **Backend API URL** | `http://localhost:5000` | `https://api-test.qtywise.in` | `https://api.qtywise.in` |
| **Port** | `5000` (Backend), `3000` (Frontend) | `5000` / Cloud Port mapping | Dynamic (Port 80/443 SSL termination) |
| **NODE_ENV** | `development` | `staging` | `production` |
| **Dataset Sourcing** | Local workspace CSV files. | Staged dataset release branch. | Validated master production dataset. |
| **CORS Policy** | Allowed `*` (All domains) | Restricted to `test.qtywise.in` | Restricted to `qtywise.in` |
| **Logging Level** | Verbose Dev Morgan (`dev`) | Detailed Json structured logging. | Masked errors; info/warn levels. |

---

## 4. Release Management Process

QtyWise release cycles are managed through a structured git branch workflow to maintain stability:

### 4.1 Git Branching Lifecycle
1.  **Feature/Data Development**: Code edits and dataset changes are made on feature branches (e.g. `feat/recommendation-engine-rounding` or `data/ap-brinjal-adjustments`).
2.  **Staging Release**: Merging features into the `staging` branch triggers automated builds and deploys to the Staging Environment.
3.  **Production Release**: Merging the `staging` branch into the `main` branch triggers production build pipelines, tagging the commit with semantic versions (e.g., `v1.0.0`).

### 4.2 Semantic Versioning Matrix
*   *Patch Release (`v1.0.x`)*: Dataset value corrections, translation fixes, or dependency audits.
*   *Minor Release (`v1.x.0`)*: Additions of new categories (e.g., Fruits, Groceries) or new localization languages (e.g. Tamil UI).
*   *Major Release (`v1.0.0`)*: Architecture migrations (e.g., moving from serverless memory to a relational SQL DB) or major UI redesigns.

---

## 5. Security Guidelines

To secure QtyWise in production, the deployment environment enforces four security policies:

### 5.1 Transport Security
*   **Enforce HTTPS**: All communication is encrypted over TLS 1.3. Non-secure requests on port 80 are redirected to port 443.

### 5.2 API Protection & Rate Limiting
*   **Rate Limiters**: Production gateway limits incoming API requests to a maximum of **60 requests per minute per IP address** to protect calculation engines from denial-of-service (DoS) vectors.
*   **CORS Restriction**: Backend API rejects request origins that do not match production frontend domains.

### 5.3 Error Logging & Secrets Isolation
*   **Mask Internal Traces**: Production error responses must never expose stack traces or path structures (e.g. `C:\Users\...`). Centralized error handlers catch exceptions and return general error codes (`INTERNAL_SERVER_ERROR`).
*   **Secrets Storage**: Secrets (like API keys or cloud tokens) are injected at runtime using cloud key vaults (e.g., AWS Secrets Manager or GCP Secret Manager).

---

## 6. Rollback Strategy

If a production release encounters critical errors (e.g. calculation math defects or system outages), the rollback workflow must be executed immediately:

```
[Critical Defect Discovered]
            │
            ▼
┌──────────────────────────────────────┐
│  1. Rollback Frontend Client         │
│  - Deploy previous stable Git tag    │
│  - Purge CDN edge caches             │
└───────────┬──────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│  2. Rollback Backend Service         │
│  - Re-route serverless traffic to    │
│    previous stable container image   │
└───────────┬──────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│  3. Post-Rollback Smoke Test         │
│  - Verify health check endpoint      │
│  - Confirm target metrics calculations│
└──────────────────────────────────────┘
```

1.  **Frontend Rollback**: Redeploy the previous stable Git version to the CDN and trigger an edge cache purge to clear user browser caches.
2.  **Backend Container Rollback**: Point the serverless container configuration back to the previous stable Docker image tag (e.g. roll back from `v1.1.0` image to `v1.0.9` image).
3.  **Sanity Verification**: Execute post-rollback smoke tests on both staging and production URL domains to verify calculations stability.

---

## 7. Post-Deployment Verification (Smoke Testing)

Immediately following a production deployment, the release engineer must run these smoke tests:

1.  **Health Check Endpoint Verification**:
    *   *Action*: Send a GET request to `/health`.
    *   *Expected Result*: Returns `200 OK` containing active uptime parameters.
2.  **Deterministic Recommendation Check**:
    *   *Action*: Submit a POST request to `/api/recommend` using standard test inputs (e.g. 4 people, 7 days, 2 selected items).
    *   *Expected Result*: Returns status `success` and exact matching rounded recommendations.
3.  **Validation Middleware Verification**:
    *   *Action*: Submit an invalid request payload (e.g. people count = 99).
    *   *Expected Result*: Returns status `400 Bad Request` with appropriate validation errors.

---

## 8. Monitoring & Observability Guidelines

Production application health is maintained through continuous monitoring:

*   **Uptime Monitoring**: External health checkers (e.g. Uptime Robot, Pingdom) send ping requests to the `/health` API endpoint every 60 seconds, alerting developers if service is interrupted.
*   **Performance Monitoring**: Latency monitors track backend API response times, alerting the team if average calculation times exceed $200\text{ms}$.
*   **Error Rate Alerts**: System monitors track the ratio of 500 error responses, alerting the team if the error rate exceeds $1\%$ of incoming traffic.

---

## 9. Maintenance Recommendations

To ensure QtyWise remains secure and accurate over time:
1.  **Monthly Dataset Audits**: Review market portion weights and seasonal multipliers monthly to align recommendations with regional crop calendars in Andhra Pradesh.
2.  **Bi-Weekly Security Audits**: Run dependency audits (`npm audit`) bi-weekly to patch vulnerabilities in third-party library containers.
3.  **Static Assets Cache Expirations**: Set CDN cache expiration parameters (`Cache-Control: max-age=31536000`) on static JS/CSS assets to leverage browser caching while ensuring updates take effect immediately.

---

## 10. Final Deployment Summary

The QtyWise Deployment & Production Release Guide defines the hosting architecture and deployment workflows for V1. By utilizing edge CDNs for the static frontend SPA shell and serverless containers for the backend API, the application maintains sub-second load times, infinite scaling, and zero infrastructure costs. 

This deployment guide serves as the release blueprint for QtyWise.
