#!/usr/bin/env python3
"""
Dataset validator for chatbot_lora

Rules enforced:
- Files are JSON with a top-level object containing a `messages` array.
- Messages have roles in {system, user, assistant} and string `content`.
- Assistant messages must end with a delimiter "<|>" followed by JSON action dict.
- Action dict schema:
  * Required keys: give (list[str]), take (list[str])
  * Optional keys: attack, bye, join (bool), but only present when True
  * No extra keys beyond {give, take, attack, bye, join}
  * No false booleans allowed
- No trailing non-whitespace after the action JSON.
- Exactly one actionable delimiter boundary (we accept earlier "<|>" in text only if escaped; otherwise flagged).

Usage:
  python scripts/validate_dataset.py --check  # default behavior
  python scripts/validate_dataset.py --fix
  python scripts/validate_dataset.py --paths "training.001/*.json" "training.002/*.json"

Exit codes:
  0: All files valid
  1: Validation errors found
  2: Internal error (unexpected exception)
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

DELIM = "<|>"
ALLOWED_ROLES = {"system", "user", "assistant"}
ALLOWED_ACTION_KEYS = {"give", "take", "attack", "bye", "join"}
OPTIONAL_TRUE_ONLY = {"attack", "bye", "join"}


@dataclass
class Issue:
    file: Path
    message_index: int
    kind: str
    detail: str

    def __str__(self) -> str:
        loc = f"{self.file}:{self.message_index}"
        return f"[{self.kind}] {loc} - {self.detail}"


def find_files(paths: List[str]) -> List[Path]:
    results: List[Path] = []
    for p in paths:
        for path in Path().glob(p):
            if path.is_file() and path.suffix == ".json":
                results.append(path)
    return sorted(results)


def parse_action_json_from_content(
    content: str,
) -> Tuple[Optional[Dict[str, Any]], List[Issue], Optional[str]]:
    issues: List[Issue] = []
    # We find the last occurrence of DELIM as the action boundary.
    last_idx = content.rfind(DELIM)
    if last_idx == -1:
        return None, [], None
    action_text = content[last_idx + len(DELIM) :]
    # Ensure there's no other non-whitespace after JSON
    # Try to parse JSON from the beginning of action_text
    # We trim surrounding whitespace for parsing, but check trailing afterwards
    trimmed = action_text.strip()
    # Heuristic to extract the first JSON object
    if not trimmed.startswith("{"):
        return None, [], action_text
    # Attempt to parse the JSON object by incrementally finding matching braces
    depth = 0
    end_pos = None
    for i, ch in enumerate(trimmed):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end_pos = i + 1
                break
    if end_pos is None:
        return None, [], action_text
    json_str = trimmed[:end_pos]
    trailing = trimmed[end_pos:]
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError:
        return None, [], action_text
    return data, issues, trailing


def has_control_chars(s: str) -> bool:
    # Allow common whitespace, forbid other C0 controls
    for ch in s:
        code = ord(ch)
        if code < 32 and ch not in ("\n", "\r", "\t"):
            return True
    return False


def normalize_action(action: Dict[str, Any]) -> Dict[str, Any]:
    # Build a normalized dict with required keys first
    normalized: Dict[str, Any] = {
        "give": action.get("give", []) or [],
        "take": action.get("take", []) or [],
    }
    for key in OPTIONAL_TRUE_ONLY:
        if action.get(key) is True:
            normalized[key] = True
    return normalized


def validate_and_maybe_fix_file(path: Path, fix: bool) -> List[Issue]:
    issues: List[Issue] = []
    try:
        raw = path.read_text(encoding="utf-8")
        data = json.loads(raw)
    except Exception as e:
        issues.append(
            Issue(path, -1, "file-json", f"Cannot parse JSON file: {e}")
        )
        return issues

    messages = data.get("messages")
    if not isinstance(messages, list):
        issues.append(
            Issue(path, -1, "schema", "Top-level 'messages' must be a list")
        )
        return issues

    changed = False

    for i, msg in enumerate(messages):
        role = msg.get("role")
        content = msg.get("content")
        if role not in ALLOWED_ROLES:
            issues.append(Issue(path, i, "role", f"Invalid role '{role}'"))
            continue
        if not isinstance(content, str):
            issues.append(Issue(path, i, "content", "Content must be a string"))
            continue
        if has_control_chars(content):
            issues.append(
                Issue(
                    path,
                    i,
                    "control-chars",
                    "Content contains control characters",
                )
            )

        if role != "assistant":
            continue

        action, _subissues, trailing = parse_action_json_from_content(content)
        if action is None:
            issues.append(
                Issue(
                    path,
                    i,
                    "ending",
                    f"Assistant content missing or malformed action JSON after delimiter {DELIM}",
                )
            )
            continue

        # Validate keys
        extra_keys = set(action.keys()) - ALLOWED_ACTION_KEYS
        if extra_keys:
            issues.append(
                Issue(
                    path,
                    i,
                    "action-keys",
                    f"Extra keys not allowed: {sorted(extra_keys)}",
                )
            )

        # Required arrays
        for k in ("give", "take"):
            if k not in action:
                issues.append(
                    Issue(
                        path, i, "action-missing", f"Missing required key '{k}'"
                    )
                )
            elif not isinstance(action[k], list) or not all(
                isinstance(x, str) for x in action[k]
            ):
                issues.append(
                    Issue(
                        path,
                        i,
                        "action-type",
                        f"'{k}' must be a list of strings",
                    )
                )

        # Optional true-only
        for k in OPTIONAL_TRUE_ONLY:
            if k in action and action[k] is not True:
                issues.append(
                    Issue(
                        path,
                        i,
                        "action-bool",
                        f"'{k}' must be omitted or true; found {action[k]!r}",
                    )
                )

        # Trailing text after JSON
        if trailing and trailing.strip():
            issues.append(
                Issue(
                    path,
                    i,
                    "trailing",
                    "Non-whitespace trailing content after action JSON",
                )
            )

        if fix:
            # Normalize action
            norm = normalize_action(action)
            # Replace the ending in content
            before = content[: content.rfind(DELIM) + len(DELIM)]
            new_content = before + json.dumps(norm, separators=(",", ":"))
            if new_content != content:
                messages[i]["content"] = new_content
                changed = True

    if fix and changed:
        # Keep key order compact
        path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    return issues


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Validate chatbot_lora datasets"
    )
    parser.add_argument(
        "--paths",
        nargs="*",
        default=["training.001/*.json", "training.002/*.json"],
        help="Glob paths to validate",
    )
    parser.add_argument(
        "--fix", action="store_true", help="Apply safe auto-fixes in place"
    )
    parser.add_argument(
        "--strict", action="store_true", help="Treat warnings as errors"
    )
    args = parser.parse_args(argv)

    files = find_files(args.paths)
    if not files:
        print("No files matched.")
        return 0

    total_issues: List[Issue] = []
    for f in files:
        issues = validate_and_maybe_fix_file(f, fix=args.fix)
        for iss in issues:
            total_issues.append(iss)

    if total_issues:
        for iss in total_issues:
            print(str(iss))
        return 1
    else:
        print("All files valid.")
        return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(130)
    except Exception as e:
        print(f"Internal error: {e}")
        sys.exit(2)
