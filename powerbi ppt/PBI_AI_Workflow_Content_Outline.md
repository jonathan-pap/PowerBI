# Power BI AI Workflow — Content outline

**Status:** Draft
**Scope:** 4-week training programme covering AI integration in Power BI development workflows

---

## Week 1: AI in the Power BI ecosystem

**Main topic:** *What AI actually does in Power BI today — and where it's heading*

This week establishes the landscape. Most people lump Copilot, MCP, and general AI prompting into one vague category of "AI in Power BI." The goal here is to draw clear lines between what each layer does, where value actually comes from, and why the semantic model is the lynchpin of all of it. By the end of this week, everyone should be able to articulate the difference between Copilot (end-user-facing), MCP (developer-facing), and general LLM prompting (flexible but unconnected to your data).

### Sub-topic 1: Copilot vs. MCP vs. traditional automation

**What this covers:**

- Copilot is Microsoft's end-user AI surface — it sits inside Power BI reports and lets business users ask natural language questions against a semantic model. It generates DAX, builds visuals, and summarises data. But it only works well when the model underneath is well-structured, well-described, and consistent.
- MCP (Model Context Protocol) is a developer-facing integration layer. It exposes semantic model operations (model MCP) and report operations (report MCP) to AI agents like Claude. This is not Copilot — it's a programmable interface for AI-assisted development.
- Traditional automation (Power Automate, REST APIs, PowerShell) still has its place for scheduled, deterministic tasks. AI doesn't replace automation — it fills the gap where tasks are too varied or context-dependent for rigid scripts.

**Key distinction to land:** Copilot consumes a good model. MCP helps you build and maintain one. They're complementary, not competing.

### Sub-topic 2: The semantic model as the "brain"

**What this covers:**

- Every AI capability in Power BI — whether Copilot, MCP, or an external LLM — depends on the quality of the semantic model. A model with cryptic column names, no descriptions, and inconsistent measures will produce bad AI outputs regardless of how good the AI is.
- The model is effectively the "system prompt" for Copilot. Descriptions become the context the AI reads. Display folders become the organisational structure it navigates. Format strings tell it how to present results. If you wouldn't hand someone a spreadsheet with columns named `Col1`, `Col2`, `Col3` and expect them to do analysis, don't expect Copilot to do it either.
- This reframes model development: you're not just building for report consumers anymore, you're building for AI consumers. That has implications for metadata completeness that most teams haven't internalised yet.

**Key distinction to land:** Model quality is not a nice-to-have for AI — it's the determining factor. Week 2 goes deep on exactly what "quality" means in this context.

### Sub-topic 3: The two MCP layers

**What this covers:**

- **Model MCP (powerbi-modeling-mcp):** Exposes the semantic model for programmatic interaction. Through this layer, an AI agent can inspect tables, columns, relationships, and measures. It can run DAX queries, create or modify measures, manage calculation groups, set descriptions, configure partitions, and enforce security roles. Think of it as Tabular Editor operations exposed to an AI.
- **Report MCP (powerbi-report-mcp):** Exposes the report layer. Through this, an AI agent can add visuals to pages, change visual types, apply formatting, manage filters, set themes, create bookmarks, duplicate pages, and arrange layouts. Think of it as the Power BI Desktop canvas exposed to an AI.
- The separation matters because a single task often spans both layers. "Build me a YoY comparison page" requires the model MCP to check whether a YoY measure exists (and create one if not), then the report MCP to add a visual, bind the measure, and format it. Understanding that these are two distinct tool sets — with different operations, different scopes, and different risk profiles — is essential before using them in practice.

**Key distinction to land:** Model MCP changes your data model (higher risk, more governance). Report MCP changes your visuals (lower risk, more iterative). Know which layer you're operating in at all times.

### Sub-topic 4: Building for AI consumers, not just human consumers

**What this covers:**

