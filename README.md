# QCM CGP France

Banque collaborative de questions théoriques destinée à la préparation aux connaissances générales attendues d'un conseiller en gestion de patrimoine exerçant en France.

## Périmètre

- questions exclusivement théoriques ;
- quatre propositions et une seule bonne réponse ;
- objectif de réponse rapide, environ 36 secondes par question ;
- références publiques et datées ;
- réglementation, fiscalité, produits, droit patrimonial, crédit, assurance et conformité ;
- aucune donnée client, aucun document interne et aucune reproduction d'un questionnaire d'employeur.

Ce projet est indépendant. Il ne constitue ni un examen officiel, ni une banque de questions BNP Paribas, AMF ou ACPR, ni un conseil juridique, fiscal ou financier.

## État du projet

- objectif : 1 000 questions originales ;
- lot initial : 50 questions théoriques ;
- statut initial des questions : `a_valider` ;
- date de vérification du lot 1 : 3 novembre 2026.

## Structure

```text
questions/lot-001.json       Questions et corrigés structurés
sources/sources.json         Catalogue des références publiques
schema/question.schema.json  Contrat de données
scripts/validate_questions.py Contrôles automatiques
docs/referentiel.md          Répartition cible des 1 000 questions
CONTRIBUTING.md              Processus de contribution et de revue
```

## Vérifier la banque

```bash
python3 scripts/validate_questions.py
```

Le validateur contrôle notamment les identifiants, les quatre choix, la réponse unique, les sources, les dates et l'absence de scénarios ou de calculs manifestes.

## Contribuer

1. Créer une branche.
2. Ajouter ou modifier une question.
3. Lancer le validateur.
4. Ouvrir une pull request en remplissant la grille de contrôle.
5. Obtenir une validation technique et une validation pédagogique.

Voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

Le contenu pédagogique est proposé sous licence [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Les scripts sont proposés sous licence MIT.
