# Power BI Report MCP Server

**Version 0.2.1** — An MCP (Model Context Protocol) server that lets AI assistants programmatically create, edit, and format Power BI reports in PBIR format. Works with Claude Desktop, Claude Code, Cursor, Cline, and any MCP-compatible client.

---

## Quick Start

### 1. Build the server

```bash
cd powerbi-report-mcp
npm install
npm run build
```

### 2. Configure your MCP client

**Claude Desktop (Windows)**
`%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json`

**Claude Code**
`.claude/settings.json` or `claude mcp add`

**Cursor**
`~/.cursor/mcp.json` or `.cursor/mcp.json` in project root

**Cline (VS Code)**
Settings → Cline → MCP Servers

```json
{
  "mcpServers": {
    "powerbi-report-mcp": {
      "command": "node",
      "args": ["C:\\path\\to\\powerbi-report-mcp\\dist\\index.js"]
    }
  }
}
```

> The report path is **no longer required** in config. Use the `set_report` tool at runtime to connect to any report. You can still pass a path as a second argument as a default.

### 3. Connect to a report

Once the server is running, use the `set_report` tool:

```
Connect to C:\Projects\Sales.Report
```

Or pass a default path in the config args:
```json
"args": ["C:\\path\\to\\dist\\index.js", "C:\\Projects\\Sales.Report"]
```

### 4. Restart your MCP client

After changing config or rebuilding, restart the client to pick up the new MCP process.

---

## Tools Reference

### Report Connection

| Tool | Description |
|------|-------------|
| `set_report` | Connect to a report at runtime — switch without restarting the server |
| `get_report` | Show which report is currently connected |

### Page Management

| Tool | Description |
|------|-------------|
| `list_pages` | List all pages with IDs, names, sizes, and visual counts |
| `create_page` | Create a new page (name, width, height, display option) |
| `delete_page` | Delete a page and all its visuals |
| `rename_page` | Rename an existing page |
| `duplicate_page` | Clone an entire page including all visuals in one call |
| `reorder_pages` | Set the page order |
| `set_active_page` | Set which page opens by default |
| `update_page_size` | Change page dimensions and display mode |

### Visual Management

| Tool | Description |
|------|-------------|
| `add_visual` | Add one or many visuals with data bindings, formatting, and colors in one call |
| `delete_visual` | Remove a visual from a page |
| `duplicate_visual` | Clone a visual (optionally to another page) |
| `move_visual` | Reposition and resize a visual |
| `change_visual_type` | Swap visual type while keeping data bindings |
| `list_visuals` | List all visuals on a page with types and positions |
| `get_visual` | Get the full JSON definition of a visual |
| `get_visual_types` | List all supported visual types and their data buckets |

### Data Binding

| Tool | Description |
|------|-------------|
| `update_visual_bindings` | Replace data bindings on an existing visual |

Field types: **column** (raw column), **aggregation** (Sum/Avg/Count/Min/Max/Median/etc.), **measure** (DAX measure)

### Formatting

| Tool | Description |
|------|-------------|
| `format_visual` | Apply any formatting (axes, legend, labels, borders, background, etc.) |
| `set_visual_title` | Set title text, font, size, alignment, visibility |
| `set_datapoint_colors` | Set per-series data point colors |
| `apply_theme` | Apply a named theme to all visuals on a page in one call |

### Report Settings

| Tool | Description |
|------|-------------|
| `get_report_settings` | Read report-level settings and theme config |
| `update_report_settings` | Merge new settings into the report |

### Layout & Reload

| Tool | Description |
|------|-------------|
| `auto_layout` | Arrange all visuals into an automatic grid |
| `reload_report` | Close and reopen the report in Power BI Desktop |

---

## Batch add_visual

Create multiple visuals in a single tool call using the `visuals` array. Each visual supports inline formatting and data colors.

