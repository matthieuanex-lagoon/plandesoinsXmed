# Générateur SAFE (Si · Alors · Faire · Échéance)

`generateur/index.html` — à ouvrir dans un navigateur, aucune installation. Module **indépendant** de la maquette `maquette/` :
il sert à *écrire* les règles ; le moteur de XMed (ou la maquette, plus tard) les *lit*.

## Ce que fait l'écran

1. **SI** — on construit des conditions, combinables avec **ET / OU / NON** (groupes imbriqués possibles) :
   âge, sexe, pathologie/épisode, médicament (nom et/ou ATC), élément de suivi ou résultat de biologie (existe / absent / valeur > < =, sur les N derniers mois), vaccin fait / non fait.
2. **ALORS** — on choisit ce que la règle produit :
   - une **ordonnance** (biologie, imagerie, vaccin, autre) avec ses éléments et sa fréquence (une fois / tous les x semaines-mois-ans / jalons T0, M6…) ;
   - un **indicateur de prévention** (alerte ou information) avec, au choix, une **ordonnance pré-générée**.
3. **Évaluée quand** — ouverture du dossier, prescription d'un médicament, intégration d'un résultat HPRIM, traitement quotidien.
4. **Activée / désactivée** par règle.
5. **Lecture en français** de la règle, en direct.
6. **Banc d'essai** : un patient fictif modifiable ; chaque règle indique si elle se déclenche (critère par critère, ✔/✘) et ce qu'elle génère, avec les échéances calculées d'après les derniers résultats.
7. **Export / import JSON** ; enregistrement automatique dans le navigateur.

## « Règle, script ou trigger ? »

Ni script ni trigger au sens base de données. Le générateur produit une **règle = une donnée** (un fichier JSON, `regles/schema-v1.json`).
Un moteur unique, **SAFE** (le même pour toutes les règles), la lit à chaque événement coché dans « Évaluée quand » : si les conditions sont vraies, il produit les actions.
Avantage : modifier une règle ne demande aucun développement, et on peut la désactiver, la versionner, la valider.
Le banc d'essai contient une version de SAFE.

## Les 3 exemples fournis (de votre demande, non validés)

| Règle | SI | ALORS |
|---|---|---|
| Vaccin tétanos à 45 ans | âge = 45 ET vaccin Tétanos non fait | alerte « Vaccination tétanos à prévoir » + ordonnance de vaccin pré-générée |
| Diabète — suivi biologique | épisode « Diabète » | HbA1c tous les 3 mois ; NFS, ionogramme, créatinine, protéinurie, créatininurie, HbA1c, EAL tous les ans |
| Zyprexa — numération | traitement « Zyprexa » | numération tous les 2 mois |

Fichiers : `regles/v1/exemples-generateur/*.json`, validés par `python3 tools/build.py`. Le générateur charge toute la bibliothèque `regles/v1/` (règles de Fred, cas sourcés, exemples) ; un fichier autonome est `generateur/generateur-autonome.html`.

## Relation avec les règles du document (`regles/*.yaml`) — **mise à jour : convergence faite**, voir `05-convergence-et-cas.md`

_Texte d'origine :_

Le document décrit des règles « médicament / profil / pathologie » avec phase d'instauration, période la plus courte, périodicité corrigée (droit au remords).
Le générateur est le **même principe en plus général** (conditions combinables, plusieurs types de sortie). Il ne reprend pas encore :
fusion « période la plus courte » entre règles, surcharge utilisateur avec règle d'origine conservée, correspondance élément cherché ↔ prescrit, plan d'instauration lié au « changement de posologie ».
Convergence à décider : migrer les 4 règles YAML vers le format v1 une fois ces points tranchés.

## Questions ouvertes

1. **Âge = 45** ne vaut que pendant la 45ᵉ année ; veut-on plutôt « ≥ 45 ans et vaccin non fait » ?
2. **Vaccin** : « non fait » = absent du module vaccination ? Comment gérer les rappels (date du dernier) ?
3. **« Numération »** : c'est écrit tel quel ; correspond-elle à NFS ? Le référentiel d'examens (codes) reste à définir.
4. **Plusieurs règles → même examen** : appliquer la période la plus courte (cf. document) — à implémenter dans le moteur.
5. **Sortie « autre »** : quels autres types (consultation, courrier, rappel…) et vers quel module de XMed ?
6. **Qui peut écrire / modifier / activer une règle** (utilisateur, cabinet, éditeur) et comment les règles sont versionnées et validées ?
7. **Pathologie** : repère-t-on l'épisode de soin (ouvert ? fermé ?), un code CIM, un libellé ? La maquette fait une recherche de texte.
8. **Fréquence avec durée** (« pendant 10 ans », comme dans Prévention) : à ajouter si utile.
