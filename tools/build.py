#!/usr/bin/env python3
"""Valide toutes les règles v1 (regles/v1/**/*.json) puis génère :
 - maquette/regles-data.js            (règles de Fred + cas supplémentaires)
 - generateur/bibliotheque-data.js    (toutes les règles, par groupe)
 - maquette/maquette-autonome.html, generateur/generateur-autonome.html  (un seul fichier chacun)"""
import glob, json, os, jsonschema
schema = json.load(open("regles/schema-v1.json"))
GROUPES = [("document-fred", "Règles du document de Fred"), ("cas-supplementaires", "Cas supplémentaires (sources citées)"),
           ("exemples-generateur", "Exemples de la demande initiale")]
data = {}
for d, nom in GROUPES:
    rs = []
    for f in sorted(glob.glob(f"regles/v1/{d}/*.json")):
        r = json.load(open(f)); jsonschema.validate(r, schema); rs.append(r)
    data[d] = rs
js = lambda o: json.dumps(o, ensure_ascii=False, indent=1)
open("maquette/regles-data.js", "w").write("// GENERE par tools/build.py — ne pas éditer\nwindow.REGLES = " + js(data["document-fred"] + data["cas-supplementaires"]) + ";\n")
open("generateur/bibliotheque-data.js", "w").write("// GENERE par tools/build.py — ne pas éditer\nwindow.BIBLIOTHEQUE = " + js([{"nom": n, "regles": data[d]} for d, n in GROUPES]) + ";\n")
safe = open("safe/safe.js").read()
def autonome(src, out, extra):
    h = open(src).read()
    h = h.replace('<script src="../safe/safe.js"></script>', "<script>\n" + safe + "</script>")
    h = h.replace(f'<script src="{extra}"></script>', "<script>\n" + open(os.path.join(os.path.dirname(src), extra)).read() + "</script>")
    open(out, "w").write(h)
autonome("maquette/index.html", "maquette/maquette-autonome.html", "regles-data.js")
autonome("generateur/index.html", "generateur/generateur-autonome.html", "bibliotheque-data.js")
print({d: len(r) for d, r in data.items()}, "-> données + 2 fichiers autonomes")