- The traditional Power BI development mindset optimises for a human looking at a report. Column names can be abbreviated because the report title gives context. Measures can be cryptic because the visual label clarifies intent. Descriptions are optional because the developer knows what things mean.
- An AI consumer has none of that visual context. It reads the model schema — table names, column names, descriptions, relationships — and that's all it has. If a measure is called `GM%` with no description, the AI has to guess whether that's gross margin, growth margin, or something else entirely.
- This mindset shift applies to both Copilot (which reads the model to answer user questions) and MCP workflows (where an AI agent reads the model to perform development tasks). In both cases, the model needs to be self-documenting.
- Practical implications: every measure needs a description, every table needs a description, naming must be consistent and unambiguous, display folders must be logical, and hidden columns should be deliberately curated (not just everything marked hidden because someone cleaned up a report once).

**Key distinction to land:** If your model can't explain itself without a human narrator, it's not AI-ready.

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

- Beyond names and descriptions, measures have structural properties that affect AI behaviour.
- **Display folders:** Logical grouping of measures into folders (e.g., `Revenue`, `Profitability`, `Volume`) helps both humans and AI navigate large measure sets. Without folders, Copilot presents a flat list of 200+ measures with no structure — making it harder to find the right one.
- **Format strings:** Explicitly setting format strings (currency, percentage, integer) tells AI how to present results. A measure that returns `0.2534` without a format string could be displayed as-is, as 25.34%, or as 25% — the AI has to guess.
- **SummarizeBy:** Setting `SummarizeBy = None` on non-aggregatable columns prevents Copilot from offering meaningless aggregations (like summing customer IDs). This is one of the most overlooked properties.
- **IsAvailableInMDX:** Controls whether a column appears in Copilot's available field list. Hiding internal or technical columns through this property reduces noise and prevents AI from using fields that aren't meant for analysis.

**Key distinction to land:** These aren't obscure settings — they're the control surface for what AI can and can't do with your model.

### Sub-topic 4: The AI-readiness checklist

**What this covers:**

- A structured audit framework for evaluating any semantic model against AI and Copilot requirements. This isn't a vague maturity model — it's a concrete pass/fail checklist that can be automated.
- Categories to assess: metadata completeness (% of measures with descriptions, % of tables with descriptions), naming consistency (standardised patterns applied), structural hygiene (no orphan columns, no unused measures, referential integrity set correctly), property configuration (SummarizeBy, format strings, display folders, IsAvailableInMDX), and relationship quality (cardinality set correctly, cross-filter direction intentional).
- The checklist can be run manually (reviewing model properties in Tabular Editor) or automated (via a Fabric Notebook that connects to the model and scores each category). The automated approach is covered in Week 5's PRISMA framework — for now, the focus is on understanding what to check and why each item matters.
- Scoring approach: each category gets a red/amber/green status. A model needs green across all categories before it's considered Copilot-ready. This gives teams a clear target and a measurable improvement path.

**Key distinction to land:** AI readiness isn't subjective. It's measurable, and this checklist is the measurement tool.

---

## Week 3: Prompting for Power BI workflows

**Main topic:** *Repeatable patterns for getting reliable AI outputs in BI work*

Now that participants understand what makes a good model (Week 2), this week teaches them how to communicate effectively with AI tools in a BI context. This isn't generic prompt engineering — it's specifically about the patterns that work when your task involves DAX, semantic models, report layouts, and data analysis. The skills learned here become the foundation for Week 4's MCP work, where prompting quality directly determines output quality.

### Sub-topic 1: Anatomy of a good BI prompt

**What this covers:**

- A strong BI prompt has five components: **role** (what expertise the AI should bring), **model context** (what the data looks like), **task** (what you want done), **constraints** (what to avoid or enforce), and **output format** (how you want the result structured).
- **Role:** "You are a Power BI developer with expertise in DAX and star-schema modelling" sets the right frame. Without it, the AI might optimise for general data analysis rather than Power BI-specific patterns.
- **Model context:** This is the critical difference between BI prompting and general prompting. You need to tell the AI about your tables, columns, relationships, and existing measures — or it will hallucinate column names. The more schema context you provide, the more accurate the output. For MCP workflows (Week 4), this context is provided automatically by the model MCP layer — but for general prompting, you need to supply it manually.
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
- **Conversation context matters:** In an AI chat, earlier messages are still in context. You don't need to repeat your full schema every round — just reference what changed. "Same tables as before, but add a filter for active customers only."

