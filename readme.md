# PowerBI

A collection of Power BI reports, design references, icons, and fun experiments — sharing what's possible with Power BI.

## What's in here

| Folder | Contents |
| --- | --- |
| [icons/](icons) | An icon library (`.pbip` + `.pbix`), an `icon_theme.json`, a color palette (`color_palette.csv`), and notebooks (`colors.ipynb`, `icons.ipynb`) for generating/exploring assets. |
| [docs/](docs) | Design references — cards & KPIs, layout guidelines, page titles, tables & matrices, visual colors, design best practice. |
| [datasets/](datasets) | Sample data (e.g. `parquet-1m`) for use with the reports. |
| [powerbi ppt/](powerbi%20ppt) | Slides and outlines on Power BI + AI workflows. |

## Getting started

1. Install [Power BI Desktop](https://powerbi.microsoft.com/desktop/).
2. Open any `.pbip` file under [icons/](icons).
3. Browse [docs/](docs) for design guidance that informed the reports.

## Conventions

- Reports are stored as `.pbip` (Power BI Project) so the `Report/` and `SemanticModel/` folders are diff-friendly.
- Local-only settings and cache are git-ignored (`.pbi/localSettings.json`, `.pbi/cache.abf`).
- The `examples/`, `training/`, and `.claude/` directories are git-ignored — used locally for drafts, scratch work, and tooling state.
