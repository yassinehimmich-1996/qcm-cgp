# QCM CGP France

Banque collaborative de questions théoriques destinée à la préparation aux connaissances générales attendues d'un conseiller en gestion de patrimoine exerçant en France.

## Accès direct au QCM

**[Ouvrir le QCM CGP](https://yassinehimmich-1996.github.io/qcm-cgp/)**

L'application est conçue en priorité pour iPhone. Elle peut être ajoutée à l'écran d'accueil depuis le menu **Partager**, puis **Sur l'écran d'accueil**. La progression, les erreurs et les favoris restent enregistrés localement sur l'appareil.

## Périmètre

- questions exclusivement théoriques ;
- quatre propositions et une seule bonne réponse ;
- objectif de réponse rapide, environ 36 secondes par question ;
- références publiques et datées ;
- réglementation, fiscalité, produits, droit patrimonial, crédit, assurance et conformité ;
- aucune donnée client, aucun document interne et aucune reproduction d'un questionnaire d'employeur.

Ce projet est indépendant. Il ne constitue ni un examen officiel, ni une banque de questions BNP Paribas, AMF ou ACPR, ni un conseil juridique, fiscal ou financier.

## État du projet

- 1 000 questions théoriques réparties en 20 lots de 50 ;
- 190 notions-mères déclinées en cinq formulations d'entraînement, complétées par 50 questions initiales ;
- 27 domaines présents dans la banque ;
- 86 références publiques cataloguées ;
- quatre réponses et une seule bonne réponse par question ;
- aucun cas client ni calcul ;
- statut éditorial des questions : `a_valider` ;
- dernière génération et validation technique : 4 novembre 2026.

Le statut `a_valider` est volontaire : le validateur garantit la structure et la cohérence technique, mais ne remplace pas une double revue humaine des règles fiscales, juridiques et réglementaires.

## Modes d'entraînement

- session rapide de 20 questions avec correction immédiate ;
- série complète de 50 questions ;
- examen blanc de 100 questions en 60 minutes, sans correction avant la fin ;
- révision par domaine, par erreurs ou par favoris ;
- suivi local du taux de réussite, des questions vues et de la meilleure série ;
- fonctionnement installable et hors connexion après le premier chargement.

## Structure

```text
index.html                         Application QCM mobile
assets/                            Interface, logique et icônes PWA
questions/lot-001..020.json        Questions et corrigés structurés
data/knowledge-seeds.mjs           Notions théoriques servant à la génération
sources/sources.json               Catalogue des références publiques
schema/question.schema.json        Contrat de données
scripts/validate_questions.py      Contrôles automatiques
scripts/generate_training_bank.mjs Génération reproductible des lots
docs/referentiel.md                Répartition pédagogique
CONTRIBUTING.md                    Processus de contribution et de revue
```

## Vérifier la banque et l'application

```bash
npm run check
```

Le validateur contrôle notamment le total de 1 000 questions, les lots de 50, les identifiants, les doublons d'énoncé, les quatre choix, la réponse unique, les sources, les dates et l'absence de scénarios ou de calculs manifestes.

Pour prévisualiser l'application en local :

```bash
npm run dev
```

## Contribuer

1. Créer une branche.
2. Ajouter ou modifier une question.
3. Lancer le validateur.
4. Ouvrir une pull request en remplissant la grille de contrôle.
5. Obtenir une validation technique et une validation pédagogique.

Voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

Le contenu pédagogique est proposé sous licence [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Les scripts sont proposés sous licence MIT.
