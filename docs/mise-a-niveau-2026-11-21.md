# Mise à niveau de la couverture — 21 novembre 2026

150 questions originales remplacent 150 entrées essentiellement répétitives. 650 questions sont conservées. Les identifiants retirés ne sont pas réutilisés : les nouvelles entrées vont de CGP-2026-0801 à CGP-2026-0950. Le manifeste décrit les retraits. Les réponses et favoris conservés portent toujours sur le même contenu ; les entrées retirées disparaissent du suivi actif.

La banque reste théorique, sans calcul demandé et sans cas client. Les explications relient la règle aux confusions possibles. Les distracteurs éditoriaux renforcés figurent dans `data/coverage-distractors.json` ; la rotation des propositions évite une bonne réponse systématiquement à la même place.

## Formats et niveau

440 QCU, 256 QCM multiples (224 à deux réponses exactes, 32 à trois), 104 vrai/faux. Cette répartition est un choix pédagogique conservé, pas un quota officiel BNP Paribas. Les niveaux sont des appréciations éditoriales : ils ne constituent pas une mesure psychométrique ni une équivalence démontrée avec le test interne. Une calibration réelle demanderait les résultats de candidats sur les items.

## Couverture des 25 domaines demandés

| Domaine demandé | Principaux thèmes de la base après modification |
|---|---|
| Diagnostic et calculs financiers | Diagnostic patrimonial : bilan, budget, capacité, actualisation, capitalisation ; compréhension des mécanismes sans calcul |
| Fiscalité | Fiscalité, fiscalité immobilière, enveloppes, transmission |
| Droit civil, matrimonial et familial | Droit civil, régimes matrimoniaux, transmission |
| Ingénierie et structuration | Ingénierie patrimoniale, SCI, démembrement, remploi, récompenses |
| Marchés et macroéconomie | Économie et marchés, taux, inflation, obligations |
| Produits financiers | Placements financiers, épargne bancaire, enveloppes |
| Assurance-vie et capitalisation | Assurance-vie ; contrat de capitalisation |
| Retraite, PER et épargne salariale | Retraite ; épargne salariale enrichie |
| Immobilier | Immobilier, immobilier locatif, fiscalité, SCPI |
| Financement et emprunteur | Crédit, crédit immobilier, consommation, assurance emprunteur |
| Portefeuille et allocation | Allocation et portefeuille |
| Risques | Risques patrimoniaux ; garanties, liquidité, taux, crédit, change |
| Transmission | Transmission, donations, succession, démembrement |
| Patrimoine professionnel | Patrimoine professionnel : Dutreil, holding, titres, concentration, cessibilité |
| International | International enrichi : résidence, convention, CRS, revenus, succession |
| Réglementation et conformité | Conformité, LCB-FT, RGPD, réglementation |
| ESG | Finance durable : SFDR, taxonomie, préférences, labels, matérialité |
| Relation et développement | Relation commerciale, conseil, traçabilité, conflits |
| Digital et IA | Digital et intelligence artificielle : fiabilité, données, supervision, accès, fraude |
| Prévoyance et santé | Prévoyance ; santé et dépendance |
| Banque et inclusion | Banque quotidienne, paiements, fraude, surendettement, droit au compte |
| Vulnérabilité | Clientèle vulnérable : assistance, représentation, tutelle, curatelle, mandat |
| Actifs réels et philanthropie | Actifs réels et philanthropie : or, forêt, art, vin, dons |
| Gouvernance et qualité | Gouvernance et qualité professionnelle : marché cible, contrôle, coordination, veille |
| IARD, RC, protection juridique | Assurances de biens et responsabilité |

Chaque domaine est représenté, avec une profondeur variable. Cette couverture ne prétend pas épuiser toutes les sous-notions professionnelles : cryptoactifs, stock-options/BSPCE, apport-cession chiffré, assurance homme-clé et dispositifs spécialisés devront faire l'objet de compléments si ces sujets deviennent prioritaires.

## Reproduction et vérification

`node scripts/generate_training_bank.mjs` reconstruit la banque historique puis applique les remplacements et les sources complémentaires. `node scripts/apply_coverage_upgrade.mjs` met à jour les 150 entrées déjà présentes sans changer les autres. `python3 scripts/validate_questions.py` vérifie structure, références, doublons et quotas. `node scripts/check_exam_sampling.mjs` exerce 500 tirages d'examen et contrôle les quotas et la présence des nouveaux sujets.

Les sources sensibles sont notamment le BOFiP Dutreil actualisé le 10 août 2026, le Code des assurances L132-4-1 pour les majeurs protégés, les publications AMF sur SFDR et les recommandations CNIL pour l'IA. Les règles conservées n'ont pas fait l'objet d'une nouvelle vérification juridique intégrale à cette date.
