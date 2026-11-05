# QCM CGP France

Banque collaborative de questions théoriques destinée à la préparation aux connaissances générales attendues d'un conseiller en gestion de patrimoine exerçant en France.

## Accès direct au QCM

**[Ouvrir le QCM CGP](https://yassinehimmich-1996.github.io/qcm-cgp/)**

L'application est conçue en priorité pour iPhone. Elle peut être ajoutée à l'écran d'accueil depuis le menu **Partager**, puis **Sur l'écran d'accueil**. La progression, les erreurs et les favoris restent enregistrés localement sur l'appareil.

## Périmètre

- questions exclusivement théoriques ;
- deux propositions pour les vrai/faux, ou quatre propositions pour les QCM à réponse unique ou multiple ;
- objectif de réponse rapide, environ 36 secondes par question ;
- références publiques et datées ;
- réglementation, fiscalité, produits, droit patrimonial, crédit, assurance et conformité ;
- aucune donnée client, aucun document interne et aucune reproduction d'un questionnaire d'employeur.

Ce projet est indépendant. Il ne constitue ni un examen officiel, ni une banque de questions BNP Paribas, AMF ou ACPR, ni un conseil juridique, fiscal ou financier.

## État du projet

- 800 questions théoriques réparties en 16 lots de 50, chacun brassé sur au moins 23 domaines ;
- 292 notions-mères publiques, complétées par 91 questions ciblées de niveau professionnel ;
- 28 domaines présents dans la banque ;
- 146 références publiques cataloguées ;
- 440 questions à réponse unique, 256 questions à réponses multiples et 104 vrai/faux ;
- 32 questions multiples comportent trois bonnes réponses et 224 en comportent deux ;
- aucun niveau débutant : 180 questions intermédiaires, 229 avancées et 391 expertes ;
- 77,5 % de la banque est classée avancée ou experte ;
- aucun cas client ni calcul ;
- statut éditorial des questions : `verifie_sources_publiques` ;
- dernière revue documentaire et validation technique : 5 novembre 2026.

Le statut `verifie_sources_publiques` indique que la règle a été rapprochée d'une source institutionnelle identifiée et datée. Une veille reste nécessaire pour les règles fiscales, sociales et réglementaires susceptibles d'évoluer.

## Modes d'entraînement

- révision de l’intégralité des 800 questions avec correction immédiate ;
- examen blanc stratifié de 100 questions en 60 minutes, sans correction avant la fin ;
- révision par domaine ou des erreurs enregistrées ;
- suivi local du taux de réussite et des questions vues ;
- fonctionnement installable et hors connexion après le premier chargement.

## Structure

```text
index.html                         Application QCM mobile
assets/                            Interface, logique et icônes PWA
questions/lot-001..016.json        Questions et corrigés structurés
data/knowledge-seeds.mjs           Notions théoriques servant à la génération
data/coverage-seeds.mjs            Compléments de couverture vérifiés en 2026
data/test-level-seeds.mjs          Renforcements de niveau test professionnel
data/capture-gap-seeds.mjs         Compléments publics issus de l'audit des captures
sources/sources.json               Catalogue des références publiques
schema/question.schema.json        Contrat de données
scripts/validate_questions.py      Contrôles automatiques
scripts/audit_quality.py           Rapport d'équilibre et de qualité formelle
scripts/generate_training_bank.mjs Génération reproductible des lots
docs/referentiel.md                Répartition pédagogique
CONTRIBUTING.md                    Processus de contribution et de revue
```

## Vérifier la banque et l'application

```bash
npm run check
```

Le validateur contrôle notamment le total de 800 questions, les lots de 50, les identifiants, les doublons complets, les choix A-B ou A-D, la cohérence des réponses uniques, multiples ou vrai/faux, les sources, les dates, le niveau de difficulté et l'absence de scénarios ou de calculs manifestes.

Le rapport d'audit reproductible s'obtient avec :

```bash
npm run audit
```

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
