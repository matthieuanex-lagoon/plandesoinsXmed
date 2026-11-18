// GENERE par tools/build_maquette_data.py — ne pas éditer
window.REGLES = [
 {
  "id": "depistage-colorectal",
  "libelle": "Requête — dépistage (recherche de sang dans les selles)",
  "source": "document_source",
  "statut_validation": "a_valider",
  "declencheur": {
   "type": "profil",
   "criteres": [
    "age entre 50 et 75 ans",
    "sans épisode de soin (ouvert ou fermé) de polype du côlon, cancer du côlon, sigmoïde ou rectum",
    "sans antécédent familial 1er degré de polype ou de cancer",
    "sans CR de coloscopie de moins de 5 ans",
    "sans élément de suivi de coloscopie de moins de 5 ans"
   ]
  },
  "entretien": [
   {
    "prescrire": "Recherche de sang dans les selles",
    "canal": "prevention",
    "periodicite": {
     "min": 2,
     "unite": "an"
    }
   }
  ]
 },
 {
  "id": "diabete-hba1c-sup-7",
  "libelle": "Règle diabète HbA1c > 7 %",
  "source": "document_source",
  "statut_validation": "a_valider",
  "declencheur": {
   "type": "pathologie",
   "criteres": [
    "HbA1c > 7 %"
   ]
  },
  "entretien": [
   {
    "chercher": "Hémoglobine",
    "prescrire": "NFS",
    "periodicite": {
     "min": 1,
     "unite": "an"
    }
   },
   {
    "chercher": "HbA1c",
    "prescrire": "HbA1c",
    "periodicite": {
     "min": 3,
     "unite": "mois"
    }
   },
   {
    "chercher": "Chol total",
    "prescrire": "EAL",
    "periodicite": {
     "min": 1,
     "unite": "an"
    }
   },
   {
    "chercher": "SGOT",
    "prescrire": "SGOT",
    "periodicite": {
     "min": 1,
     "unite": "an"
    }
   },
   {
    "chercher": "SGPT",
    "prescrire": "SGPT",
    "periodicite": {
     "min": 1,
     "unite": "an"
    }
   },
   {
    "chercher": "Gamma GT",
    "prescrire": "Gamma GT",
    "periodicite": {
     "min": 1,
     "unite": "an"
    }
   },
   {
    "chercher": "TP",
    "prescrire": "TP",
    "periodicite": {
     "min": 1,
     "unite": "an"
    }
   },
   {
    "chercher": "Clairance de la créatinine CKD-EPI",
    "prescrire": "Clairance de la créatinine",
    "periodicite": {
     "min": 1,
     "unite": "an"
    }
   },
   {
    "chercher": "RAC",
    "prescrire": "RAC",
    "periodicite": {
     "min": 1,
     "unite": "an"
    }
   },
   {
    "chercher": "ECG dans ES et doc",
    "prescrire": "ECG",
    "canal": "prevention",
    "periodicite": {
     "min": 1,
     "unite": "an"
    }
   }
  ]
 },
 {
  "id": "iec-ara2",
  "libelle": "Patients sous IEC ou ARA2",
  "source": "document_source",
  "statut_validation": "a_valider",
  "declencheur": {
   "type": "medicament",
   "atc": [
    "C09",
    "C09C"
   ]
  },
  "instauration": [
   {
    "prescrire": "Ionogramme (Na, K)",
    "periodicite_texte": "Dans 2 à 4 semaines puis 1 an",
    "jalons": [
     "S2-4",
     "M12"
    ]
   },
   {
    "prescrire": "Créatinine",
    "periodicite_texte": "Dans 2 à 4 semaines puis 1 an",
    "jalons": [
     "S2-4",
     "M12"
    ]
   }
  ],
  "entretien": [
   {
    "chercher": "Sodium",
    "prescrire": "Ionogramme",
    "periodicite": {
     "min": 1,
     "max": 2,
     "unite": "an"
    }
   },
   {
    "chercher": "Créatinine",
    "prescrire": "Clairance de la créatinine",
    "periodicite": {
     "min": 1,
     "max": 2,
     "unite": "an"
    }
   },
   {
    "chercher": "Microalbuminurie",
    "prescrire": null,
    "periodicite": {
     "min": 1,
     "max": 2,
     "unite": "an"
    }
   }
  ]
 },
 {
  "id": "lamotrigine",
  "libelle": "Patient sous lamotrigine",
  "source": "document_source",
  "statut_validation": "a_valider",
  "declencheur": {
   "type": "medicament",
   "atc": [
    "N03AX09"
   ]
  },
  "instauration": [
   {
    "prescrire": "NFS",
    "jalons": [
     "T0",
     "M12"
    ]
   },
   {
    "prescrire": "Ionogramme",
    "jalons": [
     "T0",
     "M12"
    ]
   },
   {
    "prescrire": "Glycémie",
    "jalons": [
     "T0",
     "M6",
     "M12"
    ]
   },
   {
    "prescrire": "EAL",
    "jalons": [
     "T0",
     "M12"
    ]
   },
   {
    "prescrire": "Bilan hépatique",
    "jalons": [
     "T0",
     "M12"
    ]
   },
   {
    "prescrire": "Créatinine / Clairance de la créatinine",
    "jalons": [
     "T0",
     "M12"
    ]
   }
  ],
  "entretien": [
   {
    "chercher": "Hémoglobine",
    "prescrire": "NFS",
    "periodicite": {
     "min": 12,
     "unite": "mois"
    }
   },
   {
    "chercher": "Sodium",
    "prescrire": "Ionogramme",
    "periodicite": {
     "min": 12,
     "unite": "mois"
    }
   },
   {
    "chercher": "Glycémie",
    "prescrire": "Glycémie",
    "periodicite": {
     "min": 12,
     "unite": "mois"
    }
   },
   {
    "chercher": "Chol LDL",
    "prescrire": "EAL",
    "periodicite": {
     "min": 12,
     "unite": "mois"
    }
   },
   {
    "chercher": "SGOT",
    "prescrire": "Bilan hépatique",
    "periodicite": {
     "min": 12,
     "unite": "mois"
    }
   },
   {
    "chercher": "Clairance de la créatinine",
    "prescrire": "Clairance de la créatinine",
    "periodicite": {
     "min": 12,
     "unite": "mois"
    }
   }
  ]
 }
];
