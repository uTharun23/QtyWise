# QtyWise Responsive Frontend Application

This is the responsive, mobile-first frontend Single-Page Application (SPA) client for QtyWise, built using vanilla HTML5, CSS3, and ES6 JavaScript.

---

## 📂 Project Structure

```
frontend/
├── app.js            # Core SPA state controller and API integrator
├── index.css         # Visual design system (CSS variables, layouts, keyframes)
├── index.html        # App semantic structure and ARIA layout
└── README.md         # Setup and run instructions
```

---

## ⚙️ Running Locally

The frontend app shell and data files are static. To run them locally in your browser, you must serve them using a simple local web server (to prevent CORS blocks when fetching resources).

### Prerequisites
*   Node.js (v24 or above)
*   QtyWise Backend Service running locally on port `5000` (refer to the `backend/` directory instructions).

### Start Local Web Server
You can launch a lightweight static web server in the `frontend/` directory using Node's standard `npx` utility:

1.  Open your terminal in the `frontend/` directory.
2.  Run the following command:
    ```bash
    # Launches a static server locally
    npx.cmd -y serve ./ -p 3000
    ```
3.  Open the application in your mobile emulator or web browser:
    *   [http://localhost:3000](http://localhost:3000)

---

## 🎨 Visual Design Tokens & Guidelines

*   **Color System**:
    *   *Primary selection*: Forest Green (`#14532d`)
    *   *Checkmark active states*: Accent Green (`#22c55e`)
    *   *Typography slate*: Heading Slate (`#0f172a`), subtitle Slate (`#475569`)
    *   *Alert warn indicators*: Amber alert fill (`#fef9c3`) and dark amber text (`#78350f`)
*   **Accessibility Targets**:
    *   *Touch-targets*: All buttons, toggles, dropdown controls, and checkable cards are sized to at least **$48\text{px} \times 48\text{px}$** with $8\text{px}$ margins to support one-handed market navigation.
    *   *Contrast*: All labels exceed $4.5:1$ contrast levels, and warning tags exceed $3:1$ contrast levels.
    *   *ARIA tags*: Interactive buttons and checkboxes declare screen reader contexts (e.g. `role="radio"`, `aria-checked`, `aria-live="polite"`).

---

## 📱 Responsive Layout Adaptive Columns

*   **Mobile Viewports ($\le 480\text{px}$)**: Stacked single-column layouts. Portion configuration options at the top, scrollable catalog card grid in 2 columns, and recommendations sliding up from the viewport bottom.
*   **Tablet Viewports ($481\text{px}$ to $1024\text{px}$)**: Two-column split layouts. The left sidebar holds the steppers and selection controllers. The right catalog displays cards in 3 columns.
*   **Desktop Viewports ($\ge 1025\text{px}$)**: Three-column dashboard. Left column sidebar holds inputs, center column displays the catalog in 4 columns, and the right column houses the static recommendation list.
