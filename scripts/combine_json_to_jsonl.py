import glob
import json
import os
import sys

# Use this file to combine multiple JSON files into a single JSONL file.
# Example usage: to feed a batch into Gemini or ChatGPT for analysis.


# Change this pattern to match your files
def main(args):
    # input_files = glob.glob("training_data/canon/old_reliable.*.json")
    # output_file = "old_reliable.jsonl"
    # input_files = glob.glob(args[1])
    # output_file = args[2]

    # --- Argument Handling ---
    if len(sys.argv) != 3:
        print("Incorrect number of arguments.")
        print(
            "Usage: python combine_json.py <input_glob_pattern> <output_file.jsonl>"
        )
        print(
            'Example: python combine_json.py "training_data/canon/anya*.json" out.jsonl'
        )
        # Note: Use quotes around the glob pattern if it contains wildcards (*)
        sys.exit(1)  # Exit with an error code

    input_pattern = sys.argv[1]
    output_file = sys.argv[2]

    # --- File Processing ---
    # Use the glob pattern to find all matching input files
    input_files = glob.glob(input_pattern)

    if not input_files:
        print(f"No files found matching pattern: {input_pattern}")
        sys.exit(0)  # Exit gracefully if no files are found

    # If output_file exists, append; otherwise, create new
    mode = "a" if os.path.exists(output_file) else "w"
    needs_newline = False
    if mode == "a":
        with open(output_file, "rb") as out_check:
            out_check.seek(0, 2)
            if out_check.tell() > 0:
                out_check.seek(-1, 2)
                last_byte = out_check.read(1)
                if last_byte != b"\n":
                    needs_newline = True
    with open(output_file, mode, encoding="utf-8") as out:
        if needs_newline:
            out.write("\n")
        for fname in input_files:
            with open(fname, "r", encoding="utf-8") as f:
                obj = json.load(f)
                out.write(json.dumps(obj, separators=(",", ":")) + "\n")

    print(f"Combined {len(input_files)} files into {output_file}")


if __name__ == "__main__":
    main(sys.argv)
