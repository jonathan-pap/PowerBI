# Power BI AI Workflow — Content outline

**Status:** Draft
**Scope:** 5-week training programme covering AI integration in Power BI development workflows

---

## Week 1: AI in the Power BI ecosystem

**Main topic:** *What AI actually does in Power BI today — and where it's heading*

This week establishes the landscape. Most people lump Copilot, MCP, and general AI prompting into one vague category of "AI in Power BI." The goal here is to draw clear lines between what each layer does, where value actually comes from, and why the semantic model is the lynchpin of all of it. By the end of this week, everyone should be able to articulate the difference between Copilot (built-in, for developers and end users), MCP (agent-based, for developers), and general LLM prompting (flexible but unconnected to your data).

### Sub-topic 1: Copilot vs. MCP vs. traditional automation

**What this covers:**

- **Copilot** is Microsoft's built-in AI surface across Power BI. It serves two distinct audiences. For **end users**, it sits inside published reports and lets business users ask natural language questions, get narrative summaries, and create ad-hoc visuals. For **developers**, it lives inside Power BI Desktop and assists with DAX authoring, measure creation, visual suggestions, report layout, data descriptions, and model documentation. Copilot is the most accessible AI layer — no setup, no agents, just built into the tool you already use.
- **MCP (Model Context Protocol)** is a developer-facing integration layer that goes beyond what Copilot can do. It exposes semantic model operations (model MCP) and report operations (report MCP) to external AI agents like Claude. Where Copilot offers suggestions within the Power BI UI, MCP allows full programmatic control — batch operations, cross-layer chaining, and workflows that would take dozens of clicks in the UI. Think of Copilot as the assisted mode and MCP as the autonomous mode.
- **Traditional automation** (Power Automate, REST APIs, PowerShell) still has its place for scheduled, deterministic tasks. AI doesn't replace automation — it fills the gap where tasks are too varied or context-dependent for rigid scripts.

**Key distinction to land:** Copilot is AI inside Power BI. MCP is AI operating on Power BI from the outside. Both depend on model quality. The training journey is: learn to prompt (Week 3) → apply prompting in Copilot (Week 4) → scale with MCP (Week 5).

### Sub-topic 2: The semantic model as the "brain"

**What this covers:**

- Every AI capability in Power BI — whether Copilot, MCP, or an external LLM — depends on the quality of the semantic model. A model with cryptic column names, no descriptions, and inconsistent measures will produce bad AI outputs regardless of how good the AI is.
- The model is effectively the "system prompt" for Copilot. Descriptions become the context the AI reads. Display folders become the organisational structure it navigates. Format strings tell it how to present results. If you wouldn't hand someone a spreadsheet with columns named `Col1`, `Col2`, `Col3` and expect them to do analysis, don't expect Copilot to do it either.
- This applies equally to Copilot's developer features. When you ask Copilot in Desktop to "create a measure for year-over-year growth," it reads your model schema to determine which tables, columns, and date fields to reference. Incomplete or ambiguous metadata means Copilot guesses — and guesses wrong.
- This reframes model development: you're not just building for report consumers anymore, you're building for AI consumers. That has implications for metadata completeness that most teams haven't internalised yet.

**Key distinction to land:** Model quality is not a nice-to-have for AI — it's the determining factor. Week 2 goes deep on exactly what "quality" means in this context.

### Sub-topic 3: The two MCP layers

**What this covers:**

- **Model MCP (powerbi-modeling-mcp):** Exposes the semantic model for programmatic interaction. Through this layer, an AI agent can inspect tables, columns, relationships, and measures. It can run DAX queries, create or modify measures, manage calculation groups, set descriptions, configure partitions, and enforce security roles. Think of it as Tabular Editor operations exposed to an AI.
- **Report MCP (powerbi-report-mcp):** Exposes the report layer. Through this, an AI agent can add visuals to pages, change visual types, apply formatting, manage filters, set themes, create bookmarks, duplicate pages, and arrange layouts. Think of it as the Power BI Desktop canvas exposed to an AI.
- The separation matters because a single task often spans both layers. "Build me a YoY comparison page" requires the model MCP to check whether a YoY measure exists (and create one if not), then the report MCP to add a visual, bind the measure, and format it. Understanding that these are two distinct tool sets — with different operations, different scopes, and different risk profiles — is essential before using them in practice.
- **How this relates to Copilot:** Copilot in Desktop operates within a single UI — you interact with one assistant that can suggest DAX, create visuals, and format reports. MCP separates these into distinct, programmable layers. The conceptual model (model vs. report) is the same; MCP just makes it explicit and scriptable.

