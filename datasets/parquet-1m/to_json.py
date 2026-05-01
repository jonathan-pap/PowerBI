"""
Convert every .parquet in this folder to JSON.

Usage:
    python to_json.py                 # one JSON array per file (pretty)
    python to_json.py --ndjson        # newline-delimited JSON (streaming-friendly)
    python to_json.py --csv           # CSV instead of JSON
    python to_json.py --out ../json   # write to a sibling folder

Requires: pandas, pyarrow  →  pip install pandas pyarrow
"""

from __future__ import annotations
import argparse
import sys
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    sys.exit("pandas not installed — run: pip install pandas pyarrow")


def convert(src: Path, out_dir: Path, fmt: str) -> None:
    df = pd.read_parquet(src)
    out_dir.mkdir(parents=True, exist_ok=True)

    if fmt == "ndjson":
        dst = out_dir / (src.stem + ".ndjson")
        df.to_json(dst, orient="records", lines=True, date_format="iso")
    elif fmt == "csv":
        dst = out_dir / (src.stem + ".csv")
        df.to_csv(dst, index=False)
    else:  # json (array, pretty)
        dst = out_dir / (src.stem + ".json")
        df.to_json(dst, orient="records", date_format="iso", indent=2)

    size_kb = dst.stat().st_size / 1024
    print(f"  {src.name:<32} → {dst.name:<32} {len(df):>8,} rows  {size_kb:>10,.1f} KB")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--ndjson", action="store_true", help="newline-delimited JSON")
    parser.add_argument("--csv", action="store_true", help="CSV instead of JSON")
    parser.add_argument("--out", type=Path, default=None, help="output directory (default: alongside source)")
    args = parser.parse_args()

    fmt = "csv" if args.csv else "ndjson" if args.ndjson else "json"
    src_dir = Path(__file__).resolve().parent
    out_dir = args.out.resolve() if args.out else src_dir
    files = sorted(src_dir.glob("*.parquet"))

    if not files:
        print(f"No .parquet files in {src_dir}")
        return 1

    print(f"Converting {len(files)} parquet files → {fmt.upper()}  (out: {out_dir})\n")
    for p in files:
        convert(p, out_dir, fmt)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
