#!/usr/bin/env python3
"""Valide regles/*.yaml contre regles/schema.json puis génère maquette/regles-data.js."""
import glob, json, sys
import yaml, jsonschema
schema = json.load(open("regles/schema.json"))
rules = []
for f in sorted(glob.glob("regles/*.yaml")):
    r = yaml.safe_load(open(f))
    jsonschema.validate(r, schema)
    rules.append(r)
open("maquette/regles-data.js", "w").write(
    "// GENERE par tools/build_maquette_data.py — ne pas éditer\nwindow.REGLES = "
    + json.dumps(rules, ensure_ascii=False, indent=1) + ";\n")
print(f"{len(rules)} règles -> maquette/regles-data.js")

# Version autonome (un seul fichier, ouvrable partout) : inline regles-data.js dans index.html
html = open("maquette/index.html").read()
data = open("maquette/regles-data.js").read()
open("maquette/maquette-autonome.html", "w").write(
    html.replace('<script src="regles-data.js"></script>', "<script>\n" + data + "</script>"))
print("-> maquette/maquette-autonome.html")