**Key distinction to land:** Model MCP changes your data model (higher risk, more governance). Report MCP changes your visuals (lower risk, more iterative). Copilot blends both behind a single UI. Know which layer you're operating in at all times.

### Sub-topic 4: Building for AI consumers, not just human consumers

**What this covers:**

- The traditional Power BI development mindset optimises for a human looking at a report. Column names can be abbreviated because the report title gives context. Measures can be cryptic because the visual label clarifies intent. Descriptions are optional because the developer knows what things mean.
- An AI consumer has none of that visual context. It reads the model schema — table names, column names, descriptions, relationships — and that's all it has. If a measure is called `GM%` with no description, the AI has to guess whether that's gross margin, growth margin, or something else entirely.
- This applies to every AI tool in the stack: Copilot reading your model to suggest DAX, Copilot in a published report answering user questions, and MCP agents performing development tasks. In all cases, the model needs to be self-documenting.
- Practical implications: every measure needs a description, every table needs a description, naming must be consistent and unambiguous, display folders must be logical, and hidden columns should be deliberately curated (not just everything marked hidden because someone cleaned up a report once).

**Key distinction to land:** If your model can't explain itself without a human narrator, it's not AI-ready — for Copilot or anything else.

---

## Week 2: Getting your model Copilot-ready

**Main topic:** *The metadata, naming, and structure standards that make AI work*

This week is where Week 1's concepts become actionable. We take the abstract idea of "model quality for AI" and break it into a concrete checklist of things to fix, add, and standardise. This is the most hands-on prep week — by the end, participants should be able to audit any semantic model and identify exactly what's missing for AI readiness. This maps directly to the PRISMA initiative's AI-readiness checklist concept.

### Sub-topic 1: Descriptions, synonyms, and linguistic schema

**What this covers:**

- **Descriptions** are the single most impactful metadata field for AI readiness. Copilot reads measure and column descriptions to understand what things mean. An empty description forces the AI to infer from the name alone — which works for `Total Sales` but fails for `NR_LY_Adj`.
- Good descriptions follow a pattern: what the measure calculates, what filters or context it respects, and what business question it answers. For example: *"Calculates gross margin percentage as (Revenue - COGS) / Revenue. Respects all slicer context. Use for profitability analysis across product categories."*
- **Synonyms** allow Copilot to map natural language queries to model objects. If your measure is called `Revenue` but users say "sales" or "turnover," synonyms bridge that gap. Without them, Copilot either guesses wrong or returns nothing.
- **Linguistic schema** is the full Q&A configuration layer — it defines how Copilot interprets phrases, maps them to tables and columns, and resolves ambiguity. Most teams skip this entirely, but it's the difference between Copilot that "sort of works" and Copilot that feels like it understands your business.

**Key distinction to land:** Descriptions are the minimum. Synonyms are the multiplier. Linguistic schema is the polish.

### Sub-topic 2: Naming conventions and consistency

**What this covers:**

- AI models are pattern matchers. Consistent naming helps them recognise relationships between objects. If one table uses `DateKey` and another uses `Date_ID` and a third uses `CalendarDate`, the AI treats them as unrelated — even though they all serve the same purpose.
- Naming standards to enforce: measures should use business-readable names (no abbreviations), columns should follow a consistent casing pattern, tables should use singular or plural consistently (not a mix), and date-related columns should use a standard suffix pattern.
- Common anti-patterns that break AI: abbreviations that are ambiguous (`Amt` — amount or amendment?), internal codes as column names (`FLD_047`), inconsistent casing (`totalSales` vs `Total_Sales` vs `TotalSales`), and duplicated names across tables without clear table prefixes.
- The "rename test": if you showed someone the measure list without any report context, could they understand what each measure calculates from its name alone? If not, AI can't either.

