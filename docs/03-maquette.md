# Maquette fonctionnelle (style XMed)

`maquette/maquette-autonome.html` (un seul fichier, à ouvrir dans un navigateur) ou `maquette/index.html`.
Patient **fictif** reprenant les données visibles sur les captures de `docs/xmed/`. Rien n'est branché sur XMed.
La maquette utilise le **moteur SAFE** (`safe/safe.js`) et les règles de `regles/v1/` ; après modification d'une règle : `python3 tools/build.py`.

## Ce qui ressemble à XMed

- **Dossier patient** avec la disposition des cadres des captures (Identité, Antécédents familiaux, Prévention, Épisodes fermés / en cours, Éléments de suivi, Allergies, Facteurs de risque, Traitements, Contacts). Les lignes se sélectionnent, chaque cadre peut être agrandi (⛶).
- **Fenêtres** déplaçables, agrandissables, qui s'empilent : *Nouvelle ordonnance*, *Prescription d'examens biologiques*, *Éléments de suivi*, *Prévention*, *Liste des documents reçus (HPRIM)*, *Règles du plan de soins*. Menus et barre d'outils : « Actions » ouvre chacune d'elles.
- Barre orange **Simulateur** (hors XMed) : date du jour, sexe, naissance, règle de choix de la périodicité, réinitialisation.

## Ce que SAFE ajoute, et où

| Où | Ce qui change |
|---|---|
| Cadre **Prévention** (dossier) | À droite de la chronologie, un bloc « Plan de soins (SAFE) » : alertes, nombre d'examens à prescrire, boutons d'ouverture |
| **Nouvelle ordonnance** | Ajouter un médicament, valider : si une règle existe, un message l'indique et propose d'ouvrir la prescription biologique ; la ligne du traitement est colorée dans le dossier |
| **Prescription d'examens biologiques** | Lignes pré-remplies par le plan (colonne « Plan de soins » : en retard / jamais fait / à venir, règles à l'origine) ; cocher, ajouter un examen libre, supprimer, monter / descendre, lier des épisodes, aperçu, OK |
| **Éléments de suivi** | Le « Prochain » est proposé d'après le plan ; une autre date devient la périodicité propre à ce patient |
| **Prévention** | Vaccins, examens et consultations, chronologie ; « Proposé / Refusé », « Fait » |
| **HPRIM** | Prochain proposé avant incorporation, modifiable |
| **Règles** | Périodicité livrée / corrigée, retour à la règle d'origine, pourquoi une règle est active ou non |

## Scénarios (ancres d'adresse)

`#biologie` (prescription pré-remplie), `#lamotrigine` et `#lithium` (ordonnance prête : modifier la posologie puis OK), `#suivi`, `#prevention`, `#hprim`, `#regles`.

## Hypothèses de la maquette (non vérifiées)

- Correspondance *élément cherché ↔ élément à prescrire* déduite des règles, rapprochée par le nom (pas par des codes).
- Intervalle « 1 à 2 ans » → borne basse. ECG et recherche de sang dans les selles classés « prévention ».
- Seuls quelques médicaments sont proposables (ceux des règles) ; les deux « ATC C09 / C09C » sont des exemples génériques.
- Les écrans sont des approximations des captures : les colonnes ou boutons non utiles à la démonstration sont grisés ou absents.
- Le « changement de posologie » n'est pas simulé.
