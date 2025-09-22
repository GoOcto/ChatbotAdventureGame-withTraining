import argparse
import json
import os


def collapse_json_to_jsonl(input_path, output_path):
    with open(input_path, "r", encoding="utf-8") as infile:
        data = json.load(infile)
        if not isinstance(data, list):
            raise ValueError("Input JSON must be a list of objects.")
    out_dir = os.path.dirname(os.path.abspath(output_path))
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir)
    with open(output_path, "w", encoding="utf-8") as outfile:
        for item in data:
            outfile.write(json.dumps(item, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Collapse a JSON list into a JSONL file."
    )
    parser.add_argument(
        "input_path", help="Path to the input JSON file (must be a list)"
    )
    parser.add_argument("output_path", help="Path to the output JSONL file")
    args = parser.parse_args()
    collapse_json_to_jsonl(args.input_path, args.output_path)