**Key distinction to land:** Naming isn't cosmetic. It's the primary signal AI uses to understand your model's structure.

### Sub-topic 3: Measure structure and properties

**What this covers:**

- Beyond names and descriptions, measures have structural properties that affect AI behaviour — both in Copilot and MCP workflows.
- **Display folders:** Logical grouping of measures into folders (e.g., `Revenue`, `Profitability`, `Volume`) helps both humans and AI navigate large measure sets. Without folders, Copilot presents a flat list of 200+ measures with no structure — making it harder to find the right one.
- **Format strings:** Explicitly setting format strings (currency, percentage, integer) tells AI how to present results. A measure that returns `0.2534` without a format string could be displayed as-is, as 25.34%, or as 25% — the AI has to guess.
- **SummarizeBy:** Setting `SummarizeBy = None` on non-aggregatable columns prevents Copilot from offering meaningless aggregations (like summing customer IDs). This is one of the most overlooked properties.
- **IsAvailableInMDX:** Controls whether a column appears in Copilot's available field list. Hiding internal or technical columns through this property reduces noise and prevents AI from using fields that aren't meant for analysis.

**Key distinction to land:** These aren't obscure settings — they're the control surface for what AI can and can't do with your model.

### Sub-topic 4: The AI-readiness checklist

**What this covers:**

- A structured audit framework for evaluating any semantic model against AI and Copilot requirements. This isn't a vague maturity model — it's a concrete pass/fail checklist that can be automated.
- Categories to assess: metadata completeness (% of measures with descriptions, % of tables with descriptions), naming consistency (standardised patterns applied), structural hygiene (no orphan columns, no unused measures, referential integrity set correctly), property configuration (SummarizeBy, format strings, display folders, IsAvailableInMDX), and relationship quality (cardinality set correctly, cross-filter direction intentional).
- The checklist can be run manually (reviewing model properties in Tabular Editor) or automated (via a Fabric Notebook that connects to the model and scores each category). The automated approach is part of the PRISMA framework.
- Scoring approach: each category gets a red/amber/green status. A model needs green across all categories before it's considered Copilot-ready. This gives teams a clear target and a measurable improvement path.

**Key distinction to land:** AI readiness isn't subjective. It's measurable, and this checklist is the measurement tool.

---

## Week 3: Prompting for Power BI workflows

**Main topic:** *Repeatable patterns for getting reliable AI outputs in BI work*

Now that participants understand what makes a good model (Week 2), this week teaches them how to communicate effectively with AI tools in a BI context. This isn't generic prompt engineering — it's specifically about the patterns that work when your task involves DAX, semantic models, report layouts, and data analysis. The skills learned here apply directly to Copilot (Week 4) and MCP (Week 5) — prompting quality is the common denominator across all AI tools in the stack.

### Sub-topic 1: Anatomy of a good BI prompt

**What this covers:**

- A strong BI prompt has five components: **role** (what expertise the AI should bring), **model context** (what the data looks like), **task** (what you want done), **constraints** (what to avoid or enforce), and **output format** (how you want the result structured).
- **Role:** "You are a Power BI developer with expertise in DAX and star-schema modelling" sets the right frame. Without it, the AI might optimise for general data analysis rather than Power BI-specific patterns.
- **Model context:** This is the critical difference between BI prompting and general prompting. You need to tell the AI about your tables, columns, relationships, and existing measures — or it will hallucinate column names. The more schema context you provide, the more accurate the output. In Copilot (Week 4), some context is provided automatically because Copilot can see your model. In MCP (Week 5), the AI gets full schema access. But for general prompting, you need to supply it manually.
- **Task:** Be specific about what "done" looks like. "Write a DAX measure" is vague. "Write a DAX measure that calculates year-over-year revenue growth as a percentage, handling the case where prior year is zero" is actionable.
- **Constraints:** "Use only columns from the Sales and Date tables," "Follow our naming convention of [pattern]," "Do not use CALCULATE with multiple filter arguments." Constraints prevent the AI from generating technically correct but organisationally wrong outputs.
- **Output format:** "Return the DAX expression only, with a one-line comment explaining the logic" vs. "Return the DAX with a full explanation of each function used." Match the format to your workflow — if you're pasting into Tabular Editor, you don't need a tutorial.