```json
{
  "pageId": "abc123",
  "visuals": [
    {
      "visualType": "card",
      "x": 30, "y": 45, "width": 250, "height": 90,
      "bindings": [{ "bucket": "Values", "field": "measure", "table": "Sales", "column": "Total Revenue" }],
      "containerFormat": [
        { "category": "background", "properties": { "color": "#1A1035" } },
        { "category": "border", "properties": { "color": "#7B68AE" } }
      ]
    },
    {
      "visualType": "lineChart",
      "x": 30, "y": 150, "width": 600, "height": 250,
      "bindings": [
        { "bucket": "Category", "field": "column", "table": "Date", "column": "Month" },
        { "bucket": "Y", "field": "measure", "table": "Sales", "column": "Revenue" }
      ],
      "visualFormat": [
        { "category": "categoryAxis", "properties": { "labelColor": "#E0D8F0" } },
        { "category": "valueAxis", "properties": { "gridlineColor": "#2D2250" } }
      ],
      "dataColors": [{ "color": "#B8A9E8" }, { "color": "#9DB5F5" }]
    }
  ]
}
```

Single visual (original syntax still works):
```json
{
  "pageId": "abc123",
  "visualType": "card",
  "x": 30, "y": 45, "width": 250, "height": 90
}
```

---

## Themes (`apply_theme`)

Apply a full page style in one call. Themes set backgrounds, borders, and data colors on every visual.

| Theme | Background | Borders | Data Colors |
|-------|-----------|---------|-------------|
| `dark` | `#161B22` (near-black) | `#30363D` (dark grey) | GitHub-style blues/greens |
| `light` | `#FFFFFF` (white) | `#E0E0E0` (light grey) | Soft blues/teals |
| `corporate` | `#FFFFFF` (white) | `#D1D5DB` (slate grey) | Professional blues |
| `blue-purple` | `#FFFFFF` (white) | `#6C63FF` (indigo) | Purple/violet palette |

```json
{ "pageId": "abc123", "theme": "dark", "applyDataColors": true }
```

After applying a theme, use `format_visual` to fine-tune individual visuals.

---

## Supported Visual Types

### Charts

| Type | Data Buckets |
|------|-------------|
| `barChart` | Category, Y, Series, Gradient |
| `clusteredBarChart` | Category, Y, Series, Gradient |
| `hundredPercentStackedBarChart` | Category, Y, Series |
| `columnChart` | Category, Y, Series, Gradient |
| `clusteredColumnChart` | Category, Y, Series, Gradient |
| `hundredPercentStackedColumnChart` | Category, Y, Series |
| `lineChart` | Category, Y, Y2, Series |
| `areaChart` | Category, Y, Y2, Series |
| `stackedAreaChart` | Category, Y, Series |
| `hundredPercentStackedAreaChart` | Category, Y, Series |
| `lineClusteredColumnComboChart` | Category, Y, Y2, Series |
| `lineStackedColumnComboChart` | Category, Y, Y2, Series |
| `ribbonChart` | Category, Y, Series |
| `waterfallChart` | Category, Y, Breakdown |
| `scatterChart` | Category, X, Y, Size, Series |
| `pieChart` | Category, Y, Series |
| `donutChart` | Category, Y, Series |
| `funnel` | Category, Y |
| `treemap` | Group, Values, Details |

### Maps

| Type | Data Buckets |
|------|-------------|
| `map` | Category, Size, Series |
| `filledMap` | Location, Legend, Values |

### Tables & Matrices

| Type | Data Buckets |
|------|-------------|
| `tableEx` | Values |
| `pivotTable` | Rows, Columns, Values |

### Cards & KPIs

| Type | Data Buckets |
|------|-------------|
| `card` | Values |
| `cardVisual` | Data, Rows |
| `multiRowCard` | Values |
| `kpi` | Indicator, TrendLine, Goal |
| `gauge` | Y, MinValue, MaxValue, TargetValue |

### Slicers

| Type | Data Buckets | Notes |
|------|-------------|-------|
| `slicer` | Values | `Basic` (list) or `Dropdown` mode, vertical/horizontal |
| `listSlicer` | Values | |
| `textSlicer` | Values | |
| `advancedSlicerVisual` | Values | |

### Other

| Type | Notes |
|------|-------|
| `textbox` | Set text via `textContent` parameter |
| `shape` | Rectangle, rounded rectangle, line, tab shapes |
| `basicShape` | |
| `image` | |
| `actionButton` | |
| `decompositionTreeVisual` | Buckets: Analyze, ExplainBy |

