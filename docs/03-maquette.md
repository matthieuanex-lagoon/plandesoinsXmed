# Maquette fonctionnelle

`maquette/maquette-autonome.html` (un seul fichier, à ouvrir dans un navigateur) ou `maquette/index.html`.
Patient **fictif** reprenant les données visibles sur vos captures (DOE John). Rien n'est branché sur XMed.

Les règles viennent de `regles/v1/` (voir `05-convergence-et-cas.md`) ; la maquette utilise **Protase**, le moteur partagé, `protase/protase.js`. Après modification d'une règle : `python3 tools/build.py`
(valide contre le schéma, régénère les données et les fichiers autonomes).

## Ce que la maquette fait réellement

Un vrai moteur (JS) évalue les règles sur le patient, fusionne les éléments (période la plus courte), lit les
derniers résultats **dans les éléments de suivi**, calcule les échéances. Barre orange « Simulateur » :
date du jour, date de naissance (âge → règle de dépistage), instauration d'un médicament, réglage « périodicité patient ».

| Écran | Fonctionnalité de la spec |
|---|---|
| Dossier patient | Bandeau « n prescriptions bio en attente » (F3) ; ligne de traitement colorée + règle associée (F2) ; éléments non bio dans Prévention |
| Plan de soins | Tableau fusionné : règles à l'origine, périodicité retenue, dernier résultat, échéance, statut ; évaluation détaillée de chaque critère de règle |
| Prescription biologique | Propositions pour l'année à venir, à jour des délais, pré-cochées si en retard ; ajout manuel (F4) |
| Intégration HPRIM | « Prochain » proposé automatiquement, modifiable ; l'écart devient périodicité propre au patient (F1) |
| Règles | Périodicité livrée / corrigée, « Restaurer » = droit au remords (F5) |

## Scénarios à essayer

1. **Instaurer la lamotrigine** → toast d'information, ligne colorée, éléments T0/M6/M12 ajoutés, fusion avec la règle diabète (ex. NFS, EAL).
2. **Mettre une naissance en 1970** → la règle de dépistage se déclenche (critères détaillés dans « Plan de soins »).
3. **Intégration HPRIM** avec HbA1c = 6,8 % → la règle diabète s'éteint (question ouverte n°11).
4. **Règles** : corriger une périodicité (« 6 mois »), voir la case orange dans le plan, puis restaurer.
5. **Avancer la date du jour d'un an** après une instauration → bascule vers les règles « après 1 an ».

## Ce que les captures m'ont appris (à confirmer)

- **Éléments de suivi** : le champ **« Prochain »** (date) existe déjà → c'est là que la périodicité proposée doit s'écrire. Il y a aussi normes basse/haute et cibles.
- **Prévention** : `Répétition` (« tous les 2 ans pendant 10 ans »), `Proposition` (non proposé / proposé / refusé), statut, chronologie. Le plan de soins non biologique doit probablement **alimenter cet écran**, pas en créer un second.
- **HPRIM** : correspondance « Libellé labo » → « Libellé XMed » déjà faite : c'est le bon point d'accroche pour F1.
- « Test au monofilament : prochain saisi dans les éléments de suivi » — un précédent du fonctionnement voulu.

## Hypothèses de la maquette (non vérifiées)

- Correspondance *élément cherché ↔ élément à prescrire* déduite des tableaux du document ; les libellés sont rapprochés par nom (pas de codes).
- Intervalle « 1 à 2 ans » → borne basse. « Créatinine » (IEC/ARA2) et « Créatinine / Clairance » (lamotrigine) restent des lignes distinctes.
- ECG et recherche de sang dans les selles classés « prévention ».
- Les deux médicaments « ATC C09 / C09C » du simulateur sont des exemples génériques de maquette, pas des molécules précises.
- Pas de « changement de posologie » simulé, seulement l'instauration.
