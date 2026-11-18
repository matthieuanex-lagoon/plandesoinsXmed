// GENERE par tools/build.py — ne pas éditer
window.REGLES = [
 {
  "id": "depistage-colorectal",
  "libelle": "Requête — dépistage (recherche de sang dans les selles)",
  "actif": true,
  "statut_validation": "a_valider",
  "origine": "Document « Plan de soins » (Fred), transcrit dans regles/depistage-colorectal.yaml",
  "evaluer_quand": [
   "ouverture_dossier",
   "integration_resultat",
   "quotidien"
  ],
  "quand": {
   "op": "ET",
   "conditions": [
    {
     "type": "age",
     "op": "entre",
     "valeur": 50,
     "valeur2": 75
    },
    {
     "op": "ET",
     "non": true,
     "conditions": [
      {
       "op": "OU",
       "conditions": [
        {
         "type": "pathologie",
         "libelle": "polype du côlon"
        },
        {
         "type": "pathologie",
         "libelle": "cancer du côlon"
        },
        {
         "type": "pathologie",
         "libelle": "cancer du sigmoïde"
        },
        {
         "type": "pathologie",
         "libelle": "cancer du rectum"
        }
       ]
      }
     ]
    },
    {
     "op": "ET",
     "non": true,
     "conditions": [
      {
       "op": "OU",
       "conditions": [
        {
         "type": "antecedent_familial",
         "libelle": "polype",
         "premier_degre": true
        },
        {
         "type": "antecedent_familial",
         "libelle": "cancer",
         "premier_degre": true
        }
       ]
      }
     ]
    },
    {
     "type": "compte_rendu",
     "libelle": "Coloscopie",
     "depuis_mois": 60,
     "non": true
    },
    {
     "type": "element_suivi",
     "libelle": "Coloscopie",
     "op": "existe",
     "depuis_mois": 60,
     "non": true
    }
   ]
  },
  "alors": [
   {
    "action": "ordonnance",
    "categorie": "autre",
    "examens": [
     "Recherche de sang dans les selles"
    ],
    "frequence": {
     "mode": "tous_les",
     "valeur": 2,
     "unite": "ans"
    }
   }
  ],
  "points_a_valider": [
   "Écart avec le programme officiel : sante.fr (18/03/2026) indique « 50 à 74 ans » ; le document indique 50 à 75 ans.",
   "Le programme officiel exclut les antécédents personnels ou familiaux de « polype, de cancer ou de maladie touchant le côlon ou le rectum » (sans limiter au 1er degré) ; le document limite aux parents du 1er degré et ajoute « CR de coloscopie de moins de 5 ans »."
  ],
  "references": [
   {
    "libelle": "sante.fr — « Cancer colorectal : pourquoi se faire dépister ? » (18/03/2026)",
    "url": "https://www.sante.fr/node/6706903",
    "extrait": "personnes âgées de 50 à 74 ans … un test tous les 2 ans … test immunologique à réaliser chez soi"
   }
  ]
 },
 {
  "id": "diabete-hba1c-sup-7",
  "libelle": "Règle diabète HbA1c > 7 %",
  "actif": true,
  "statut_validation": "a_valider",
  "origine": "Document « Plan de soins » (Fred), transcrit dans regles/diabete-hba1c-sup-7.yaml",
  "evaluer_quand": [
   "ouverture_dossier",
   "integration_resultat",
   "quotidien"
  ],
  "quand": {
   "op": "ET",
   "conditions": [
    {
     "type": "element_suivi",
     "libelle": "HbA1c",
     "op": ">",
     "valeur": 7
    }
   ]
  },
  "alors": [
   {
    "action": "ordonnance",
    "categorie": "biologie",
    "examens": [
     "NFS",
     "EAL",
     "SGOT",
     "SGPT",
     "Gamma GT",
     "TP",
     "Clairance de la créatinine",
     "RAC"
    ],
    "frequence": {
     "mode": "tous_les",
     "valeur": 1,
     "unite": "ans"
    },
    "cherche": {
     "NFS": "Hémoglobine",
     "EAL": "Chol total",
     "SGOT": "SGOT",
     "SGPT": "SGPT",
     "Gamma GT": "Gamma GT",
     "TP": "TP",
     "Clairance de la créatinine": "Clairance de la créatinine CKD-EPI",
     "RAC": "RAC"
    }
   },
   {
    "action": "ordonnance",
    "categorie": "biologie",
    "examens": [
     "HbA1c"
    ],
    "frequence": {
     "mode": "tous_les",
     "valeur": 3,
     "unite": "mois"
    },
    "cherche": {
     "HbA1c": "HbA1c"
    }
   },
   {
    "action": "ordonnance",
    "categorie": "autre",
    "examens": [
     "ECG"
    ],
    "frequence": {
     "mode": "tous_les",
     "valeur": 1,
     "unite": "ans"
    },
    "cherche": {
     "ECG": "ECG dans ES et doc"
    }
   }
  ]
 },
 {
  "id": "iec-ara2",
  "libelle": "Patients sous IEC ou ARA2",
  "actif": true,
  "statut_validation": "a_valider",
  "origine": "Document « Plan de soins » (Fred), transcrit dans regles/iec-ara2.yaml",
  "evaluer_quand": [
   "nouvelle_prescription",
   "quotidien"
  ],
  "quand": {
   "op": "ET",
   "conditions": [
    {
     "type": "medicament",
     "atc": [
      "C09",
      "C09C"
     ]
    }
   ]
  },
  "alors": [
   {
    "action": "ordonnance",
    "phase": "instauration",
    "categorie": "biologie",
    "examens": [
     "Ionogramme (Na, K)",
     "Créatinine"
    ],
    "frequence": {
     "mode": "jalons",
     "jalons": [
      "S2-4",
      "M12"
     ]
    }
   },
   {
    "action": "ordonnance",
    "categorie": "biologie",
    "examens": [
     "Ionogramme",
     "Clairance de la créatinine"
    ],
    "frequence": {
     "mode": "tous_les",
     "valeur": 1,
     "unite": "ans",
     "max": 2
    },
    "phase": "entretien",
    "cherche": {
     "Ionogramme": "Sodium",
     "Clairance de la créatinine": "Créatinine"
    }
   }
  ],
  "points_a_valider": [
   "Ligne « Microalbuminurie » : élément à prescrire non renseigné dans le document source."
  ]
 },
 {
  "id": "lamotrigine",
  "libelle": "Patient sous lamotrigine",
  "actif": true,
  "statut_validation": "a_valider",
  "origine": "Document « Plan de soins » (Fred), transcrit dans regles/lamotrigine.yaml",
  "evaluer_quand": [
   "nouvelle_prescription",
   "quotidien"
  ],
  "quand": {
   "op": "ET",
   "conditions": [
    {
     "type": "medicament",
     "atc": [
      "N03AX09"
     ]
    }
   ]
  },
  "alors": [
   {
    "action": "ordonnance",
    "phase": "instauration",
    "categorie": "biologie",
    "examens": [
     "NFS",
     "Ionogramme",
     "EAL",
     "Bilan hépatique",
     "Créatinine / Clairance de la créatinine"
    ],
    "frequence": {
     "mode": "jalons",
     "jalons": [
      "T0",
      "M12"
     ]
    }
   },
   {
    "action": "ordonnance",
    "phase": "instauration",
    "categorie": "biologie",
    "examens": [
     "Glycémie"
    ],
    "frequence": {
     "mode": "jalons",
     "jalons": [
      "T0",
      "M6",
      "M12"
     ]
    }
   },
   {
    "action": "ordonnance",
    "categorie": "biologie",
    "examens": [
     "NFS",
     "Ionogramme",
     "Glycémie",
     "EAL",
     "Bilan hépatique",
     "Clairance de la créatinine"
    ],
    "frequence": {
     "mode": "tous_les",
     "valeur": 12,
     "unite": "mois"
    },
    "phase": "entretien",
    "cherche": {
     "NFS": "Hémoglobine",
     "Ionogramme": "Sodium",
     "Glycémie": "Glycémie",
     "EAL": "Chol LDL",
     "Bilan hépatique": "SGOT",
     "Clairance de la créatinine": "Clairance de la créatinine"
    }
   }
  ]
 },
 {
  "actif": true,
  "statut_validation": "a_valider",
  "origine": "Recommandation officielle lue sur la source citée — non validée cliniquement",
  "id": "depistage-col-uterus-25-29",
  "libelle": "Dépistage du cancer du col de l'utérus (25–29 ans)",
  "evaluer_quand": [
   "ouverture_dossier",
   "quotidien"
  ],
  "quand": {
   "op": "ET",
   "conditions": [
    {
     "type": "sexe",
     "valeur": "F"
    },
    {
     "type": "age",
     "op": "entre",
     "valeur": 25,
     "valeur2": 29
    }
   ]
  },
  "alors": [
   {
    "action": "ordonnance",
    "categorie": "autre",
    "examens": [
     "Examen cytologique (dépistage du col de l'utérus)"
    ],
    "frequence": {
     "mode": "tous_les",
     "valeur": 3,
     "unite": "ans"
    }
   }
  ],
  "points_a_valider": [
   "Rythme de 3 ans valable « après deux premiers tests réalisés à 1 an d'intervalle et dont les résultats sont normaux » : les deux premiers tests ne sont pas représentés.",
   "Classement de l'examen (biologie / prévention) à confirmer."
  ],
  "references": [
   {
    "libelle": "HAS — « Dépistage du cancer du col de l'utérus : le test HPV-HR recommandé chez les femmes de plus de 30 ans » (06/07/2020)",
    "url": "https://www.has-sante.fr/jcms/p_3192618/fr/depistage-du-cancer-du-col-de-l-uterus-le-test-hpv-hr-recommande-chez-les-femmes-de-plus-de-30-ans",
    "extrait": "le test de dépistage est réalisé par examen cytologique tous les 3 ans"
   }
  ]
 },
 {
  "actif": true,
  "statut_validation": "a_valider",
  "origine": "Recommandation officielle lue sur la source citée — non validée cliniquement",
  "id": "depistage-col-uterus-30-65",
  "libelle": "Dépistage du cancer du col de l'utérus (30–65 ans)",
  "evaluer_quand": [
   "ouverture_dossier",
   "quotidien"
  ],
  "quand": {
   "op": "ET",
   "conditions": [
    {
     "type": "sexe",
     "valeur": "F"
    },
    {
     "type": "age",
     "op": "entre",
     "valeur": 30,
     "valeur2": 65
    }
   ]
  },
  "alors": [
   {
    "action": "ordonnance",
    "categorie": "autre",
    "examens": [
     "Test HPV-HR (dépistage du col de l'utérus)"
    ],
    "frequence": {
     "mode": "tous_les",
     "valeur": 5,
     "unite": "ans"
    }
   }
  ],
  "points_a_valider": [
   "Premier test HPV-HR « 3 ans après le dernier examen cytologique dont le résultat est normal » : non représenté.",
   "Nouveau test tous les 5 ans « dès lors que le résultat du test est négatif » : la règle ne regarde pas le résultat.",
   "Classement de l'examen (biologie / prévention) à confirmer."
  ],
  "references": [
   {
    "libelle": "HAS — « Dépistage du cancer du col de l'utérus : le test HPV-HR recommandé chez les femmes de plus de 30 ans » (06/07/2020)",
    "url": "https://www.has-sante.fr/jcms/p_3192618/fr/depistage-du-cancer-du-col-de-l-uterus-le-test-hpv-hr-recommande-chez-les-femmes-de-plus-de-30-ans",
    "extrait": "Un nouveau test est refait tous les 5 ans, jusqu'à l'âge de 65 ans, dès lors que le résultat du test est négatif"
   }
  ]
 },
 {
  "actif": true,
  "statut_validation": "a_valider",
  "origine": "Recommandation officielle lue sur la source citée — non validée cliniquement",
  "id": "depistage-sein-organise",
  "libelle": "Dépistage organisé du cancer du sein (50–74 ans)",
  "evaluer_quand": [
   "ouverture_dossier",
   "quotidien"
  ],
  "quand": {
   "op": "ET",
   "conditions": [
    {
     "type": "sexe",
     "valeur": "F"
    },
    {
     "type": "age",
     "op": "entre",
     "valeur": 50,
     "valeur2": 74
    }
   ]
  },
  "alors": [
   {
    "action": "ordonnance",
    "categorie": "imagerie",
    "examens": [
     "Mammographie"
    ],
    "frequence": {
     "mode": "tous_les",
     "valeur": 2,
     "unite": "ans"
    }
   }
  ],
  "points_a_valider": [
   "La source exclut les femmes avec symptômes ou antécédents personnels/familiaux de risque élevé : non représenté (à définir : quels éléments du dossier ?).",
   "La source associe un examen clinique des seins à la mammographie : non représenté.",
   "La page Service-Public indique elle-même qu'elle est ancienne : vérifier sur le site de l'Assurance maladie ou de l'INCa."
  ],
  "references": [
   {
    "libelle": "Service-Public — « Cancer du sein : un mois pour sensibiliser au dépistage » (01/10/2024)",
    "url": "https://www.service-public.gouv.fr/particuliers/actualites/A15216?lang=fr",
    "extrait": "À partir de l'âge de 50 ans, et jusqu'à 74 ans … tous les 2 ans … une mammographie"
   }
  ]
 },
 {
  "actif": true,
  "statut_validation": "a_valider",
  "origine": "Recommandation officielle lue sur la source citée — non validée cliniquement",
  "id": "lithium-surveillance",
  "libelle": "Traitement par lithium — bilan initial et lithiémies de départ",
  "evaluer_quand": [
   "nouvelle_prescription",
   "quotidien"
  ],
  "quand": {
   "op": "ET",
   "conditions": [
    {
     "type": "medicament",
     "atc": "N05AN01"
    }
   ]
  },
  "alors": [
   {
    "action": "ordonnance",
    "phase": "instauration",
    "categorie": "biologie",
    "examens": [
     "Créatinine",
     "Clairance de la créatinine",
     "Calcémie",
     "Protéinurie",
     "Ionogramme",
     "NFS",
     "TSH",
     "Glycémie à jeun"
    ],
    "frequence": {
     "mode": "jalons",
     "jalons": [
      "T0"
     ]
    }
   },
   {
    "action": "ordonnance",
    "phase": "instauration",
    "categorie": "autre",
    "examens": [
     "ECG",
     "EEG"
    ],
    "frequence": {
     "mode": "jalons",
     "jalons": [
      "T0"
     ]
    }
   },
   {
    "action": "ordonnance",
    "phase": "instauration",
    "categorie": "biologie",
    "examens": [
     "Lithiémie"
    ],
    "frequence": {
     "mode": "jalons",
     "jalons": [
      "J7",
      "J14"
     ]
    }
   }
  ],
  "points_a_valider": [
   "Source = RCP de TERALITHE LP 400 mg uniquement : vérifier les autres spécialités contenant du lithium.",
   "Lithiémies à J7, J14 « et si nécessaire J21 » : J21 non représenté (à ajouter comme jalon J21 si le médecin le souhaite).",
   "Après lithiémie efficace : « toutes les semaines pendant le premier mois », puis mensuelle pendant le premier trimestre, puis tous les deux mois. Le point de départ (date d'obtention de la lithiémie efficace) n'est pas représentable : non encodé.",
   "Pendant le traitement, le RCP demande des « contrôles réguliers » de la créatininémie et de la calcémie, une surveillance régulière de l'ECG et de la TSH, sans donner de fréquence : à définir par le médecin (rien n'est inventé ici).",
   "Le bilan « avant le traitement » est placé à T0 (date de début) : à affiner.",
   "Glycémie : le RCP demande un contrôle en cas de prise de poids (condition non représentée)."
  ],
  "references": [
   {
    "libelle": "Base de données publique des médicaments — RCP TERALITHE LP 400 mg (rubriques 4.2, 4.4, 5.1 ; mis à jour le 27/07/2026)",
    "url": "http://base-donnees-publique.medicaments.gouv.fr/medicament/67292476/extrait",
    "extrait": "Lithium, code ATC : N05AN01 ; lithiémies déterminées à J7, J14 et si nécessaire J21"
   }
  ]
 },
 {
  "actif": true,
  "statut_validation": "a_valider",
  "origine": "Recommandation officielle lue sur la source citée — non validée cliniquement",
  "id": "rappel-dtcap-ages-fixes",
  "libelle": "Rappel dTcaP aux âges fixes (25, 45, 65 ans, puis tous les 10 ans)",
  "evaluer_quand": [
   "ouverture_dossier",
   "quotidien"
  ],
  "quand": {
   "op": "ET",
   "conditions": [
    {
     "op": "OU",
     "conditions": [
      {
       "type": "age",
       "op": "=",
       "valeur": 25
      },
      {
       "type": "age",
       "op": "=",
       "valeur": 45
      },
      {
       "type": "age",
       "op": "=",
       "valeur": 65
      },
      {
       "type": "age",
       "op": "=",
       "valeur": 75
      },
      {
       "type": "age",
       "op": "=",
       "valeur": 85
      }
     ]
    },
    {
     "type": "vaccin",
     "libelle": "dTcaP",
     "statut": "non_fait"
    }
   ]
  },
  "alors": [
   {
    "action": "indicateur_prevention",
    "libelle": "Rappel dTcaP à prévoir (âge fixe)",
    "niveau": "alerte",
    "ordonnance": {
     "categorie": "vaccin",
     "examens": [
      "Vaccin dTcaP"
     ],
     "frequence": {
      "mode": "une_fois"
     }
    }
   }
  ],
  "points_a_valider": [
   "Âge exact : un patient ayant dépassé l'âge fixe sans rappel n'est plus signalé. La source parle d'âges fixes, pas de rattrapage : à définir.",
   "« Vaccin non fait » n'a pas de fenêtre de temps dans cette règle (un ancien vaccin compte comme fait) : à définir.",
   "Libellé du vaccin à faire correspondre à celui du module vaccination de XMed (la capture affiche « Vaccin DTCP »).",
   "Le calendrier vaccinal 2026 (PDF, avril 2026) n'a pas pu être lu depuis cet environnement ; une recherche signale une mention de suspension du dTcaP chez les 65 ans et plus, non vérifiée : à confirmer avant d'activer les âges ≥ 65."
  ],
  "references": [
   {
    "libelle": "Vaccination Info Service — « Adultes (27 à 64 ans) » (mis à jour le 20/04/2026)",
    "url": "https://www.vaccination-info-service.fr/La-vaccination-au-cours-de-la-vie/Adultes-27-a-64-ans",
    "extrait": "les rappels se font tous les 20 ans aux âges fixes de 25 ans, 45 ans, 65 ans … à partir de 65 ans les rappels se font tous les 10 ans (75 ans, 85 ans...)"
   }
  ]
 }
];