---

## Formatting Reference

### `target = "container"` — Visual Chrome

| Category | Key Properties |
|----------|---------------|
| `title` | `text`, `show`, `fontSize`, `fontFamily`, `alignment`, `fontColor`, `titleWrap` |
| `background` | `show`, `color` (hex), `transparency` (0–100) |
| `border` | `show`, `color` (hex), `width`, `radius` |
| `padding` | `top`, `bottom`, `left`, `right` |
| `dropShadow` | `show`, `position` (`Outer`/`Inner`) |
| `visualHeader` | `show` — hide the hover toolbar |

### `target = "visual"` — Visual Content

| Category | Key Properties | Applies To |
|----------|---------------|-----------|
| `categoryAxis` | `show`, `labelColor`, `fontSize`, `gridlineColor` | Bar, column, line, area, combo |
| `valueAxis` | `show`, `labelColor`, `fontSize`, `gridlineColor` | Bar, column, line, area, combo |
| `legend` | `show`, `position`, `labelColor`, `fontSize` | Charts with Series |
| `labels` | `show`, `color`, `fontSize`, `labelDisplayUnits` | Most chart types |
| `lineStyles` | `strokeWidth`, `lineChartType` (`curved`/`step`/`straight`) | Line, area, combo |
| `dataPoint` | `transparency` | Most chart types |
| `plotArea` | `transparency` | Charts |
| `grid` | `fontSize` | Table, pivot |
| `header` | `show`, `fontFamily`, `textSize` | Slicer |
| `items` | `fontFamily`, `textSize` | Slicer |

### Color Handling

Hex colors starting with `#` are automatically wrapped in PBIR format — just pass `"#4A90D9"`.

### Per-Series Colors (`set_datapoint_colors`)

```json
{
  "colors": [
    { "color": "#B8A9E8" },
    { "color": "#9DB5F5" },
    { "color": "#87BFFF", "seriesName": "financials.Country" }
  ]
}
```

---

## Connecting Other AI Models

The server is a standard MCP stdio process — any MCP-compatible client can use it.

| Client | Config location |
|--------|----------------|
| Claude Desktop | `%LOCALAPPDATA%\...\Claude\claude_desktop_config.json` |
| Claude Code | `.claude/settings.json` or `claude mcp add` |
| Cursor | `~/.cursor/mcp.json` |
| Cline (VS Code) | Settings → Cline → MCP Servers |
| Continue.dev | `~/.continue/config.json` |

For models without native MCP support (GPT-4, Gemini), use `mcp-proxy` to expose the server over HTTP/SSE, then connect via OpenAI function-calling.

---

## PBIR Format Overview

```
MyProject.Report/
  definition/
    report.json        # Report settings, themes
    version.json       # Format version
    pages/
      pages.json       # Page order and active page
      {pageId}/
        page.json      # Page name, size, display option
        visuals/
          {visualId}/
            visual.json  # Visual type, data, formatting
```

Key rules:
- `visualContainerObjects` (title, background, border) goes **inside** the `visual` object
- `objects` (axes, legend, labels) also goes **inside** the `visual` object
- Color format: `{ solid: { color: { expr: { Literal: { Value: "'#XXXXXX'" } } } } }`
- Numbers use `D` suffix for decimals, `L` for integers (handled automatically by the server)

---

## Example: Build a Dashboard in Minimal Calls

```
1. set_report          → connect to target .Report
2. create_page         → "Sales Dashboard" (1280x720)
3. add_visual (batch)  → all visuals with inline formatting + data colors
4. apply_theme         → page-wide dark/light/corporate style
5. reload_report       → open in Power BI Desktop
```

A typical 10-visual dashboard can be built in **4–6 tool calls** using batch mode.

---

## Tips

- Use `set_report` to switch between reports mid-session without restarting
- `duplicate_page` clones an entire page with all visuals — great for theme variants
- `apply_theme` then `format_visual` for fine-tuning is the fastest styling workflow
- `auto_layout` arranges visuals into a grid, then use `move_visual` to tweak
- `format_visual` merges with existing formatting — safe to call incrementally
- All tools return `{ success: false, error: "..." }` on failure — the server never crashes
