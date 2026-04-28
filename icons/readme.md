# Icons

A small icon + color toolkit for Power BI reports.

## Files

| File | What it is |
| --- | --- |
| `icon library.pbip` / `.pbix` | Power BI report that browses the icon sets and shows them in use. Open `.pbip` for a diff-friendly project, or `.pbix` for a single-file copy. |
| `icon_theme.json` | A Power BI theme (the "Iconify PRISMA" theme) — drop into Power BI Desktop via *View → Themes → Browse*. |
| `color_palette.csv` | Named colors with `Light` / `Base` / `Dark` variants and SVG-safe hex codes. |
| `iconify_library/` | CSVs of icon sets (lucide, mdi, fluent, carbon, ph, bi, clarity, boxicons, arcticons, cbi). Each row has `SetName, IconName, FullName, DataImage` — the `DataImage` is a `data:image/svg+xml` URI you can paste straight into a Power BI image/measure. |
| `colors.ipynb` | Notebook for generating / exploring the palette. |
| `icons.ipynb` | Notebook for pulling icon sets from [Iconify](https://iconify.design) and writing them to `iconify_library/`. |

## Quick uses

- **Use an icon in a measure**

  ```DAX
  Icon =
  "data:image/svg+xml;utf8, <svg xmlns='http://www.w3.org/2000/svg' ...></svg>"
  ```

  Set the column's *Data category* to **Image URL** — or use it inside a conditional formatting rule.

- **Apply the theme** — *View → Themes → Browse for themes →* `icon_theme.json`.

- **Pick a color** — open `color_palette.csv`, copy the `Hex` (or `SvgSafe` for embedding in SVG `data:` URIs).