**Key distinction to land:** Iteration isn't failure — it's the method. Plan for 2-3 rounds on any non-trivial task.

### Sub-topic 4: Building a team prompt library

**What this covers:**

- Once you've refined a prompt that reliably produces a good result for a common task, that prompt becomes a reusable asset. A team prompt library captures these patterns so people don't reinvent the wheel.
- **What to save:** Prompts for recurring tasks — creating time intelligence measures, generating standard report layouts, auditing model metadata, writing DAX for common KPIs. The prompt should include the template structure with placeholders for model-specific details (table names, measure names, business logic).
- **How to structure entries:** Each library entry should contain: the task description (when to use this prompt), the prompt template (with `[placeholders]` for variable parts), an example of a filled-in prompt, an example of the expected output, and notes on common modifications.
- **What not to save:** One-off prompts for unique tasks, prompts that only work with a specific model's schema (save the pattern, not the instance), and prompts that haven't been validated through at least 2-3 successful uses.
- **Sharing and governance:** The library should live somewhere accessible to the team (a shared repo, a wiki, a Teams channel). Include a simple quality bar — prompts need a minimum of two successful uses before being added. Encourage people to submit their refined prompts but curate to avoid bloat.

**Key distinction to land:** A prompt library is not a document dump. It's a curated set of proven patterns with clear usage instructions.

---

## Week 4: Developing with MCP layers

**Main topic:** *Applying prompting skills to model MCP and report MCP as development tools*

This is where everything comes together. Participants have a model ready for AI (Week 2), they know how to prompt effectively (Week 3), and now they apply both to the MCP layers for actual development work. The key shift: instead of prompting in a generic chat and pasting results into Power BI manually, MCP lets the AI operate directly on the model and report. The prompting patterns from Week 3 still apply — but the AI now has live access to your schema, so context provision becomes automatic.

### Sub-topic 1: Model MCP — working with the semantic model

**What this covers:**

