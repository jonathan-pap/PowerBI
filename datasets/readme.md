# Datasets

Sample data for use with the reports.

## `parquet-1m/`

A small star-schema sample (currency exchange, customer, date, orders, orderrows, product, sales, store) saved as Parquet.

### Convert to JSON / CSV

```bash
cd datasets/parquet-1m
python to_json.py            # JSON (one array per file)
python to_json.py --ndjson   # NDJSON (one row per line — streaming friendly)
python to_json.py --csv      # CSV
python to_json.py --out ../json   # write somewhere else
```

Requires `pandas` and `pyarrow`:

```bash
pip install pandas pyarrow
```

## What format works best with Claude?

There isn't a "Claude Design" file format per se — Claude reads several. Picking by use case:

| Use case | Best format | Why |
| --- | --- | --- |
| **Claude (web/desktop) inline analysis** | **CSV** | Most token-efficient for tabular data; Claude parses it natively. |
| **Claude artifacts / web visualizations (D3, Chart.js, React)** | **JSON** (array of objects) | Drops straight into JS as `const data = [...]`. |
| **Large datasets you'll stream / sample** | **NDJSON** | One JSON object per line — easy to slice, no full-file parse needed. |
| **Claude Code reading from disk** | **Parquet, CSV, JSON, NDJSON** all fine | Claude Code can use `pandas`/`pyarrow` directly. |
| **Power BI** | **Parquet** or **CSV** | Power BI reads Parquet natively in Power Query. |

**Rule of thumb:** for sharing a dataset with Claude in a chat or for an artifact, ship **JSON** (or **CSV** if the data is wide and flat). For pipelines and Power BI, keep **Parquet**.
