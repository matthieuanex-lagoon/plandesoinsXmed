#!/usr/bin/env python3
"""Migre les règles transcrites du document (regles/*.yaml, format v0) vers le format du générateur
(regles/v1/document-fred/*.json). Les conditions des règles « profil » et « pathologie » sont écrites ici
à la main (leur texte libre n'est pas interprétable automatiquement) ; tout le reste est converti mécaniquement."""
import glob, json, os, yaml, jsonschema

U = {"an": ("ans", 1), "mois": ("mois", 1), "semaine": ("semaines", 1)}
CONDITIONS = {
    "depistage-colorectal": {"op": "ET", "conditions": [
        {"type": "age", "op": "entre", "valeur": 50, "valeur2": 75},
        {"op": "ET", "non": True, "conditions": [{"op": "OU", "conditions": [
            {"type": "pathologie", "libelle": "polype du côlon"}, {"type": "pathologie", "libelle": "cancer du côlon"},
            {"type": "pathologie", "libelle": "cancer du sigmoïde"}, {"type": "pathologie", "libelle": "cancer du rectum"}]}]},
        {"op": "ET", "non": True, "conditions": [{"op": "OU", "conditions": [
            {"type": "antecedent_familial", "libelle": "polype", "premier_degre": True},
            {"type": "antecedent_familial", "libelle": "cancer", "premier_degre": True}]}]},
        {"type": "compte_rendu", "libelle": "Coloscopie", "depuis_mois": 60, "non": True},
        {"type": "element_suivi", "libelle": "Coloscopie", "op": "existe", "depuis_mois": 60, "non": True}]},
    "diabete-hba1c-sup-7": {"op": "ET", "conditions": [
        {"type": "element_suivi", "libelle": "HbA1c", "op": ">", "valeur": 7}]},
}

def freq_from(p):
    unite, _ = U[p["unite"]]
    f = {"mode": "tous_les", "valeur": p["min"], "unite": unite}
    if "max" in p: f["max"] = p["max"]
    return f

def migrate(r):
    t = r["declencheur"]; actions = []; a_valider = []
    if t["type"] == "medicament":
        quand = {"op": "ET", "conditions": [{"type": "medicament", "atc": t["atc"]}]}
        evaluer = ["nouvelle_prescription", "quotidien"]
    else:
        quand = CONDITIONS[r["id"]]; evaluer = ["ouverture_dossier", "integration_resultat", "quotidien"]
    # instauration : on regroupe les éléments ayant les mêmes jalons
    groups = {}
    for it in r.get("instauration", []):
        groups.setdefault(tuple(it["jalons"]), []).append(it["prescrire"])
    for jal, ex in groups.items():
        actions.append({"action": "ordonnance", "phase": "instauration", "categorie": "biologie", "examens": ex,
                        "frequence": {"mode": "jalons", "jalons": list(jal)}})
    # suivi / entretien : on regroupe par (canal, périodicité)
    groups = {}
    for it in r.get("entretien", []):
        if not it.get("prescrire"):
            a_valider.append(f"Ligne « {it.get('chercher')} » : élément à prescrire non renseigné dans le document source.")
            continue
        key = (it.get("canal", "biologie"), json.dumps(it["periodicite"], sort_keys=True))
        groups.setdefault(key, []).append(it)
    for (canal, per), items in groups.items():
        a = {"action": "ordonnance", "categorie": "biologie" if canal == "biologie" else "autre",
             "examens": [i["prescrire"] for i in items], "frequence": freq_from(json.loads(per))}
        if t["type"] == "medicament": a["phase"] = "entretien"
        ch = {i["prescrire"]: i["chercher"] for i in items if i.get("chercher")}
        if ch: a["cherche"] = ch
        actions.append(a)
    out = {"id": r["id"], "libelle": r["libelle"], "actif": True, "statut_validation": r["statut_validation"],
           "origine": "Document « Plan de soins » (Fred), transcrit dans regles/" + r["id"] + ".yaml",
           "evaluer_quand": evaluer, "quand": quand, "alors": actions}
    a_valider += r.get("points_a_valider", [])
    if a_valider: out["points_a_valider"] = a_valider
    if r.get("references"): out["references"] = r["references"]
    return out

if __name__ == "__main__":
    schema = json.load(open("regles/schema-v1.json"))
    for f in sorted(glob.glob("regles/*.yaml")):
        o = migrate(yaml.safe_load(open(f))); jsonschema.validate(o, schema)
        json.dump(o, open(f"regles/v1/document-fred/{o['id']}.json", "w"), ensure_ascii=False, indent=2)
        open(f"regles/v1/document-fred/{o['id']}.json", "a").write("\n"); print("->", o["id"])
