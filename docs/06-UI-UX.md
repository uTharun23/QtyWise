# QtyWise UI/UX Design Specification

**Document Version:** 1.0.0-AP  
**Target Region:** Andhra Pradesh (Coastal Andhra, Rayalaseema, Uttarandhra)  
**Document Status:** Production-Ready Specification  
**Intended Audience:** UI/UX Designers, Product Managers, Frontend Engineers, Accessibility Specialists  

---

## 1. UI/UX Overview

The QtyWise application is designed as a fast, single-page mobile utility. The primary goal of the interface is to allow users to calculate raw ingredient purchase lists in under 30 seconds on budget smartphones. 

### Core Design Principles

*   **Mobile-First & One-Handed Operation**: All interactive controls (buttons, toggles, search fields) are positioned within the lower two-thirds of the screen (the "thumb zone") to support easy one-handed operation while walking through busy local markets.
*   **Zero-Friction Ingestion**: Users do not need to register, log in, or configure profiles to receive recommendations. Standard defaults are loaded immediately on launch.
*   **Fast Load Times**: The design uses system fonts, vanilla CSS variables, and SVG icons to minimize bundle sizes, ensuring sub-second page loads on slow mobile connections.
*   **Outdoor Readability**: The color palette meets high contrast standards (WCAG AAA) to ensure readability in bright sunlight at open-air markets.

---

## 2. User Journey & Screen Flows

The user journey is structured to minimize input steps, presenting recommendations immediately upon selecting items.

```
       [User Launches App]
                │
                ▼
┌───────────────────────────────┐
│     Single Page Workspace     │
├───────────────────────────────┤
│ 1. Header (EN/TE Toggle)      │
│ 2. Config Panel (Inputs)      │
│ 3. Search & Category Tabs     │
│ 4. Food Item Catalog Grid     │
└───────────────┬───────────────┘
                │
                │ (User selects item)
                ▼
┌───────────────────────────────┐
│     Calculated List Panel     │
│  (Appears dynamically at bot) │
├───────────────────────────────┤
│ - Displays rounded quantities  │
│ - Storage limit warnings      │
│ - "Share List on WhatsApp"    │
└───────────────────────────────┘
```

### 2.1 Navigation & Screen Flow Rationale
1.  **Single-Screen Layout**: Multi-step wizard configurations are rejected. Navigating between screen transitions increases load times and cognitive load. By placing configuration inputs, search filters, and recommendations on a single scrolling page, users retain full context.
2.  **State Retention**: User configurations (people counts, storage choices) are preserved locally using client-side storage, ensuring preferences remain active on subsequent visits.

---

## 3. Screen Specifications

QtyWise V1 utilizes a single-screen layout with a slide-up panel for calculated recommendations.

### 3.1 Main Workspace (Default State)
*   **Purpose**: Capture user parameters (people, days, storage) and support item selection.
*   **UI Components**:
    *   *App Header*: Displays the logo and a language toggle (English / Telugu).
    *   *Portion Configuration Card*: Contains the people count increment stepper, duration day stepper, storage type toggle, and regional zone selector.
    *   *Catalog Search Bar*: A sticky search field with category selection tabs (`Vegetables`, `Meats`, etc.) below it.
    *   *Produce Catalog Grid*: A responsive 2-column card grid displaying item names, vernacular synonyms, and selection checkmarks.
*   **Expected Behavior**:
    *   Selecting an item adds a green selection checkmark to the card.
    *   Selecting the first item triggers the slide-up **Recommendations Panel** at the bottom of the viewport.

### 3.2 Recommendations Panel (Slide-Up State)
*   **Purpose**: Display calculated shopping recommendations and share actions.
*   **UI Components**:
    *   *Calculated List*: An interactive list showing item names, rounded quantities, and display units.
    *   *Storage Alerts*: Inline warning badges (yellow background, warning icon) displayed below items if the duration exceeds safe storage parameters.
    *   *Sharing Action Bar*: A sticky footer bar containing "Copy List" and "Share on WhatsApp" buttons.
*   **Expected Behavior**:
    *   Adjusting parameters in the top configuration card updates recommendation quantities instantly ($< 50\text{ms}$ delay).
    *   Clearing all selected items slides the panel out of view.

---

## 4. Component Specifications

To ensure design consistency, core interactive components are specified below.

### 4.1 Number Increment Stepper (People / Days Input)
*   **Purpose**: Capture integer inputs for count parameters.
*   **Behavior**: Displays the current count flanked by circular minus `-` and plus `+` buttons.
*   **Validation**: 
    *   *People Count*: Bound between 1 and 50. Minus button disabled at 1; plus button disabled at 50.
    *   *Duration Days*: Bound between 1 and 30. Minus button disabled at 1; plus button disabled at 30.
*   **Accessibility**: Minimum touch targets are $48\text{px} \times 48\text{px}$. Button components implement descriptive screen reader labels (e.g. `aria-label="Increase people count"`).

### 4.2 Storage Preference Segmented Toggle
*   **Purpose**: Toggle refrigerator availability.
*   **Behavior**: A segmented control with two choices: "Ambient storage" and "Refrigerator storage". 
*   **Validation**: Defaults to "Refrigerator storage".
*   **Accessibility**: Selected segment uses a high-contrast active background color. Focus indicators are styled with clear borders for keyboard accessibility.

### 4.3 Catalog Search Field
*   **Purpose**: Filter the food catalog.
*   **Behavior**: A text input field showing a search magnifying glass icon and placeholder text. Contains a trailing `X` clear button when text is entered.
*   **Validation**: Escapes HTML inputs. Strips special characters.
*   **Accessibility**: Implements an explicit form label linked to the field ID.

