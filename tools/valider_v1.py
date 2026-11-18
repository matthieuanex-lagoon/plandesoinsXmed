#!/usr/bin/env python3
"""Valide regles/v1/*.json contre regles/schema-v1.json."""
import glob, json, jsonschema
s = json.load(open("regles/schema-v1.json"))
for f in sorted(glob.glob("regles/v1/*.json")):
    jsonschema.validate(json.load(open(f)), s); print("ok", f)
