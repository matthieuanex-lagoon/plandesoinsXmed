# Convergence avec le document de Fred + cas supplémentaires

## 1. Convergence : un seul format de règle, un seul moteur (**SAFE**)

Avant : la maquette lisait les règles « de Fred » (YAML) avec son propre moteur ; le générateur écrivait un autre format avec un autre évaluateur.
Maintenant :

| Élément | Rôle |
|---|---|
| `regles/schema-v1.json` | **Format unique** de règle (conditions ET/OU/NON → ordonnances / indicateurs) |
| `safe/safe.js` | Le moteur **SAFE**, utilisé par le générateur, la maquette et les tests |
| `regles/v1/document-fred/` | Les 4 règles du document, **migrées** depuis `regles/*.yaml` (`python3 tools/migrer_v0_v1.py`) |
| `regles/v1/cas-supplementaires/` | Nouveaux cas, **avec sources citées** (section 3) |
| `regles/v1/exemples-generateur/` | Les 3 exemples de la demande initiale (tétanos 45 ans, diabète, Zyprexa) |
| `tools/build.py` | Valide tout, régénère les données et les deux fichiers « autonomes » |
| `tests/safe.test.js` | 14 tests (`node tests/safe.test.js`) ; les 9 premiers reproduisent les résultats de l'ancien moteur de la maquette |

### Ce que le format v1 couvre maintenant du document de Fred

| Besoin du document | Comment c'est représenté |
|---|---|
| Règle par médicament (ATC), préfixe de classe | condition `medicament` avec `atc` (liste ou texte) |
| « À l'instauration » / « après 1 an » | `phase: instauration \| entretien` sur l'ordonnance ; le moteur compare à la date de début du traitement déclencheur |
| Jalons T0, M6, M12, « 2 à 4 semaines » | fréquence `jalons` (`T0`, `M6`, `S2-4` = semaines, borne basse) |
| « Élément à chercher » ≠ « élément à prescrire » | `cherche: {"NFS": "Hémoglobine"}` ; le dernier résultat est lu dans les éléments de suivi |
| Périodicité en intervalle (« 1 à 2 ans ») | fréquence `tous_les` avec `max` (le moteur retient `valeur`) |
| Requête profil (âge, ATCD familiaux, CR, élément de suivi récent) | conditions `age`, `antecedent_familial`, `compte_rendu`, `element_suivi` + NON |
| Règle par pathologie / valeur (HbA1c > 7 %) | condition `element_suivi` avec comparaison |
| Éléments non biologiques → plan de prévention | `categorie` ≠ `biologie` |
| Plusieurs règles → période la plus courte | moteur SAFE (`planifier`) |
| Périodicité corrigée par l'utilisateur, règle livrée conservée (droit au remords) | couche `overrides` à part ; la règle n'est jamais modifiée |
| Périodicité propre à un patient | `patientPer` ; politique « la plus courte » ou « le patient prime » |

### Ce qui reste à décider (ou qu'on a trouvé en route)

1. **Phases limitées à la 1ʳᵉ année** : « instauration » = 12 mois après le début du traitement. Le RCP du lithium, par exemple, change de rythme après quelques mois (voir cas) : il faudrait une durée de phase paramétrable.
2. **Point de départ variable** : certains rythmes partent d'un événement (« lithiémie efficace atteinte »), pas du début du traitement : non représentable aujourd'hui.
3. **« Les deux premiers tests à 1 an d'intervalle »** (col de l'utérus) : règles à historique, non représentées.
4. **Règles qui regardent le résultat** (« si le test est négatif ») : non représentées.
5. **Années en jours** : « 2 ans » = 731 jours, « 3 ans » = 1096 : à remplacer par une vraie arithmétique de calendrier si la précision au jour compte.
6. **Degré de parenté** : le champ « Lien » des antécédents familiaux est du texte libre ; la maquette devine le 1ᵉʳ degré par mots (père, mère, frère, sœur, enfant…). Un champ structuré serait préférable.
7. Les questions de `00-comprehension.md` restent ouvertes (« Microalbuminurie » vide, C09/C09C, ECG, 1 à 2 ans…).

## 2. Écart trouvé entre le document de Fred et les sources officielles

La règle de dépistage colorectal du document dit **50 à 75 ans**. La page officielle lue (sante.fr, « Cancer colorectal : pourquoi se faire dépister ? », 18/03/2026) dit **50 à 74 ans**, un test immunologique à domicile **tous les 2 ans**, et exclut « antécédents personnels ou familiaux de polype, de cancer ou de maladie touchant le côlon ou le rectum » (sans limiter au 1ᵉʳ degré). Je n'ai **pas modifié** la règle : l'écart est noté dans ses `points_a_valider`. À trancher avec Fred.

## 3. Cas supplémentaires — comment ils ont été construits

Rien n'a été écrit de mémoire. Pour chaque cas, j'ai lu la **page officielle** et je n'ai transcrit que ce qu'elle dit ; l'extrait et le lien sont dans le champ `references` de la règle. Ce que la source ne dit pas (fréquences « régulières » sans chiffre, conditions de risque, etc.) est listé dans `points_a_valider`, **pas comblé**. Toutes les règles restent `a_valider`.

| Règle | Source lue | Ce qui est encodé | Ce qui n'est pas encodé (voir la règle) |
|---|---|---|---|
| Dépistage du sein | Service-Public (01/10/2024) | Femme 50–74 ans : mammographie tous les 2 ans | exclusions « risque élevé », examen clinique ; la page se dit ancienne |
| Col de l'utérus 25–29 | HAS (06/07/2020) | Examen cytologique tous les 3 ans | les 2 premiers tests à 1 an d'intervalle |
| Col de l'utérus 30–65 | HAS (06/07/2020) | Test HPV-HR tous les 5 ans | 1ᵉʳ test 3 ans après la dernière cytologie normale ; condition « résultat négatif » |
| Rappel dTcaP | Vaccination Info Service (20/04/2026) | Alerte + vaccin pré-généré à 25, 45, 65, 75, 85 ans si non fait | pas de rattrapage ; pas de fenêtre « fait » ; libellé XMed ; mention de suspension ≥ 65 ans **non vérifiée** |
| Lithium | RCP TERALITHE LP 400 mg (base publique des médicaments, mis à jour 27/07/2026) | Bilan avant traitement (créatinine, clairance, calcémie, protéinurie, ionogramme, NFS, TSH, glycémie à jeun, ECG, EEG) à T0 ; lithiémies à J7 et J14 | J21 ; rythme hebdo → mensuel → 2 mois (départ non représentable) ; fréquence des contrôles « réguliers » créatinine/calcémie/ECG/TSH (**le RCP ne la donne pas**) |

Limites de la méthode :
- Le calendrier vaccinal 2026 (PDF officiel) n'a pas pu être lu depuis l'environnement ; la règle s'appuie sur la page Vaccination Info Service.
- La page Service-Public (sein) et celle du dépistage colorectal sont des pages grand public ; la source de référence clinique reste l'INCa / la HAS.
- Le RCP lu est celui d'**une** spécialité de lithium.
- Ces règles ne remplacent pas la validation par un médecin.

## 4. Pistes de cas suivants (à fournir avec leur source)

Plutôt que de les écrire de mémoire : dites-moi les suivis qui vous intéressent (ou donnez-moi la recommandation HAS / ANSM / RCP) et je les ajoute avec la même méthode. Ex. : autres thymorégulateurs, anticoagulants, antithyroïdiens, antipsychotiques (Zyprexa), insuffisance rénale chronique, hypothyroïdie.
