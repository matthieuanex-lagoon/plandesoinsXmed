# Spécification fonctionnelle — v0 (brouillon)

Périmètre v0 : **biologie uniquement**. Non biologique → plan de prévention.

## 1. Concepts

- **Règle** : un déclencheur + une liste d'items. Types de déclencheur :
  - `medicament` (code ATC, éventuellement avec événement « instauration / changement de posologie ») ;
  - `profil` (requête sur sexe, âge, antécédents, éléments de suivi, CR…) ;
  - `pathologie` (épisode de soin, valeur biologique…).
- **Item de règle** : *élément à chercher* (dans les éléments de suivi), *élément à prescrire*, périodicité.
- **Phase** (règles médicament) : `instauration` (plan de la 1ʳᵉ année, jalons T0/Mx) puis `entretien` (« après 1 an », périodicité fixe).
- **Périodicité livrée** (par la règle) / **corrigée** (par l'utilisateur) : la livrée n'est jamais écrasée (droit au remords).
- **Périodicité patient** : valeur saisie pour un patient donné lors de l'intégration d'un élément de suivi.
- **Table de prescription biologique en attente** : éléments proposés, non encore validés.

## 2. Évaluation (moteur)

Pour un patient :
1. Lancer toutes les règles actives (requêtes profil, ATC des traitements en cours, pathologies).
2. Pour chaque élément à prescrire, collecter les périodicités candidates.
3. Résoudre : **période la plus courte** entre règles, en tenant compte de la périodicité patient (cf. question ouverte n°3).
4. Calculer l'échéance = date du dernier résultat (cherchée dans les éléments de suivi) + périodicité.
5. Éléments échus → table de prescription en attente.

Détail : `docs/02-modele-donnees.md`.

## 3. Fonctionnalités

| ID | Fonctionnalité | Déclencheur |
|---|---|---|
| F1 | Pré-remplir date/périodicité du prochain à l'intégration d'un résultat (modifiable ; mémorise dans la table de périodicité patient) | Intégration HPRIM |
| F2 | Remplir la table de prescription bio selon le plan « instauration » + informer l'utilisateur | Instauration / changement de posologie d'un médicament à règle |
| F3 | Alimenter la table de prescription avec les éléments au délai dépassé + signaler « prescriptions bio en attente » | Traitement informatique périodique |
| F4 | Proposer à l'ouverture de la prescription bio les examens pour l'année à venir, à jour des délais, validables / complétables (manuellement ou depuis l'historique) | Ouverture prescription bio, tout motif |
| F5 | Édition d'une règle par l'utilisateur avec conservation de la règle livrée et possibilité de revenir à l'origine | Écran de gestion des règles |
| F6 | Import des règles livrées (amedulo) | Mise à jour de règles |

## 4. Hors périmètre v0

Vaccination (déjà fait), éléments de suivi non biologiques, interface détaillée de notification, intégration effective dans XMed.

## 5. Prochaines étapes proposées

1. Valider avec le médecin référent les règles et les questions ouvertes (`00-comprehension.md`).
2. Obtenir le schéma XMed (éléments de suivi, prescription bio) pour caler le modèle.
3. Prototype du moteur sur les 4 exemples (entrées : patient fictif ; sortie : liste d'éléments + échéances) avec tests.
