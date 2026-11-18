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
| `generateur/index.html` | **Générateur de règles** (conditions ET/OU/NON → ordonnances, indicateurs de prévention) |
| `docs/04-generateur.md` | Générateur : mode d'emploi, modèle, questions ouvertes |
| `docs/xmed/` | Captures d'écran XMed de référence (dépôt privé) |
| `tools/build_maquette_data.py` | Valide les règles YAML et régénère les données de la maquette |
| `regles/schema.json` | Format d'une règle (JSON Schema) |
| `regles/schema-v1.json`, `regles/v1/` | Format de règle produit par le générateur + 3 exemples |
| `regles/*.yaml` | Les 4 exemples du document, transcrits tels quels |

## Principe de prudence

Le contenu médical (périodicités, éléments, codes ATC) est **recopié du document source, sans ajout**.
Tout ce qui est interprétation ou point douteux est marqué `A VALIDER` / listé dans les questions ouvertes.
Aucune règle n'est à considérer comme validée cliniquement.
