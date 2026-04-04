# PRISMA — Power BI AI Verified Answers (v6)

> 5 verified answers per visual · 3 additional filters per visual
> Flat column filters only — no hierarchies · KPI tiles excluded

---

## Page 1 — Executive Summary

### Net Profit vs Net Revenue *(line chart — monthly)*
**Filters:** `Date[Year]` · `Store[Country]` · `Product[Category]`
1. Which month has the highest net revenue?
2. Which month shows the biggest gap between net revenue and net profit?
3. Which quarter has the highest combined net revenue?
4. Is net profit growing faster or slower than net revenue?
5. Which months show a decline in net revenue vs the prior month?

---

### Margin % vs Prior Year *(line chart — monthly)*
**Filters:** `Date[Year]` · `Product[Category]` · `Store[Channel]`
1. Is margin % above or below last year?
2. Which month shows the widest margin gap vs prior year?
3. Is the margin trend improving or declining through the year?
4. What is the peak margin % difference vs prior year?
5. Are there any months where margin % dips below 55%?

---

### Net Revenue by Country *(bar chart)*
**Filters:** `Date[Year]` · `Product[Category]` · `Store[Channel]`
1. Which country generates the most net revenue?
2. How does Online revenue compare to United States revenue?
3. Which physical country has the highest net revenue?
4. Which countries generate more than 100M in net revenue?
5. What is the combined revenue of European countries?

---

### Net Revenue by Category *(bar chart)*
**Filters:** `Date[Year]` · `Store[Country]` · `Store[Channel]`
1. Which product category generates the most revenue?
2. How does Cell phones revenue compare to Computers?
3. Which categories generate more than 200M in net revenue?
4. Which category has grown the most vs prior year?
5. What is the combined revenue of the top 3 categories?

---

## Page 2 — Store

### Net Revenue by Channel *(line chart — monthly)*
**Filters:** `Date[Year]` · `Product[Category]` · `Date[Quarter]`
1. Which channel generates more revenue in the selected year?
2. When did online revenue overtake physical revenue?
3. Which quarter shows the biggest gap between online and physical?
4. Is online revenue growing faster than physical?
5. What is the revenue difference between channels in April?

---

### Margin % by Channel *(line chart — monthly)*
**Filters:** `Date[Year]` · `Product[Category]` · `Date[Quarter]`
1. Is there a margin difference between online and physical channels?
2. Which months show the widest margin gap between channels?
3. Is the margin gap between channels widening or narrowing?
4. Which channel has the most stable margin %?
5. Are there months where physical margin exceeds online margin?

---

### Store Size vs Net Revenue *(scatter chart)*
**Filters:** `Date[Year]` · `Store[Country]` · `Store[Store Status]`
1. Do larger stores generate more revenue?
2. Which country cluster shows the highest revenue per store?
3. Are there small stores that generate high revenue?
4. Which stores are outliers with low revenue despite large size?
5. How does France store size compare to Germany?

---

### Store Efficiency Matrix *(table)*
**Filters:** `Date[Year]` · `Store[Country]` · `Store[Store Status]`
1. Which country has the highest revenue per store?
2. Which country has the highest revenue per square metre?
3. How does Canada revenue per store compare to France?
4. Which countries have more than 5 active stores?
5. Which country has the best margin %?

---

## Page 3 — Product

### Net Revenue by Category *(bar chart — with SPLY)*
**Filters:** `Date[Year]` · `Store[Country]` · `Store[Channel]`
1. Which category has declined most vs prior year?
2. Which categories show growth vs prior year?
3. Which category has the largest absolute revenue gap vs SPLY?
4. How does Cell phones revenue compare to its prior year?
5. How many categories are growing vs prior year?

---

### Net Profit vs Net Revenue *(line chart — monthly)*
**Filters:** `Date[Year]` · `Product[Category]` · `Store[Channel]`
1. Which month has the highest net revenue?
2. Which quarter shows the highest net revenue?
3. Are there months where revenue vs SPLY reverses?
4. What is the net revenue in April vs the prior year?
5. Which months show revenue above the SPLY line?

