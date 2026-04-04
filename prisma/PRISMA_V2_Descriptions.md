# PRISMA V2 — Table & Measure Descriptions

> Live descriptions pulled directly from the model on **18 March 2026**.  
> Measures marked ⚠️ *in development* are subject to change.

---

## Tables

| Table | Hidden | Description |
|---|:---:|---|
| **Sales** | | Central fact table. One row per order line. Transactional data with quantities, prices, costs, dates, and FK keys to all dimensions. |
| **Customer** | | Customer dimension. One row per customer. Demographics and geographic attributes for segmentation and geographic drill-down. |
| **Product** | | Product dimension. One row per product. Full catalogue with category/subcategory hierarchy, pricing, and physical attributes. |
| **Store** | | Store dimension. One row per store. Geographic, size, and lifecycle attributes including open/close dates and status. |
| **Date** | | Date table. One row per calendar day. Full calendar hierarchy, sort keys, working day flags, and month-end calculations. |
| **Currency Exchange** | ✓ | Daily FX rates between currency pairs. Used by Sales Amount USD to convert revenue to USD at the row-level exchange rate. |
| **_measures** | | Measures-only table (no data rows). All 40 model measures organised in display folders. *(Table description pending TMDL patch — see patch ZIP.)* |

---

## Measures

> Organised by display folder, matching the field pane structure.

### Ungrouped *(no display folder)*

| Measure | Description |
|---|---|
| **Sales Amount** | Net revenue from sales: SUMX of Sales[Quantity] × Sales[Net Price] in current filter context. |
| **Total Cost** | Total cost of goods sold: SUMX of Sales[Quantity] × Sales[Unit Cost] in current filter context. |
| **Margin** | Gross margin dollars: [Sales Amount] minus [Total Cost]. |
| **Margin %** | Gross margin percentage: DIVIDE([Margin], [Sales Amount]). |
| **Total Quantity** | Total units sold: SUM of Sales[Quantity] in current filter context. |
| **Sales Amount SPLY** | Net revenue for Same Period Last Year based on Date[Date] using model time-intelligence UDF. |
| **Sales Amount Delta SPLY** | Absolute change vs Same Period Last Year for [Sales Amount]. |
| **Sales Amount Delta %** | Percent change vs Same Period Last Year for [Sales Amount]. |
| **Active Stores** | Count of open stores (Store[Status] is blank) in current filter context. |
| **Total Orders** | Distinct count of Sales[Order Number] in current filter context. |

---

### KPI - Sales

| Measure | Description |
|---|---|
| **Gross Revenue** | Revenue at list price: SUMX of Sales[Quantity] × Sales[Unit Price]. |
| **Avg Order Value** | Average revenue per order: DIVIDE([Sales Amount], [Total Orders]). |
| **Total Line Items** | Number of unique order lines: COUNTROWS over distinct combinations of Order Number and Line Number. |
| **Avg Line Items** | Average lines per order: DIVIDE([Total Line Items], [Total Orders]). |

---

### KPI - Time Intelligence

| Measure | Description |
|---|---|
| **Orders SPLY** | Distinct orders for Same Period Last Year, based on Date[Date]. |
| **Orders Δ** | Absolute change in orders vs Same Period Last Year. |
| **Orders Δ %** | Percent change in orders vs Same Period Last Year. |
| **AOV SPLY** | Average order value for Same Period Last Year: DIVIDE([Sales Amount SPLY], [Orders SPLY]). |
| **AOV Δ %** | Percent change in AOV vs Same Period Last Year. |
| **Margin SPLY** | Gross margin dollars for Same Period Last Year. |
| **Margin % SPLY** | Gross margin percent for Same Period Last Year: DIVIDE([Margin SPLY], [Sales Amount SPLY]). |
| **Margin Delta pp** | Change in margin rate versus last year, expressed in percentage points (current % minus SPLY %). |
| **Total Line Items SPLY** | Order line count for Same Period Last Year. |
| **Avg Line Items SPLY** | Average lines per order for Same Period Last Year. |
| **Avg Line Items Delta %** | Percent change in average lines per order vs last year. |

---

### Customer

| Measure | Description |
|---|---|
| **Total Customers** | Distinct count of customers with activity in the current filter context. |
| **Average Age** | Average age (in years) of customers in the current filter context. |
| **Revenue per Customer** | Revenue efficiency: DIVIDE([Sales Amount], [Total Customers]). |
| **Repeat Rate** | Share of customers with two or more distinct orders: customers with ≥2 orders divided by all active customers. |

---

### Product

| Measure | Description |
|---|---|
| **Unique Products** | Distinct count of Product[ProductKey] in filter context (products available/sold). |
| **Active Brands** | Distinct count of Product[Brand] in filter context. |
| **Avg Unit Price** | Average realized unit price: DIVIDE([Sales Amount], [Total Quantity]). |

---

### Geography

| Measure | Description |
|---|---|
| **Total Stores** | Distinct count of Store[Store Code] in filter context. |
| **Closed Stores** | Distinct count of stores where Store[Status] is not blank (closed or inactive). |
| **Avg Sq Meters** | Average Store[Square Meters] across the current selection. |
| **Revenue per Store (Open)** | Average revenue per open store: DIVIDE([Sales Amount], [Active Stores]). |
| **Revenue per Sq Meter** | Revenue density: DIVIDE([Sales Amount], SUM(Store[Square Meters])). |

---

### Currency

| Measure | Description |
|---|---|
| **Sales Amount USD** | Net revenue converted to USD using row-level Sales[Exchange Rate]. |

---

### Formatting - Examples

| Measure | Description |
|---|---|
| **Revenue Δ Color** | Hex color based on absolute delta vs SPLY (positive=green, negative=red, zero/blank=amber). |
| **Revenue Δ % Color** | Hex color based on percent delta vs SPLY (positive=green, negative=red, zero/blank=amber). |

---

## Summary

| | Count |
|---|---|
| Tables (visible) | 6 |
| Tables (hidden) | 1 |
| Measures total | 40 |
| Display folders | 7 |
| Measures ungrouped | 10 |

---

*Source: PRISMA V2 — pulled live via Power BI MCP, 18 March 2026.*