**Key distinction to land:** BI prompting is mostly about context. The better you describe your model, the better the output.

### Sub-topic 2: Prompting for DAX generation

**What this covers:**

- DAX is the highest-value and highest-risk prompting use case in Power BI. When it works, AI-generated DAX can save significant time. When it fails, it produces measures that look correct but return wrong numbers — which is worse than an obvious error.
- **The schema context problem:** AI models don't know your column names, table relationships, or existing measures unless you tell them. The most common failure mode is hallucinated column names — the AI invents `Sales[Amount]` when your column is actually `FactSales[SalesAmount]`. Always provide the relevant table and column names explicitly.
- **Prompting patterns that work for DAX:**
  - Start with the calculation in plain language before asking for DAX: "I need to calculate the percentage of total revenue contributed by each product category, where the total is always the grand total regardless of filter context."
  - Provide sample data and expected output: "Given these three rows [example], the measure should return [expected result]."
  - Specify which DAX patterns to use or avoid: "Use DIVIDE instead of division operator," "Prefer CALCULATETABLE over FILTER for performance."
  - Ask for the measure in steps if it's complex: "First, write the base measure. Then, write the time intelligence wrapper around it."
- **Validation habit:** Always ask the AI to explain its DAX logic step by step after generating it. If the explanation doesn't match your intent, the DAX is wrong — even if it looks right.

**Key distinction to land:** Never trust AI-generated DAX without understanding it. The prompt should be designed to make the logic transparent, not just the syntax correct.

### Sub-topic 3: Iterative refinement

**What this covers:**

- The biggest prompting mistake in BI work is treating it as one-shot: send a prompt, get a result, paste it in. Effective AI-assisted development is conversational — you refine through multiple rounds.
- **The refinement loop:** Generate → review → identify the gap → refine the prompt → regenerate. Each round should narrow the gap between what you got and what you need. Crucially, you're refining the prompt, not just saying "try again" — each iteration adds new context or constraints based on what went wrong.
- **Common refinement patterns:**
  - "The measure handles the basic case correctly but doesn't account for [edge case]. Add handling for when [condition]."
  - "The DAX is correct but uses SUMX where a simple SUM would work. Simplify for readability."
  - "The visual layout is close but the card visuals should be in a single row at the top, not scattered across the page."
  - "This works for the current month but I need it to dynamically reference the latest complete month in the data."
- **When to restart vs. refine:** If after 3-4 refinement rounds the output still isn't converging, the original framing is likely wrong. Restart with a different approach rather than continuing to patch. A common sign: you're adding so many constraints that the prompt is longer than the solution.
- **This applies to every AI surface:** The refinement loop works the same in a general chat, in Copilot, and in MCP conversations. The skill is transferable — learn it once in Week 3, apply it everywhere in Weeks 4 and 5.

**Key distinction to land:** Iteration isn't failure — it's the method. Plan for 2-3 rounds on any non-trivial task.

### Sub-topic 4: Building a team prompt library

**What this covers:**