---

### Net Revenue by Brand *(bar chart)*
**Filters:** `Date[Year]` · `Product[Category]` · `Store[Country]`
1. Which brand generates the most revenue?
2. How does the second brand compare to the top brand?
3. Which brands generate more than 200M in revenue?
4. Which brand is the weakest performer?
5. How many brands generate more than 100M in revenue?

---

### Category Efficiency Matrix *(table)*
**Filters:** `Date[Year]` · `Store[Country]` · `Store[Channel]`
1. Which category has the best margin percentage?
2. Which category has the highest average unit price?
3. Which category sells the most units?
4. Which category has the highest discount %?
5. Which category has the best combination of margin and revenue?

---

## Page 4 — Customer

### Active Customers by Month *(line chart)*
**Filters:** `Date[Year]` · `Customer[Country]` · `Customer[Gender]`
1. Which month has the most active customers?
2. Which quarter has the highest active customer count?
3. Is the number of active customers growing vs prior year?
4. Which months show a dip in active customers?
5. Which months show active customers above 50K?

---

### Revenue per Customer by Country *(bar chart)*
**Filters:** `Date[Year]` · `Customer[Country]` · `Customer[Gender]`
1. Which country has the highest revenue per customer?
2. Which country has the lowest revenue per customer?
3. How do the top two countries compare in revenue per customer?
4. Which countries have revenue per customer above 25K?
5. What is the gap between the highest and lowest revenue per customer?

---

### Revenue by Age Band *(bar chart)*
**Filters:** `Date[Year]` · `Customer[Country]` · `Customer[Gender]`
1. Which age group generates the most revenue?
2. Is revenue evenly distributed across age bands?
3. How does the youngest age band compare to the oldest?
4. What percentage of revenue comes from customers over 60?
5. Are younger or older customers more valuable?

---

### Revenue by Gender *(bar chart)*
**Filters:** `Date[Year]` · `Customer[Country]` · `Customer[Age Band]`
1. Which gender generates more revenue?
2. What is the revenue split between male and female?
3. Which gender has the higher revenue per customer?
4. Is the gender revenue gap growing or stable?
5. How does the gender split compare to the customer count split?

---

### Customer Efficiency Matrix *(table)*
**Filters:** `Date[Year]` · `Customer[Country]` · `Customer[Gender]`
1. Which country has the highest repeat rate?
2. Which country has the most active customers?
3. Which country has the highest revenue per customer?
4. Which countries have a repeat rate above 90%?
5. How does the lowest repeat rate country compare to the highest?

---

## Page 5 — Sales

### Orders by Month *(line chart — with SPLY)*
**Filters:** `Date[Year]` · `Product[Category]` · `Store[Channel]`
1. Which month has the most orders?
2. Is the order trend growing vs prior year?
3. Which months show orders below the SPLY line?
4. Which quarter has the highest total orders?
5. How many months show growth vs prior year?

---

### Avg Order Value by Month *(line chart — with SPLY)*
**Filters:** `Date[Year]` · `Product[Category]` · `Store[Channel]`
1. Which month has the highest average order value?
2. Is average order value above or below last year?
3. Is the AOV trend declining or stable vs prior year?
4. Which months show AOV below the prior year line?
5. What is the gap between current and SPLY average order value?

---

### Orders by Category *(bar chart — with SPLY)*
**Filters:** `Date[Year]` · `Store[Country]` · `Store[Channel]`
1. Which category has the most orders?
2. Which categories show growth in orders vs prior year?
3. Which category has declined most in orders vs SPLY?
4. How many categories have more than 100K orders?
5. What is the combined order count for the top 3 categories?

---

### Category Efficiency Matrix *(table)*
**Filters:** `Date[Year]` · `Store[Country]` · `Store[Channel]`
1. Which category has the highest average order value?
2. Which category has the most orders?
3. Which category has the highest average line items per order?
4. Which category has the lowest discount %?
5. Which category has the highest volume but lowest AOV?

---

*PRISMA — adaptfy · v6 · flat column filters · 5 pages · 19 visuals · 5 answers · 3 filters each*
