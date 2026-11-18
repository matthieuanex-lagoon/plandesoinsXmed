# Plan de soins × XMed

Projet de **moteur de plan de soins** pour XMed : à partir de règles (médicament, pathologie, profil patient),
proposer automatiquement les éléments de suivi (biologie en priorité) avec leur périodicité, et pré-remplir la
prescription biologique.

> Statut : **tout début / cadrage**. Rien n'est figé. Source unique à ce stade : le document `Plan de soins`
> (PDF/DOCX) rédigé par le prescripteur-référent.

## Contenu

| Fichier | Rôle |
|---|---|
| `docs/00-comprehension.md` | Ce que dit le document, reformulé, + questions ouvertes |
| `docs/01-specification.md` | Spécification fonctionnelle (v0, à discuter) |
| `docs/02-modele-donnees.md` | Modèle de données et algorithme de fusion des règles |
| `docs/03-maquette.md` | Maquette interactive : mode d'emploi, scénarios, hypothèses |
| `maquette/maquette-autonome.html` | **La maquette** (un seul fichier, ouvrir dans un navigateur) |
| `docs/05-convergence-et-cas.md` | Format unique et moteur SAFE, écart avec les sources officielles, cas sourcés |
| `safe/safe.js` | Le **moteur SAFE** : conditions, phases, fusion, échéances |
| `tests/safe.test.js` | Tests du moteur SAFE (`node tests/safe.test.js`) |
| `generateur/index.html` | **Générateur SAFE** (Si · Alors · Faire · Échéance) : éditeur de règles (conditions ET/OU/NON → ordonnances, indicateurs de prévention) |
| `docs/04-generateur.md` | Générateur : mode d'emploi, modèle, questions ouvertes |
| `demo/`, `tools/build_demo.py` | Démo publiée (accueil avec essai en direct + maquette + éditeur) ; `python3 tools/build_demo.py` après `tools/build.py` |
| `docs/xmed/` | Captures d'écran XMed de référence (dépôt privé) |
| `tools/build.py`, `tools/migrer_v0_v1.py` | Valide les règles, régénère données et fichiers autonomes ; migre les YAML de Fred vers le format v1 |
| `regles/schema.json` | Format d'une règle (JSON Schema) |
| `regles/schema-v1.json`, `regles/v1/` | Format de règle unique ; `document-fred/`, `cas-supplementaires/` (sourcés), `exemples-generateur/` |
| `regles/*.yaml` | Les 4 exemples du document, transcrits tels quels |

## Nom : SAFE

**SAFE** = **S**i · **A**lors · **F**aire · **É**chéance : une condition, une action (ordonnance, alerte), puis la date du prochain suivi. Le nom couvre l'ensemble :
- le **moteur SAFE** (`safe/safe.js`) lit les règles et produit ordonnances, alertes et échéances ;
- le **Générateur SAFE** (`generateur/`) sert à écrire et tester les règles.

## Principe de prudence

Le contenu médical (périodicités, éléments, codes ATC) est **recopié du document source, sans ajout**.
Tout ce qui est interprétation ou point douteux est marqué `A VALIDER` / listé dans les questions ouvertes.
Aucune règle n'est à considérer comme validée cliniquement.