### 4.4 Food Card Component
*   **Purpose**: Represent catalog items and support selection.
*   **Behavior**: A card displaying the item's English name, localized Telugu name, and average portion size. Tapping the card toggles its selection state.
*   **Accessibility**: Selected state changes card borders to active green and shows a visible checkmark icon.

---

## 5. Visual Design Guidelines (Design System)

The visual design system implements a clean, high-contrast palette tailored for outdoor visibility.

### 5.1 Color System

The color palette utilizes standard CSS color variables, avoiding pure black (`#000`) and pure white (`#fff`) to reduce screen glare.

| Color Token | Value (HSL / Hex) | Usage |
| :--- | :--- | :--- |
| `--color-bg-primary` | `hsl(210, 20%, 98%)` / `#f4f6f8` | Primary page background. |
| `--color-surface` | `hsl(0, 0%, 100%)` / `#ffffff` | Card and component surfaces. |
| `--color-text-primary` | `hsl(210, 24%, 16%)` / `#1e293b` | Primary headings and text. |
| `--color-text-secondary`| `hsl(215, 16%, 47%)` / `#64748b` | Sub-labels, translation names, portion averages. |
| `--color-brand-primary` | `hsl(142, 70%, 29%)` / `#14532d` | Forest Green. Used for active selection and header branding. |
| `--color-brand-accent` | `hsl(142, 69%, 58%)` / `#22c55e` | Light Green checkmarks, success states. |
| `--color-warn-bg` | `hsl(45, 93%, 94%)` / `#fef8e7` | Soft yellow alert background. |
| `--color-warn-text` | `hsl(38, 92%, 25%)` / `#7c2d12` | Dark orange alert text. |
| `--color-border` | `hsl(214, 32%, 91%)` / `#e2e8f0` | Standard divider and component borders. |

### 5.2 Typography System

The application uses clean system fonts to eliminate network delays associated with loading web fonts.

*   **Primary System Font Stack**:
    `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
*   **Telugu Font Stack**:
    `"Gidugu", "Ramabhadra", "NTR", "Peddana", system-ui`

#### Typographical Scale:
*   *App Heading*: `20px` (Medium, `600` weight)
*   *Category Headings*: `18px` (Semi-bold, `600` weight)
*   *Item Title (Vernacular)*: `16px` (Regular/Bold, `600` weight)
*   *Item Sub-title (English)*: `14px` (Regular, `400` weight)
*   *Portion Sub-label / Warning badges*: `12px` (Regular, `400` weight)

### 5.3 Spacing Scale
The layout uses a standard base-8 grid system:
*   `4px` (micro adjustments, badge paddings)
*   `8px` (component margin spaces, inner card padding)
*   `16px` (main card paddings, list item spacings)
*   `24px` (header and main view outer margins)

### 5.4 Screen States

*   **Empty State**:
    *   *Search Empty State*: Displays a clean graphic (e.g. outline search icon) with text: "No items match your search. Check your spelling or switch category tabs."
    *   *Recommendation Empty State*: Displays a clean card: "Select items below to compile your purchase list."
*   **Loading State**:
    *   *Skeleton Loaders*: Card boundaries use skeleton background animations for loading states, keeping layouts stable.

---

## 6. Responsive Layout Strategy

The interface utilizes a single-column card layout that adapts to larger screen widths.

### 6.1 Viewport Adaptability Matrix

| Viewport Category | Width Range | Layout Behavior | Column Structure |
| :--- | :--- | :--- | :--- |
| **Mobile phones** | $\le 480\text{px}$ | Stacked Single-Column. Recommendations slide up from the bottom. | 1 column configurations. 2 column catalog cards. |
| **Tablets** | $481\text{px}$ to $1024\text{px}$ | Two-Column Split. Left side holds configuration inputs; right side displays the catalog. | Split layout container. 3 columns for catalog cards. |
| **Desktops** | $\ge 1025\text{px}$ | Three-Column Dashboard. Left: config, Center: search/catalog, Right: recommendations. | Fixed layouts. 4 columns for catalog cards. |

---

## 7. Accessibility Guidelines

The interface follows accessibility standards to ensure usability for all:

*   **Touch Targets**: All interactive controls (buttons, toggles, checkable cards) have a minimum dimension of **$48\text{px} \times 48\text{px}$** with $8\text{px}$ spacing, preventing accidental taps.
*   **Color Contrast**: Core text fields maintain a contrast ratio of at least **$4.5:1$** against background colors. Informational warning badges maintain a contrast ratio of at least **$3:1$**.
*   **Keyboard Navigation (Desktop)**: Interactive elements are fully accessible via keyboard navigation. Focus indicators are styled with clear borders to outline selected inputs.
*   **Screen Readers**: Dynamic screen alerts utilize ARIA live region declarations (`aria-live="polite"`) to announce recommendation updates to screen reader users.

---

## 8. UX Feedback Guidelines

The interface provides immediate feedback to guide user inputs:

*   **Steppers**: Reaching the minimum or maximum limit disables the button and applies a grayed-out style, showing the limit has been reached.
*   **Slide Actions**: Adding the first item slides the recommendations panel up from the bottom, indicating a calculation has occurred.
*   **Storage Warning Badges**: Displayed inline directly beneath the recommended quantity, ensuring warnings are read in context.

---

## 9. Final Design Summary

The QtyWise UI/UX Design Specification establishes a clean, responsive layout. By focusing interface designs around single-page navigation, one-handed touch targets, and high contrast visibility, the application remains usable under real-world conditions. 

This design specification provides the UI/UX framework for the development of QtyWise.
