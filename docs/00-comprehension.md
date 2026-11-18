# Compréhension du document « Plan de soins »

## Objectif (tel que je le comprends)

Identifier des **profils patients** et des **règles** pour :
1. éviter à l'utilisateur de saisir la périodicité des éléments de suivi à prescrire ;
2. permettre à XMed de **pré-prescrire** chaque fois que c'est possible, notamment la biologie.

Premier périmètre volontairement simple : **la biologie**. Les éléments non biologiques (consultation, radio…)
relèvent du **plan de prévention**, pas de ce module.

## Les 3 sources qui alimentent le plan de soins

| # | Source | État annoncé dans le document |
|---|---|---|
| 1 | Données du patient enregistrées dans les **éléments de suivi** (saisie dans le dossier, ou intégration de documents / résultats de bio) | « quasiment fait » |
| 2 | **Module vaccination** | « quasiment fait » |
| 3 | **Requêtes** de type ROSP, selon sexe/âge, médicaments (classe ATC), pathologies | **à construire** → objet de ce projet |

Choix d'architecture exprimé : le module **travaille à partir des éléments de suivi** pour garantir une cohérence
totale entre « éléments de suivi » et « prévention ». Pas de source de données parallèle.

## Les 4 exemples (point 3)

- **a) IEC / ARA2** (ATC C09, C09C) : plan à l'instauration/changement de posologie, puis suivi après 1 an.
- **b) Lamotrigine** (ATC N03AX09) : plan à l'instauration (T0, M6, M12), puis annuel.
- **c) Requête de dépistage** (50–75 ans, sans ATCD/CR/suivi de coloscopie récent…) → recherche de sang dans les selles tous les 2 ans.
- **d) Règles par pathologie**, même principe : exemple « diabète HbA1c > 7 % » (tableau avec périodicité livrée / corrigée).

## Mécanique décrite

1. Chaque règle déclenchée retourne des éléments de suivi avec une périodicité.
2. Quand **toutes les requêtes ont abouti**, on garde pour chaque élément **la période la plus courte**,
   en tenant compte de la **périodicité saisie par l'utilisateur** pour ce patient (table de périodicité par patient).
3. Une règle **livrée par amedulo** est modifiable par l'utilisateur **sans perdre la règle d'origine** (« droit au remords »).

## Fonctionnalités qui en découlent (reprises du document)

- À l'intégration HPRIM d'un résultat : date/périodicité du prochain **proposée automatiquement**, modifiable.
- À l'instauration d'un médicament (ou changement de posologie) ayant une règle : la **table de prescription biologique**
  est remplie (périodicité sur toute l'année) et l'utilisateur est **informé** (ex. coloration de la ligne, moyen à discuter).
- **Traitement informatique** périodique : tous les éléments dont le **délai est dépassé** vont dans la table de prescription ;
  l'utilisateur est informé qu'il y a des prescriptions bio en attente ; proposées à l'ouverture du module de prescription bio,
  validées ou non, complétées à la main ou depuis l'historique.
- Une règle est **éditable** par l'utilisateur.
- À tout moment, à l'ouverture de la prescription biologique (quel que soit le motif) : proposition des prescriptions
  bio **pour l'année à venir, à jour des délais**.

## Questions ouvertes

### Produit / périmètre
1. **Qui fournit et valide les règles** ? « amedulo » les livre : sous quel format, quelle fréquence de mise à jour, quelle responsabilité ?
2. **Granularité du droit au remords** : surcharge par utilisateur, par cabinet, ou par patient ? (le document parle des trois : règle éditable, périodicité corrigée, table par patient).
3. « Périodicité saisie par l'utilisateur » prime-t-elle sur la règle même quand elle est **plus longue** ? (le document dit « période la plus courte … en prenant en compte la périodicité saisie » — ambigu.)
4. Quelle **notification** à l'instauration (coloration de ligne… « à discuter ») et pour les prescriptions en attente ?
5. Le « traitement informatique » : batch nocturne, à l'ouverture du dossier, à l'ouverture de la prescription ?

### Règles (contenu à faire valider par le médecin référent)
6. **IEC/ARA2** : C09 inclut déjà C09C (hiérarchie ATC) ; le document cite les deux. Veut-on aussi les associations (C09B, C09D…) ? 
7. **IEC/ARA2, après 1 an** : la ligne « Microalbuminurie → Eléments à prescrire » est un **gabarit non rempli** — quel examen exactement (microalbuminurie, RAC) ?
8. **IEC/ARA2, après 1 an** : « Créatinine → Clairance de la créatinine » : la clairance est calculée, que prescrit-on (créatininémie) ?
9. **Lamotrigine** : « Créatinine / Clairance de la créatinine » en une seule ligne ; « Chol LDL → EAL », « SGOT → Bilan hépatique » : le mapping *élément cherché → élément prescrit* est à confirmer.
10. **Périodicité « 1 à 2 ans »** (IEC/ARA2) : un intervalle, pas une valeur. Quelle valeur appliquer par défaut (borne basse = règle de la période la plus courte) ?
11. **Diabète** : condition « HbA1c > 7 % » = dernière valeur ? Que se passe-t-il si HbA1c ≤ 7 % (autre règle) ?
12. **Diabète** : « ECG dans ES et doc » : ECG est non biologique — relève-t-il du plan de prévention ou de cette règle ?
13. **Dépistage colorectal** : ce sont les critères *du document*, non vérifiés ici. Les « épisodes de soin », ATCD familiaux, CR de coloscopie existent-ils sous forme structurée dans XMed ?
14. Comment détecter un **« changement de posologie »** (comparaison de deux prescriptions successives ?) et « l'instauration » (première prescription de la classe/DCI ?).

### Technique
15. Stack et schéma de base XMed (tables éléments de suivi, prescription bio, HPRIM) : à fournir pour caler le modèle.
16. Référentiel d'**éléments de suivi** : codes (LOINC ? codes internes XMed ?) pour faire le lien « élément cherché » ↔ « élément prescrit ».