- The model MCP layer (powerbi-modeling-mcp) exposes semantic model operations to an AI agent. This means the AI can read your model's actual structure — no more manually listing table names in your prompt. It can also write to the model — creating measures, modifying properties, managing relationships.
- **Read operations:** Querying the schema (list all tables, show columns in a table, list measures with their expressions), running DAX queries against the model, inspecting relationship configurations, checking metadata completeness (which measures have descriptions, which don't).
- **Write operations:** Creating new measures, modifying measure expressions, setting descriptions and display folders, managing calculation groups and calculation items, configuring column properties (SummarizeBy, IsAvailableInMDX, format strings), creating or modifying relationships.
- **Practical workflow examples:**
  - "Show me all measures that don't have descriptions" → model MCP lists them → "Generate descriptions for each based on their DAX expressions" → model MCP writes the descriptions.
  - "Create a standard set of time intelligence measures for [base measure]" → model MCP reads the date table structure → generates and creates YoY, MoM, YTD, MTD variants.
  - "Audit the model for AI readiness" → model MCP inspects metadata, naming, relationships, and properties → produces a scorecard.
- **What to watch out for:** Model MCP writes are real changes to your model. Unlike prompting in a generic chat (where you copy-paste and can review first), MCP operations execute directly. This makes the governance question real — who can run model MCP operations, on which models, and with what review process.

**Key distinction to land:** Model MCP eliminates the copy-paste gap between AI output and your model. That's powerful — and it means review discipline matters more, not less.

### Sub-topic 2: Report MCP — working with visuals and layout

**What this covers:**

- The report MCP layer (powerbi-report-mcp) exposes report-level operations. The AI can read page structure and visual configurations, and it can create, modify, and arrange visuals on a page.
- **Read operations:** Listing pages and their visuals, getting visual definitions (type, bindings, formatting), listing filters and bookmarks, inspecting the applied theme, getting report-level settings.
- **Write operations:** Adding visuals to a page (specifying type, data bindings, position, and size), changing visual types, applying formatting, managing filters, setting themes, creating and managing bookmarks, duplicating pages and visuals, arranging layouts.
- **Practical workflow examples:**
  - "Create a new page with a KPI summary row at the top and a trend chart below" → report MCP creates the page, adds card visuals bound to key measures, adds a line chart, positions everything.
  - "Apply our standard dark theme and reformat all visuals to use DM Sans" → report MCP applies the theme JSON and updates visual formatting.
  - "Duplicate this page but swap the product dimension for the region dimension" → report MCP duplicates, then rebinds the relevant visuals.
- **Iteration is natural here:** Report layout is inherently visual and subjective. Expect to do multiple rounds — "move the cards closer together," "make the chart wider," "change the bar chart to a column chart." This is where Week 3's iterative refinement patterns pay off directly.

**Key distinction to land:** Report MCP is lower risk than model MCP — you're changing how things look, not what they calculate. This makes it a great place to build confidence with AI-assisted development before tackling model changes.

### Sub-topic 3: Chaining both layers

**What this covers:**

- The most powerful MCP workflows span both layers. A single request like "build me a sales performance page" might require the AI to: check the model for existing sales measures (model MCP), create any missing ones like YoY growth (model MCP), create a new report page (report MCP), add visuals bound to those measures (report MCP), and apply formatting (report MCP).
- **The workflow pattern:** Inspect → create/modify model objects → create/modify report objects → review and refine. The AI handles the chaining naturally — you describe the end state, and it works through the layers in order.
- **Context flows between layers:** When the AI reads your model through model MCP, it learns your schema. It then uses that schema knowledge when building visuals through report MCP — binding the correct measures and columns without you having to specify them. This is where the "automatic context" advantage of MCP over generic prompting becomes tangible.
- **Practical example — building a complete report page from a request:**
  1. User: "Create a profitability overview page with gross margin %, net margin %, and revenue trends by quarter, with a region slicer."
  2. AI reads the model → finds `Gross Margin %` exists but `Net Margin %` doesn't → creates the missing measure via model MCP → creates a new page via report MCP → adds card visuals for the margin measures → adds a line chart for revenue by quarter → adds a slicer for region → positions and formats everything.
  3. User reviews → "Move the slicer to the left side and make the cards use our standard red accent for negative values." → AI refines via report MCP.

**Key distinction to land:** Chaining isn't a special mode — it's what happens naturally when you give the AI a goal that spans model and report. The layers exist at the technical level; to you, it's just a conversation.

### Sub-topic 4: Picking the right tool for the job

**What this covers:**

- MCP is powerful, but it's not always the right choice. Understanding when to use MCP vs. Tabular Editor vs. manual development prevents over-reliance on AI and keeps workflows efficient.
- **Use MCP when:** The task is repetitive across many objects (adding descriptions to 50 measures), the task benefits from model context (creating measures that reference existing model structure), you want rapid prototyping of report layouts, or the task spans both model and report layers.
- **Use Tabular Editor when:** You need batch operations with precise control (BPA rule enforcement), you're doing complex model refactoring (changing relationship structures, managing perspectives), you need script repeatability (the same C# script running across multiple models), or you need to review changes before saving (TE3's change tracking).
- **Work manually when:** The task is a one-off visual adjustment that's faster to click than describe, you need pixel-perfect layout control, or you're exploring design options visually rather than declaratively.
- **The hybrid approach:** In practice, most development sessions mix all three. Use MCP to scaffold a report page quickly, switch to manual for fine visual adjustments, use Tabular Editor for model governance checks. The skill is knowing when to switch — not being locked into one tool.

**Key distinction to land:** MCP is the fastest path for AI-describable tasks. Manual is the fastest path for visual/spatial tasks. Tabular Editor is the fastest path for governance and batch operations. Use all three.
