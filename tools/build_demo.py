#!/usr/bin/env python3
"""Génère demo/artifact/ : 3 pages pour la démo publiée (index, maquette, générateur).
Prérequis : python3 tools/build.py (données + versions autonomes à jour)."""
import json, os
os.makedirs("demo/artifact", exist_ok=True)
safe = open("safe/safe.js").read()
biblio = open("generateur/bibliotheque-data.js").read().split("window.BIBLIOTHEQUE = ", 1)[1].rstrip().rstrip(";")
tpl = open("demo/index.tpl.html").read()
assert "/*SAFE*/" in tpl and "/*BIBLIO*/" in tpl
open("demo/artifact/index.html", "w").write(tpl.replace("/*SAFE*/", safe).replace("/*BIBLIO*/", biblio))

def patch(h, pairs):
    for a, b in pairs:
        assert h.count(a) == 1, (h.count(a), a[:70]); h = h.replace(a, b)
    return h
back = '<a href="index.html" style="color:var(--blu);text-decoration:none;font-weight:600">← Démo SAFE</a> '
# Maquette : lien retour + scénarios par ancre (#plan, #lamotrigine, #lithium, #hprim, #regles)
m = open("maquette/maquette-autonome.html").read()
m = patch(m, [('<div class="top"><b>XMed — Plan de soins</b>', '<div class="top">' + back + '<b>XMed — Plan de soins</b>'),
 ("render();\n</script>", """(function(){const h=(location.hash||'').slice(1);
 if(h==='lamotrigine'||h==='lithium'){if(h==='lithium'){S.sexe='F';S.naissance='1974-06-01'}instaurer(h==='lithium'?3:0);S.tab='plan'}
 else if(['plan','presc','hprim','regles'].includes(h))S.tab=h})();
render();
</script>""")])
open("demo/artifact/maquette.html", "w").write(m)
# Générateur : lien retour, ancres (#lithium, #diabete, #tetanos, #sein), export = copie dans le presse-papiers (les téléchargements sont bloqués dans l'artefact)
g = open("generateur/generateur-autonome.html").read()
g = patch(g, [('<div class="top"><b>Générateur SAFE</b>', '<div class="top">' + back + '<b>Générateur SAFE</b>'),
 ("const exportOne=()=>dl(R().id+'.json',R());", "const copyText=t=>{try{navigator.clipboard.writeText(t)}catch(e){}};\nconst exportOne=()=>copyText(JSON.stringify(R(),null,2));"),
 ("const exportAll=()=>dl('regles-plan-de-soins.json',{version:1,regles:RULES});", "const exportAll=()=>copyText(JSON.stringify({version:1,regles:RULES},null,2));"),
 ("Exporter (JSON)", "Copier tout (JSON)"), ("Télécharger cette règle", "Copier la règle"),
 ("document.getElementById('work').innerHTML='<div id=\"ed\"></div>';render();", """document.getElementById('work').innerHTML='<div id="ed"></div>';
(function(){const k={lithium:'lithium-surveillance',diabete:'diabete-suivi',tetanos:'vaccin-tetanos-45-ans',sein:'depistage-sein-organise'}[(location.hash||'').slice(1)];
 const i=k?RULES.findIndex(r=>r.id===k):-1;if(i>=0)CUR=i})();
render();""")])
open("demo/artifact/generateur.html", "w").write(g)
print({f: os.path.getsize("demo/artifact/" + f) // 1024 for f in os.listdir("demo/artifact")}, "Ko")
