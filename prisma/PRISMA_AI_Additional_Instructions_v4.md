# PRISMA — Power BI AI Additional Instructions (v4)

> Pure rules and context only. No direct answers. Built from live model.
> Paste into Power BI AI additional instructions field.

---

## Model Structure

Star schema. Fact table: Sales. Dimensions: Customer, Product, Store, Date, Currency Exchange. All business measures stored in _measures table. Always resolve measures from _measures before querying source tables directly.

---

## Hierarchy Rules

Four hierarchies exist. Always prefer hierarchies over flat columns when drilling is involved.

**Year-Quarter-Month** (Date table): Year → Quarter → Month → Date. Use for all time-based questions. Drill to the appropriate level — do not summarise at year level when a month or quarter question is asked. A second hierarchy Year-Month exists for month-level trending without quarter granularity.

**Category-Subcategory** (Product table): Category → Subcategory. Use when a question moves from category to subcategory detail. Product Name is available as a flat column — not part of a hierarchy.

**Geography** (Customer table): Continent → Country → State → City. Use for all customer geographic questions. Do not use Store[Country] to answer customer location questions — always resolve customer location through Customer[Country] or this hierarchy.

Store table has no hierarchy. Use Store[Country] and Store[Channel] as flat filters for store geographic and channel questions.

---

## Table Selection Rules

- Revenue, profit, cost, margin, orders, lines, units, discount, price, quantity → Sales table measures.
- Customer count, demographics, age, gender, repeat rate, new vs returning, revenue per customer → Customer table and Customer folder measures.
- Category, subcategory, brand, product counts, unit price → Product table and Product folder measures.
- Store count, store status, channel, store size, revenue per store, revenue per sq metre → Store table and Geography folder measures.
- Time period, year, quarter, month, seasonality → Date table via Date hierarchies.
- Never use flat dimension columns when a hierarchy is available for the same dimension.

---

## Measure Selection Rules

- Net Revenue is the primary revenue measure. Use it unless the question explicitly asks for list price, gross, or pre-discount revenue — in which case use Gross Revenue.
- Margin % is net profit margin: Net Profit divided by Net Revenue. Do not describe it as gross margin.
- Net Profit is Net Revenue minus Cost. COGS is the only expense in this model.
- For customer count questions within a time period, use Active Customers not Customers. Active Customers counts only buyers who transacted in the selected period. Customers is an all-time distinct count.
- Revenue per Customer uses Active Customers as its denominator. Apply this distinction consistently.
- Revenue per Store and Revenue per Sq Meter are physical-only measures. They exclude Online from both numerator and denominator regardless of filter context.
- Avg Order Value Delta should be interpreted as an absolute value. The absolute delta is more meaningful than the percentage given the price scale.
- For SPLY comparisons always use the designated SPLY measure (Revenue SPLY, Net Profit SPLY, etc.) rather than constructing SAMEPERIODLASTYEAR manually.
- Delta pp measures (Margin Delta pp, Repeat Rate Delta pp, Online Share Delta pp) express change in percentage points not percent. Apply proportional language when describing their magnitude.
- Discount % is derived from Gross Revenue minus Net Revenue divided by Gross Revenue. It represents the share of list price given away as discounts.
- New Customer % is the share of active customers in the period who are first-time buyers. It is not a count — use New Customers for the count.
- Returning Customers are customers whose first order was placed before the current filter period. They are distinct from New Customers.

---

## Channel Rules

- Two channels: Online (single store) and Physical (brick-and-mortar stores).
- When no channel filter is applied all measures include both channels combined.
- Revenue per Store and Revenue per Sq Meter always exclude Online — this is built into the measure definitions and cannot be overridden by a filter.
- Online vs Physical % is Online Revenue as a share of total Net Revenue. Use this for channel mix questions.
- Do not infer delivery or logistics metrics for Physical stores — physical transactions have no meaningful delivery lag.

---

## Time Intelligence Rules

- All SPLY measures use Sales[Order Date] via the active Date relationship.
- When no year filter is applied (Year = All) SPLY measures return blank. This is correct model behaviour — do not treat blank SPLY as missing data or an error.
- The model spans 2016 to 2025. Data for 2026 is partial — exclude from trend analysis and year-over-year comparisons.
- When answering trend questions confirm the direction holds at the granularity being asked (year vs quarter vs month) before stating a conclusion.
- Two Date hierarchies exist: Year-Quarter-Month and Year-Month. Use Year-Quarter-Month when quarter-level context is relevant. Use Year-Month for simple month trending.

---

## Interpretation Rules

- RAG arrows: green = positive vs SPLY, red = negative vs SPLY, amber = blank or zero. Amber is expected and correct when Year = All.
- Inverted measures (Discount %, Store Closure Rate) use reverse colouring: red when rising, green when falling.
- Small pp changes in Margin Delta pp should not be described as significant. Apply proportional language relative to the base margin level.
- Discount % has been operationally stable across the full data range. Do not characterise year-on-year movements as strategic shifts unless the change is material.
- Avg Line Items per order has been structurally stable across the full data range. Do not characterise small movements as basket composition trends.
- New Customers at Year = All reflects all customers who ever placed their first order — this equals the total customer base and is not a useful acquisition metric at that level. Apply New Customers only within a specific year or period filter.
- When answering store productivity questions confirm whether the question is physical-only or includes Online before selecting the measure.
- When drilling Customer Geography to State level note that customer concentration varies significantly by country. Use order count context before drawing geographic conclusions.
- Category-Subcategory hierarchy has only two levels — Category and Subcategory. Product Name is available as a flat column but is not part of this hierarchy.
- Store table has no hierarchy. All store geographic questions use flat columns Store[Country] and Store[State].

---

## Naming Conventions

- SPLY = Same Period Last Year
- Delta = absolute change in the measure value
- Delta % = percentage change vs SPLY
- Delta pp = change in percentage points (Margin %, Repeat Rate, Online Share %)
- Arrow = SVG image URL for RAG trend indicator (data category ImageUrl) — not a numeric measure
- Banner = text string measure for Card visuals — not a numeric measure
- _measures = table where all business measures are stored
- Formatting - Examples = display folder containing Arrow, Banner, Color and axis helper measures

---

*PRISMA Semantic Model — adaptfy · Built from live model*
