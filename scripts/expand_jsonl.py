import argparse
import json
import os


def uncombine_jsonl(input_path, output_path):
    items = []
    line_count = 0
    valid_count = 0
    with open(input_path, "r", encoding="utf-8") as infile:
        for line in infile:
            line_count += 1
            line = line.strip()
            if line:
                try:
                    items.append(json.loads(line))
                    valid_count += 1
                except Exception as e:
                    print(f"[DEBUG] Skipped line {line_count}: {e}")
        out_dir = os.path.dirname(os.path.abspath(output_path))
        if out_dir and not os.path.exists(out_dir):
            os.makedirs(out_dir)
            print(f"[DEBUG] Created output directory: {out_dir}")
    with open(output_path, "w", encoding="utf-8") as outfile:
        json.dump(items, outfile, indent=2, ensure_ascii=False)
        print(
            f"[DEBUG] Wrote {valid_count} objects to {output_path} (from {line_count} lines)"
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convert JSONL to a single JSON array file."
    )
    parser.add_argument("input_path", help="Path to the input JSONL file")
    parser.add_argument("output_path", help="Path to the output JSON file")
    args = parser.parse_args()
    uncombine_jsonl(args.input_path, args.output_path)
