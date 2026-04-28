# PowerBI

A collection of Power BI reports, icons, and fun experiments — sharing what's possible with Power BI.

## What's in here

| Folder | Contents |
| --- | --- |
| [icons/](icons) | An icon library (`.pbip` + `.pbix`), an `icon_theme.json`, a color palette (`color_palette.csv`), and notebooks (`colors.ipynb`, `icons.ipynb`) for generating/exploring assets. |
| [datasets/](datasets) | Sample data (e.g. `parquet-1m`) for use with the reports. |

## Getting started

1. Install [Power BI Desktop](https://powerbi.microsoft.com/desktop/).
2. Open any `.pbip` file under [icons/](icons).

## Conventions

- Reports are stored as `.pbip` (Power BI Project) so the `Report/` and `SemanticModel/` folders are diff-friendly.
- Local-only settings and cache are git-ignored (`.pbi/localSettings.json`, `.pbi/cache.abf`).
- The `examples/`, `training/`, `docs/`, `datasets/ccusage/`, and `.claude/` directories are git-ignored — used locally for drafts, scratch work, and tooling state.
