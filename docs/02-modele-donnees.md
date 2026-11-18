# Modèle de données — esquisse

Noms provisoires, à aligner sur le schéma XMed existant.

```
Regle(id, libelle, source[amedulo|utilisateur], declencheur, version, regle_parent_id?, actif)
RegleItem(id, regle_id, phase[instauration|entretien|permanent], element_cherche, element_prescrire,
          periodicite_livree, periodicite_corrigee?, jalons?[T0,M6,M12])
PeriodicitePatient(patient_id, element_suivi, periodicite, saisi_par, date_saisie)
ElementSuivi(patient_id, code, date, valeur, prochaine_echeance?)         # existant dans XMed
PrescriptionBioEnAttente(patient_id, element_prescrire, echeance, origine_regles[], statut[en_attente|validee|rejetee])
```

## Résolution de la périodicité d'un élément (v0)

```
candidates = périodicités de toutes les règles déclenchées pour cet élément
           (corrigée utilisateur si présente, sinon livrée)
periodicite = min(candidates)           # période la plus courte
si PeriodicitePatient existe : à arbitrer (question ouverte n°3)
echeance = date_dernier_resultat + periodicite
```

## Droit au remords

- La règle livrée est **immuable** ; la modification crée une surcharge (`periodicite_corrigee`, ou règle fille via `regle_parent_id`).
- Supprimer la surcharge restaure la règle d'origine.

## Représentation des périodicités

Durée structurée (`{valeur, unite}`) pour les périodicités récurrentes ; jalons (`T0`, `M6`, `M12`) pour le plan d'instauration.
Intervalle (« 1 à 2 ans ») : stocker `min`/`max` ; le moteur utilise `min` par défaut (à confirmer).