- Once you've refined a prompt that reliably produces a good result for a common task, that prompt becomes a reusable asset. A team prompt library captures these patterns so people don't reinvent the wheel.
- **What to save:** Prompts for recurring tasks — creating time intelligence measures, generating standard report layouts, auditing model metadata, writing DAX for common KPIs. The prompt should include the template structure with placeholders for model-specific details (table names, measure names, business logic).
- **How to structure entries:** Each library entry should contain: the task description (when to use this prompt), the prompt template (with `[placeholders]` for variable parts), an example of a filled-in prompt, an example of the expected output, and notes on common modifications.
- **What not to save:** One-off prompts for unique tasks, prompts that only work with a specific model's schema (save the pattern, not the instance), and prompts that haven't been validated through at least 2-3 successful uses.
- **Sharing and governance:** The library should live somewhere accessible to the team (a shared repo, a wiki, a Teams channel). Include a simple quality bar — prompts need a minimum of two successful uses before being added. Encourage people to submit their refined prompts but curate to avoid bloat.
- **Copilot-specific prompts vs. general prompts:** Some prompts are designed for Copilot in Desktop (shorter, more conversational, relying on Copilot's model access). Others are for general LLM use (longer, with full schema context included). Label them clearly in the library so people pick the right version.

**Key distinction to land:** A prompt library is not a document dump. It's a curated set of proven patterns with clear usage instructions.

---

## Week 4: Copilot for Power BI developers

**Main topic:** *Using Copilot as a development accelerator inside Power BI Desktop*

This week takes the prompting foundations from Week 3 and applies them directly inside Power BI Desktop's Copilot. Most training treats Copilot as an end-user Q&A tool — this week reframes it as a developer productivity tool. Participants will learn what Copilot can and can't do in the Desktop authoring experience, how to prompt it effectively for development tasks, where it shines (rapid prototyping, boilerplate DAX, report scaffolding) and where it falls short (complex business logic, cross-model patterns, precise layout control). This is the "comfortable AI" layer — built in, low friction, immediate feedback — before Week 5 introduces the more powerful but more complex MCP approach.

### Sub-topic 1: Copilot's developer capabilities — what it actually does

**What this covers:**

- Copilot in Power BI Desktop is more than a chatbot in a side panel. It has specific developer-facing capabilities that most people haven't fully explored.
- **DAX authoring:** You can describe a measure in natural language and Copilot generates the DAX. Because Copilot can see your model, it references actual table and column names — solving the hallucination problem from Week 3's general prompting. But it's not perfect: complex calculations still require careful prompting and review.
- **Measure explanation:** Copilot can explain existing DAX measures in plain language. This is valuable for onboarding (understanding a model someone else built), code review (verifying that a complex measure does what you think), and documentation (generating descriptions from existing expressions).
- **Report page creation:** Copilot can generate an entire report page from a description — selecting visual types, binding data fields, and arranging the layout. The results are a starting point, not a finished product, but they eliminate the blank-canvas problem.
- **Visual suggestions:** Based on the data fields you select, Copilot can suggest appropriate visual types and configurations. It understands common patterns (time series → line chart, category comparison → bar chart) but may miss domain-specific conventions.
- **Narrative and summary generation:** Copilot can create smart narrative visuals that describe what the data shows. This is useful for executive summaries and automated report commentary.
- **Data description and documentation:** Copilot can help generate descriptions for tables, columns, and measures — feeding directly back into the AI-readiness work from Week 2.

**Key distinction to land:** Copilot is a developer tool with real authoring capabilities. It's not just a chat interface — it can change your model and report.

### Sub-topic 2: Prompting Copilot effectively in Desktop

**What this covers:**

- Copilot in Desktop has different strengths and constraints than a general-purpose LLM. The prompting patterns from Week 3 still apply, but with adjustments.
- **What Copilot already knows:** Because Copilot has access to your open model, you don't need to provide full schema context. It knows your table names, column names, relationships, and existing measures. This means your prompts can be shorter and more focused on the task — less "my model has a Sales table with columns..." and more "create a YoY growth measure for Total Revenue."
- **What Copilot doesn't know:** Business context beyond what's in the model metadata. If your descriptions are empty (Week 2 problem), Copilot infers from names alone. It also doesn't know your team's conventions unless you state them. "Create a margin measure" might produce a perfectly valid DAX expression that doesn't match your naming pattern or calculation approach.
- **Prompt length matters:** Copilot's input window is more limited than a full LLM chat. Long, detailed prompts that work well in Claude or ChatGPT may need to be condensed for Copilot. Focus on the task and constraints; skip the role-setting and extensive context.
- **Conversational refinement works:** Copilot supports multi-turn conversations within a session. You can say "that's close but change it to use DIVIDE instead of the division operator" and Copilot will modify its output. The iterative refinement patterns from Week 3 apply directly.
- **Accepting vs. modifying suggestions:** Copilot offers suggestions that you can accept, modify, or reject. The discipline is in reviewing before accepting — especially for DAX. A good workflow: let Copilot generate, read the expression, ask Copilot to explain it, then accept or refine.

**Key distinction to land:** Copilot is context-aware but convention-blind. It knows your schema automatically, but you still need to guide it on business logic and standards.

### Sub-topic 3: Where Copilot excels vs. where it struggles

**What this covers:**

- Understanding Copilot's strengths and weaknesses prevents frustration and helps developers choose the right tool for each task.
- **Copilot excels at:**
  - **Boilerplate DAX:** Standard time intelligence (YTD, QTD, MTD, YoY), basic aggregations, percentage of total calculations. These are well-trodden patterns that Copilot handles reliably.
  - **Rapid report prototyping:** Getting a first draft of a report page in seconds rather than minutes. The layout won't be perfect, but it gives you something to iterate on rather than starting from scratch.
  - **Measure documentation:** Generating descriptions from existing DAX expressions. This is the fastest way to backfill empty descriptions across a model.
  - **Visual type selection:** Suggesting appropriate chart types for given data fields. Copilot's suggestions are usually reasonable defaults.
  - **Explaining unfamiliar DAX:** Translating complex existing measures into plain language. Useful when inheriting someone else's model.
- **Copilot struggles with:**
  - **Complex business logic:** Multi-step calculations with conditional logic, exception handling, and edge cases. These require precise prompting and usually multiple refinement rounds.
  - **Advanced DAX patterns:** Calculation groups, field parameters, dynamic measures, complex CALCULATE filter manipulation. Copilot can attempt these but the error rate is high.
  - **Precise layout control:** Pixel-level positioning, exact spacing, alignment to a wireframe. Copilot places visuals approximately — fine-tuning is manual.
  - **Cross-model awareness:** Copilot works within one model at a time. If your solution involves composite models or cross-model references, Copilot won't help with the integration points.
  - **Organisation-specific conventions:** Unless you explicitly state your standards, Copilot follows its own defaults. It won't know your naming convention, preferred DAX patterns, or visual design standards.

**Key distinction to land:** Use Copilot for the first 80% — scaffolding, boilerplate, documentation. Expect to do the last 20% manually or with more precise tools.

### Sub-topic 4: Copilot workflows for common developer tasks

**What this covers:**

- Concrete, step-by-step workflows for using Copilot in real development scenarios. These are the patterns participants can take back and use immediately.
- **Workflow 1 — Backfilling model documentation:**
  1. Open the model in Desktop with Copilot enabled.
  2. Ask Copilot to explain each undocumented measure.
  3. Review the explanation and refine it into a concise description.
  4. Use Copilot (or model MCP in Week 5) to write the description back to the measure.
  5. Repeat across the measure set. This can be batched — "explain these five measures" — though quality drops with batch size.
- **Workflow 2 — Scaffolding a new report page:**
  1. Describe the page purpose and key metrics: "Create a sales overview page showing total revenue, order count, and average order value as KPI cards at the top, with a revenue trend by month below, and a product category breakdown bar chart."
  2. Review Copilot's output — check visual types, data bindings, and layout.
  3. Refine in conversation: "Move the KPI cards into a single row" or "Change the bar chart to show top 10 categories only."
  4. Switch to manual for final positioning, conditional formatting, and design polish.
- **Workflow 3 — DAX development with review:**
  1. Describe the calculation in business terms first: "I need a measure that shows the running total of revenue within each fiscal year, resetting at the start of each new fiscal year."
  2. Review the generated DAX — check table/column references, filter context handling, and edge cases.
  3. Ask Copilot to explain the measure back to you. If the explanation doesn't match your intent, refine.
  4. Test with known data before deploying.
- **Workflow 4 — Exploring an inherited model:**
  1. Open a model you didn't build.
  2. Ask Copilot to summarise the model structure: "What tables are in this model and how are they related?"
  3. Ask Copilot to explain key measures: "What does [Measure Name] calculate?"
  4. Use the explanations to build a mental model before making changes.

**Key distinction to land:** Copilot is most powerful when used as part of a workflow, not as a one-shot tool. The review step is non-negotiable.

---

## Week 5: Developing with MCP layers

**Main topic:** *Applying prompting skills to model MCP and report MCP for full programmatic control*

This is where everything comes together. Participants have a model ready for AI (Week 2), they know how to prompt effectively (Week 3), they've applied those skills in Copilot (Week 4), and now they step up to the MCP layers for full programmatic control. The key shift: where Copilot operates within the Power BI Desktop UI and offers suggestions you accept or reject, MCP gives an AI agent direct access to model and report operations. It's more powerful, more flexible, and requires more discipline. The prompting skills from Weeks 3 and 4 carry directly — but the scope of what you can accomplish in a single conversation expands significantly.

### Sub-topic 1: Model MCP — working with the semantic model

**What this covers:**

- The model MCP layer (powerbi-modeling-mcp) exposes semantic model operations to an AI agent. This means the AI can read your model's actual structure — no more manually listing table names in your prompt. It can also write to the model — creating measures, modifying properties, managing relationships.
- **Read operations:** Querying the schema (list all tables, show columns in a table, list measures with their expressions), running DAX queries against the model, inspecting relationship configurations, checking metadata completeness (which measures have descriptions, which don't).
- **Write operations:** Creating new measures, modifying measure expressions, setting descriptions and display folders, managing calculation groups and calculation items, configuring column properties (SummarizeBy, IsAvailableInMDX, format strings), creating or modifying relationships.
- **How this compares to Copilot:** Copilot can create measures one at a time through its suggestion UI. Model MCP can create 20 measures in a single conversation, apply descriptions to all of them, organise them into display folders, and set format strings — without ever touching the Desktop UI. It's the difference between assisted editing and batch processing.
- **Practical workflow examples:**
  - "Show me all measures that don't have descriptions" → model MCP lists them → "Generate descriptions for each based on their DAX expressions" → model MCP writes the descriptions. (This is Workflow 1 from Week 4, but at scale.)
  - "Create a standard set of time intelligence measures for [base measure]" → model MCP reads the date table structure → generates and creates YoY, MoM, YTD, MTD variants.
  - "Audit the model for AI readiness" → model MCP inspects metadata, naming, relationships, and properties → produces a scorecard.
- **What to watch out for:** Model MCP writes are real changes to your model. Unlike Copilot (where you review and accept each suggestion), MCP operations execute directly. This makes the review discipline from Week 4 even more important — and it raises the governance question: who can run model MCP operations, on which models, and with what review process.

**Key distinction to land:** Model MCP is Copilot's modelling capabilities unbound from the UI. More power, more speed, more responsibility.

### Sub-topic 2: Report MCP — working with visuals and layout

**What this covers:**

- The report MCP layer (powerbi-report-mcp) exposes report-level operations. The AI can read page structure and visual configurations, and it can create, modify, and arrange visuals on a page.
- **Read operations:** Listing pages and their visuals, getting visual definitions (type, bindings, formatting), listing filters and bookmarks, inspecting the applied theme, getting report-level settings.
- **Write operations:** Adding visuals to a page (specifying type, data bindings, position, and size), changing visual types, applying formatting, managing filters, setting themes, creating and managing bookmarks, duplicating pages and visuals, arranging layouts.
- **How this compares to Copilot:** Copilot in Desktop can create a report page from a description, but you interact with it one suggestion at a time. Report MCP can build an entire multi-page report in a single conversation — creating pages, adding visuals, applying themes, and setting up cross-page filtering. It also supports operations Copilot doesn't expose, like bulk formatting changes, programmatic theme application, and visual duplication with modified bindings.
- **Practical workflow examples:**
  - "Create a new page with a KPI summary row at the top and a trend chart below" → report MCP creates the page, adds card visuals bound to key measures, adds a line chart, positions everything.
  - "Apply our standard dark theme and reformat all visuals to use DM Sans" → report MCP applies the theme JSON and updates visual formatting.
  - "Duplicate this page but swap the product dimension for the region dimension" → report MCP duplicates, then rebinds the relevant visuals.
- **Iteration is natural here:** Report layout is inherently visual and subjective. Expect to do multiple rounds — "move the cards closer together," "make the chart wider," "change the bar chart to a column chart." This is where Week 3's iterative refinement patterns pay off directly.

**Key distinction to land:** Report MCP is lower risk than model MCP — you're changing how things look, not what they calculate. This makes it a great place to build confidence before tackling model-level MCP operations.

### Sub-topic 3: Chaining both layers

**What this covers:**

- The most powerful MCP workflows span both layers. A single request like "build me a sales performance page" might require the AI to: check the model for existing sales measures (model MCP), create any missing ones like YoY growth (model MCP), create a new report page (report MCP), add visuals bound to those measures (report MCP), and apply formatting (report MCP).
- **The workflow pattern:** Inspect → create/modify model objects → create/modify report objects → review and refine. The AI handles the chaining naturally — you describe the end state, and it works through the layers in order.
- **Context flows between layers:** When the AI reads your model through model MCP, it learns your schema. It then uses that schema knowledge when building visuals through report MCP — binding the correct measures and columns without you having to specify them. This is where the "automatic context" advantage of MCP over generic prompting becomes most tangible.
- **Practical example — building a complete report page from a request:**
  1. User: "Create a profitability overview page with gross margin %, net margin %, and revenue trends by quarter, with a region slicer."
  2. AI reads the model → finds `Gross Margin %` exists but `Net Margin %` doesn't → creates the missing measure via model MCP → creates a new page via report MCP → adds card visuals for the margin measures → adds a line chart for revenue by quarter → adds a slicer for region → positions and formats everything.
  3. User reviews → "Move the slicer to the left side and make the cards use our standard red accent for negative values." → AI refines via report MCP.
- **Comparison to Copilot workflow:** In Copilot, the same task would involve: asking Copilot to create the measure (accept/reject), then asking Copilot to create the page (accept/reject), then manually adjusting layout. The end result is similar, but MCP does it in one fluid conversation. The trade-off: Copilot gives you a review gate at each step; MCP requires you to review the end result.

**Key distinction to land:** Chaining isn't a special mode — it's what happens naturally when you give the AI a goal that spans model and report. The layers exist at the technical level; to you, it's just a conversation.

### Sub-topic 4: Picking the right tool for the job

**What this covers:**

- With three AI tools in the stack (Copilot, model MCP, report MCP) plus Tabular Editor and manual development, understanding when to use what prevents over-reliance on any single tool.
- **Use Copilot when:** You want quick, interactive assistance inside Desktop — creating a single measure, getting a DAX explanation, scaffolding a report page, or exploring an unfamiliar model. Low setup, immediate feedback, built-in review gates.
- **Use MCP when:** The task is repetitive across many objects (adding descriptions to 50 measures), the task benefits from full model context (creating measures that reference existing model structure), you want rapid prototyping of multi-page reports, or the task spans both model and report layers in a single workflow. Higher power, batch capability, requires more discipline.
- **Use Tabular Editor when:** You need batch operations with precise control (BPA rule enforcement), you're doing complex model refactoring (changing relationship structures, managing perspectives), you need script repeatability (the same C# script running across multiple models), or you need to review changes before saving (TE3's change tracking).
- **Work manually when:** The task is a one-off visual adjustment that's faster to click than describe, you need pixel-perfect layout control, or you're exploring design options visually rather than declaratively.
- **The hybrid approach:** In practice, most development sessions mix all of these. Use Copilot to explore and prototype a measure, switch to MCP to batch-create variants, use Tabular Editor for governance checks, and do final visual polish manually. The skill is knowing when to switch — not being locked into one tool.

**Key distinction to land:** Copilot for interactive assistance, MCP for batch and cross-layer work, Tabular Editor for governance and scripting, manual for visual polish. Use all of them.
