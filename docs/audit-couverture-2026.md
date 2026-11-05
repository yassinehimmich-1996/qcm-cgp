# Audit de couverture thématique 2026

Cet audit vérifie que la banque couvre les connaissances patrimoniales théoriques utiles à un conseiller en gestion de patrimoine bancaire. Il ne constitue pas une pondération officielle d'un employeur ou d'un examen.

Les questions sont des créations originales. Les règles citées sont rattachées à des sources publiques cataloguées dans `sources/sources.json`. Aucun questionnaire interne n'est reproduit.

## Synthèse

| Bloc | Couverture | Renforcement de novembre 2026 |
|---|---|---|
| Impôt sur le revenu et prélèvement à la source | Couverte | Domicile fiscal, foyer, quotient, barème 2026, PAS individualisé, taux neutre, modulation et acomptes |
| Avantages fiscaux | Couverte | Déduction, réduction, crédit, plafonds de niches, avance de 60 % et fin du Pinel |
| Immobilier et biens meubles | Couverte | Micro-foncier, déficit foncier, LMNP/LMP, plus-values, SCI, IFI et cessions de biens meubles |
| Épargne financière | Couverte | PFU 2026, option globale, CSG déductible, PEA et comparaison des enveloppes |
| Enveloppes spécifiques | Couverte | Assurance-vie, PEL, CEL, PEA, PEA-PME, PEA Jeunes et PER |
| Transmission à titre gratuit | Couverte | Démembrement, abattements, dons familiaux et paiement des droits |
| Couples et succession | Couverte | Régimes matrimoniaux, Pacs, réserve et droits du conjoint survivant |
| Préparation à la retraite | Couverte | Architecture, âges 2026, trimestres, calcul de base, Agirc-Arrco, réversion et liquidation |
| Méthode patrimoniale | Couverte | Découverte, actualisation et traçabilité du conseil |

## Répartition dans la banque et les examens

- Les 102 questions de renforcement issues de la grille thématique du document sont réparties dans l'ensemble des 22 lots, et non concentrées dans les deux derniers lots.
- Chaque lot de 50 contient au moins 12 domaines distincts.
- L'examen blanc de 100 questions utilise une sélection stratifiée : fiscalité, immobilier, épargne financière, enveloppes, transmission, retraite, conformité, crédit, prévoyance, banque quotidienne et international.
- Cette répartition est une construction pédagogique. Elle ne prétend pas reproduire la pondération d'une évaluation interne.

## Contrôle détaillé

| Domaine contrôlé | Statut | Sources publiques principales |
|---|---|---|
| Résidence et domicile fiscal | Couvert | S084 |
| Imposition commune, parts et quotient familial | Couvert | S087, S121 |
| Barème progressif et taux marginal | Couvert | S087 |
| Prélèvement à la source | Couvert | S088, S122 |
| Prélèvements sociaux 2026 et exceptions | Couvert | S039, S101 |
| Déduction, réduction et crédit d'impôt | Couvert | S089 |
| Plafonnement global des niches fiscales | Couvert | S090 |
| Avance sur avantages fiscaux | Couvert | S091 |
| Pinel et Denormandie | Couvert | S013, S092 |
| DPE et décence énergétique | Couvert | S011, S012 |
| Location nue et micro-foncier | Couvert | S093 |
| Déficit foncier | Couvert | S094, S099 |
| Location meublée, LMNP et LMP | Couvert | S095, S096 |
| Plus-values immobilières | Couvert | S097 |
| SCI à l'IR et à l'IS | Couvert | S098, S099 |
| Cession de parts de SCI | Couvert | S119 |
| IFI : seuil, assiette et dettes | Couvert | S060, S106, S107 |
| Cession de biens meubles | Couvert | S100 |
| Revenus mobiliers et plus-values de valeurs mobilières | Couvert | S036, S101 |
| Actions, obligations, OPC, ETF et produits structurés | Couvert | S032 à S035, S042, S054 à S057 |
| SCPI et placements immobiliers | Couvert | S034 |
| Assurance-vie : droit, rachats, supports et succession | Couvert | S022 à S027 |
| Contrat de capitalisation | Couvert | S058 |
| PEL et CEL | Couvert | S104, S105 |
| PEA, PEA-PME et PEA Jeunes | Couvert | S029, S030, S102 |
| PER : compartiments, sortie et fiscalité | Couvert | S031, S103 |
| Usufruit, nue-propriété et barème fiscal | Couvert | S015, S016, S109 |
| Abattements de donation | Couvert | S021, S120 |
| Dons familiaux de sommes d'argent | Couvert | S108 |
| Paiement des droits de donation et succession | Couvert | S111, S120 |
| Communauté, séparation et participation aux acquêts | Couvert | S017, S045, S112 |
| Changement de régime matrimonial | Couvert | S046 |
| Pacs : biens et succession | Couvert | S019, S123 |
| Réserve héréditaire et quotité disponible | Couvert | S043, S110 |
| Droits du conjoint survivant | Couvert | S020, S110 |
| Droit temporaire et droit viager au logement | Couvert | S126 |
| Architecture des régimes de retraite | Couvert | S115 |
| Âge légal et durée d'assurance applicables en 2026 | Couvert | S113 |
| Pension de base et revenu annuel moyen | Couvert | S114 |
| Retraite complémentaire Agirc-Arrco | Couvert | S116 |
| Réversions de base et complémentaire | Couvert | S116, S117 |
| RIS, EIG et entretien information retraite | Couvert | S115 |
| Demande et liquidation de la retraite | Couvert | S118 |
| Retraite des artisans et commerçants | Couvert | S125 |
| Retraite des professions libérales | Couvert | S124 |
| Découverte et traçabilité du conseil | Couvert | S002, S004, S083 |

## Règles de maintenance

- Les taux, plafonds et dates d'effet doivent être revérifiés avant chaque campagne d'entraînement.
- Une page sans date publique explicite porte la mention `date de mise à jour non indiquée` dans le catalogue : aucune date n'est inventée.
- Une question dont la source devient contradictoire ou obsolète passe à `a_actualiser` et est corrigée avant réintégration.
- Les taux 2026 sont rattachés au produit concerné afin d'éviter de généraliser le taux social de droit commun aux exceptions.
