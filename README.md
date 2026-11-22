# QCM CGP France

Banque collaborative de questions théoriques destinée à la préparation aux connaissances générales attendues d'un conseiller en gestion de patrimoine exerçant en France.

## Accès direct au QCM

**[Ouvrir le QCM CGP](https://yassinehimmich-1996.github.io/qcm-cgp/)**

L'application est conçue en priorité pour iPhone. Elle peut être ajoutée à l'écran d'accueil depuis le menu **Partager**, puis **Sur l'écran d'accueil**. La progression, et les erreurs restent enregistrés localement sur l'appareil.

## Périmètre

- questions exclusivement théoriques ;
- deux propositions pour les vrai/faux, ou quatre propositions pour les QCM à réponse unique ou multiple ;
- objectif de réponse rapide, environ 36 secondes par question ;
- références publiques et datées ;
- réglementation, fiscalité, produits, droit patrimonial, crédit, assurance et conformité ;
- aucune donnée client, aucun document interne et aucune reproduction d'un questionnaire d'employeur.

Ce projet est indépendant. Il ne constitue ni un examen officiel, ni une banque de questions BNP Paribas, AMF ou ACPR, ni un conseil juridique, fiscal ou financier.

## Banque et entraînement

800 questions classées dans 41 thèmes. Les 440 questions à choix unique, 256 à choix multiple et 104 vrai/faux sont réparties en 16 lots de 50. Chaque examen tire 100 questions en 60 minutes et diffère la correction jusqu’à la fin. Le mode révision donne la correction immédiatement. Le menu Thèmes permet de parcourir un domaine entier.

Les réponses et les erreurs sont conservées sur cet appareil. Les quotas et les niveaux de difficulté sont des choix pédagogiques.

Pour reconstruire les lots depuis les données éditoriales, exécuter `node scripts/generate_training_bank.mjs`. Les propositions retravaillées se trouvent dans `data/reponses-revues.txt`. Les références figurent dans `sources/sources.json`.

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
