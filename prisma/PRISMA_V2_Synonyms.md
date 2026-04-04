# PRISMA V2 — Q&A Synonyms Reference

> **Status:** Synonyms cannot be written via the Power BI MCP (the `linguisticMetadata` Q&A schema lives in `en-US.tmdl` and is not exposed as an object translation property).
>
> **How to apply:** In Power BI Desktop, go to **Modelling → Q&A Setup → Field Synonyms**, or edit `en-US.tmdl` directly in the exported TMDL folder.
>
> **Scope:** Tables, Columns, Hierarchies. Measures excluded (still in development).

---

## Tables

| Table | Synonyms |
|---|---|
| **Sales** | transactions, orders, revenue, sales data, order lines, purchases, invoices, line items |
| **Customer** | customers, clients, buyers, shoppers, consumer, account, people, members |
| **Product** | products, items, goods, catalogue, catalog, SKUs, merchandise, article |
| **Store** | stores, locations, shops, outlets, branches, retail locations, sites |
| **Date** | date, calendar, time, period, dates, day, fiscal calendar |
| **_measures** | measures, metrics, KPIs, calculations |

---

## Columns — Sales

| Column | Synonyms |
|---|---|
| Order Number | order id, order #, order no, transaction id, order reference |
| Line Number | line id, line #, item line, order line number |
| Order Date | purchase date, transaction date, sale date, date of order, order day |
| Delivery Date | shipped date, fulfilment date, delivery day, dispatch date |
| CustomerKey | customer id, customer key, client id |
| StoreKey | store id, shop id, location id |
| ProductKey | product id, item id, SKU id |
| Quantity | qty, units, units sold, volume, count, number of items |
| Unit Price | list price, retail price, price, full price, original price |
| Net Price | selling price, actual price, discounted price, net |
| Unit Cost | cost, COGS unit, cost price, unit COGS |
| Currency Code | currency, FX code, ISO currency, currency type |
| Exchange Rate | FX rate, conversion rate, forex rate, rate |

---

## Columns — Customer

| Column | Synonyms |
|---|---|
| CustomerKey | customer id, client id, customer key |
| Gender | sex, gender identity |
| Name | customer name, full name, client name |
| Address | street address, home address, address line |
| City | town, city name, customer city |
| State Code | state abbreviation, region code, province code |
| State | state name, region, province |
| Zip Code | postcode, postal code, ZIP |
| Country Code | ISO country, country abbreviation |
| Country | country name, nation, customer country |
| Continent | region, world region, geographic area |
| Birthday | date of birth, DOB, birth date |
| Age | customer age, age in years |

---

## Columns — Product

| Column | Synonyms |
|---|---|
| ProductKey | product id, item id, product key |
| Product Code | SKU, item code, part number, product reference |
| Product Name | product, item name, article name, product title |
| Manufacturer | maker, producer, manufacturer name, vendor |
| Brand | brand name, label, trademark |
| Color | colour, product colour, product color |
| Weight Unit Measure | weight unit, unit of weight, measurement unit |
| Weight | product weight, mass |
| Unit Cost | cost price, COGS, purchase cost |
| Unit Price | list price, RRP, retail price, standard price |
| Subcategory Code | subcategory id, sub-cat code |
| Subcategory | sub-category, product type, sub-cat |
| Category Code | category id, cat code |
| Category | product category, product group, department |

---

## Columns — Store

| Column | Synonyms |
|---|---|
| StoreKey | store id, location id, shop id |
| Store Code | store number, shop code, location code |
| Country | store country, country name |
| State | store state, region, store region |
| Name | store name, shop name, location name |
| Square Meters | store size, floor area, sq m, sqm, size |
| Open Date | opening date, store opening, launch date |
| Close Date | closing date, store closure, closed date |
| Status | store status, open or closed, active status |

---

## Columns — Date

| Column | Synonyms |
|---|---|
| Date | day, calendar date, full date |
| Year | calendar year, yr, year number |
| Year Quarter | year and quarter, quarter label |
| Year Quarter Number | quarter sort key, quarter number |
| Quarter | Q, qtr, fiscal quarter, quarter name |
| Year Month | month label, year month label |
| Year Month Short | short month, abbreviated month label |
| Year Month Number | month sort key, month number |
| Month | month name, calendar month |
| Month Short | abbreviated month, short month name |
| Month Number | month no, month sort, month integer |
| Day of Week | weekday, day name, day |
| Day of Week Short | short day, abbreviated day |
| Day of Week Number | day sort key, weekday number |
| Working Day | business day, weekday flag, work day |
| Working Day Number | business day count, working day count |
| End of Month | month end, last day of month, EOM |

---

## Columns — Currency Exchange

| Column | Synonyms |
|---|---|
| Date | rate date, exchange date |
| FromCurrency | source currency, base currency, from currency |
| ToCurrency | target currency, destination currency, converted currency |
| Exchange | rate, FX rate, conversion rate, exchange rate value |

---

## Hierarchies

| Table | Hierarchy | Synonyms |
|---|---|---|
| Customer | Geography | geographic drill-down, customer geography, location hierarchy, customer location |
| Date | Year-Quarter-Month | time hierarchy, calendar hierarchy, date drill-down, quarterly calendar |
| Date | Year-Month | monthly calendar, month hierarchy, simplified time hierarchy |
| Product | Category-Subcategory | product hierarchy, product classification, category drill-down |

### Hierarchy Levels

| Table | Hierarchy | Level | Synonyms |
|---|---|---|---|
| Customer | Geography | Continent | world region, geographic region, global area |
| Customer | Geography | Country | nation, customer nation, country name |
| Customer | Geography | State | region, province, customer state |
| Customer | Geography | City | town, customer city, city name |
| Date | Year-Quarter-Month | Year | calendar year, annual, yearly |
| Date | Year-Quarter-Month | Quarter | fiscal quarter, Q1/Q2/Q3/Q4, quarterly |
| Date | Year-Quarter-Month | Month | calendar month, monthly |
| Date | Year-Quarter-Month | Date | day, daily, calendar date |
| Date | Year-Month | Year | calendar year, annual, yearly |
| Date | Year-Month | Month | calendar month, monthly |
| Date | Year-Month | Date | day, daily, calendar date |
| Product | Category-Subcategory | Category | product group, department, top-level category |
| Product | Category-Subcategory | Subcategory | product type, sub-cat, sub-category |

---

## How to Apply in Power BI Desktop

### Option A — Q&A Setup UI (recommended)
1. Open **Modelling** tab → **Q&A Setup**
2. Select **Field Synonyms**
3. For each table/column, paste the synonyms from this document (comma-separated)

### Option B — TMDL edit (for source-controlled models)
Synonyms are stored in `en-US.tmdl` inside the `linguisticMetadata` JSON block, under the `Entities` array. Each entity has a `Synonyms` array per property. Example structure:

```json
{
  "Entities": [
    {
      "Name": "Sales",
      "Synonyms": ["transactions", "orders", "revenue"],
      "Attributes": [
        {
          "Name": "Quantity",
          "Synonyms": ["qty", "units", "units sold", "volume"]
        }
      ]
    }
  ]
}
```

Edit the `linguisticMetadata` annotation in `en-US.tmdl`, re-export to the TMDL folder, and reload in Power BI Desktop.

---

*Generated: PRISMA V2 — March 2026*
