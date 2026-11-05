#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(ROOT, "sources", "sources.json");
const doc = JSON.parse(fs.readFileSync(file, "utf8"));
const consulted = "2026-11-05";

const additions = [
  ["S087", "Loi de finances 2026 : barème de l'impôt sur le revenu", "Ministère de l'Économie", "https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/loi-de-finances-2026-ce-qui-change-pour-les-particuliers", "2026-02-20", ["impôt sur le revenu", "barème 2026", "tranches"]],
  ["S088", "Changer son taux de prélèvement à la source", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F35894", "2025-01-01", ["prélèvement à la source", "taux individualisé", "taux neutre", "modulation"]],
  ["S089", "Déduction, réduction et crédit d'impôt : différences", "Service-Public.fr", "https://www.service-public.gouv.fr/particuliers/vosdroits/F823", "2026-04-15", ["déduction", "réduction d'impôt", "crédit d'impôt"]],
  ["S090", "Plafonnement global des niches fiscales", "Service-Public.fr", "https://www.service-public.gouv.fr/particuliers/vosdroits/F31179", "2026-01-01", ["niches fiscales", "plafond 10000 euros", "plafond 18000 euros"]],
  ["S091", "Réductions et crédits d'impôt : avance de 60 %", "Service-Public.fr", "https://www.service-public.gouv.fr/particuliers/vosdroits/F35936", "2026-01-01", ["avance fiscale", "réductions", "crédits d'impôt"]],
  ["S092", "Réduction d'impôt Pinel", "Ministère de l'Économie", "https://www.economie.gouv.fr/particuliers/gerer-mon-argent/beneficier-daides-et-de-reductions-dimpots/investissement-locatif-tout-savoir-sur-la-reduction-dimpot-pinel", "2026-03-11", ["Pinel", "location nue", "fin du dispositif", "engagement"]],
  ["S093", "Location non meublée et revenus fonciers", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F1991", "date de mise à jour non indiquée", ["location nue", "micro-foncier", "régime réel"]],
  ["S094", "Déficit foncier", "Ministère de l'Économie", "https://www.economie.gouv.fr/particuliers/gerer-mon-argent/investir-et-epargner/impot-sur-le-revenu-tout-savoir-sur-le-deficit-foncier", "date de mise à jour non indiquée", ["déficit foncier", "imputation", "intérêts d'emprunt"]],
  ["S095", "Location meublée : règles fiscales", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F32744", "date de mise à jour non indiquée", ["location meublée", "LMNP", "LMP", "BIC"]],
  ["S096", "Cotisations sociales du loueur en meublé", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F34102", "date de mise à jour non indiquée", ["location meublée", "cotisations sociales", "prélèvements sociaux"]],
  ["S097", "Plus-value immobilière", "impots.gouv.fr", "https://www.impots.gouv.fr/particulier/questions/je-vends-mon-bien-immobilier-vais-je-payer-de-la-plus-value-immobiliere", "2026-07-07", ["plus-value immobilière", "résidence principale", "durée de détention"]],
  ["S098", "Déclaration et fiscalité d'une SCI", "impots.gouv.fr", "https://www.impots.gouv.fr/professionnel/questions/comment-declarer-les-resultats-de-ma-sci", "date de mise à jour non indiquée", ["SCI", "impôt sur le revenu", "impôt sur les sociétés"]],
  ["S099", "Société civile immobilière", "impots.gouv.fr", "https://www.impots.gouv.fr/particulier/societe-civile-immobiliere", "date de mise à jour non indiquée", ["SCI", "revenus fonciers", "déficit foncier"]],
  ["S100", "Plus-values sur les biens meubles", "BOFiP-Impôts", "https://bofip.impots.gouv.fr/bofip/3788-PGP.html/identifiant=BOI-RPPM-PVBMC-10-20140121", "2014-01-21", ["biens meubles", "plus-value", "exonération"]],
  ["S101", "Revenus mobiliers et prélèvements sociaux en 2026", "impots.gouv.fr", "https://www.impots.gouv.fr/particulier/les-revenus-mobiliers", "date de mise à jour non indiquée", ["revenus mobiliers", "prélèvements sociaux", "PFU"]],
  ["S102", "Assurance-vie et PEA", "impots.gouv.fr", "https://www.impots.gouv.fr/particulier/lassurance-vie-et-le-pea-0", "date de mise à jour non indiquée", ["PEA", "retraits", "prélèvements sociaux", "plafonds"]],
  ["S103", "Fiscalité des PER", "BOFiP-Impôts", "https://bofip.impots.gouv.fr/bofip/14911-PGP.html/identifiant=BOI-ANNX-000513-20260810", "2026-08-10", ["PER", "fiscalité", "sortie en capital", "sortie en rente"]],
  ["S104", "Plan épargne logement", "Ministère de l'Économie", "https://www.economie.gouv.fr/particuliers/gerer-mon-argent/gerer-mon-budget-et-mon-epargne/plan-epargne-logement-pel-comment-ca-marche", "2026-01-09", ["PEL", "taux", "plafond", "versements"]],
  ["S105", "Compte épargne logement", "Service-Public.fr", "https://www.service-public.gouv.fr/particuliers/vosdroits/F16136", "2026-08-01", ["CEL", "taux", "plafond", "disponibilité"]],
  ["S106", "Calcul de l'IFI", "impots.gouv.fr", "https://www.impots.gouv.fr/particulier/calcul-de-lifi", "date de mise à jour non indiquée", ["IFI", "seuil", "barème", "décote"]],
  ["S107", "Passif déductible de l'IFI", "impots.gouv.fr", "https://www.impots.gouv.fr/particulier/questions/que-puis-je-deduire-au-niveau-du-passif-de-limpot-sur-la-fortune-immobiliere", "2026-04-01", ["IFI", "dettes", "résidence principale"]],
  ["S108", "Dons manuels et dons familiaux de sommes d'argent", "impots.gouv.fr", "https://www.impots.gouv.fr/particulier/don-manuel", "date de mise à jour non indiquée", ["don manuel", "don familial", "déclaration"]],
  ["S109", "Barème fiscal de l'usufruit et de la nue-propriété", "BOFiP-Impôts", "https://bofip.impots.gouv.fr/bofip/2323-PGP.html/identifiant=BOI-ENR-DMTG-10-40-10-50-20130527", "2013-05-27", ["usufruit", "nue-propriété", "barème fiscal"]],
  ["S110", "Règles successorales et réserve héréditaire", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F2529", "2026-06-16", ["succession", "conjoint survivant", "réserve héréditaire"]],
  ["S111", "Paiement des droits de succession", "impots.gouv.fr", "https://www.impots.gouv.fr/particulier/questions/comment-puis-je-payer-les-droits-de-succession", "date de mise à jour non indiquée", ["droits de succession", "paiement différé", "paiement fractionné"]],
  ["S112", "Contrat de mariage et régimes matrimoniaux", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F948", "2026-01-27", ["régimes matrimoniaux", "communauté", "séparation", "participation aux acquêts"]],
  ["S113", "Âge de départ et durée d'assurance retraite", "L'Assurance retraite", "https://www.lassuranceretraite.fr/portail-info/home/actif/age-depart/age-depart-retraite.html", "date de mise à jour non indiquée", ["retraite", "âge légal", "trimestres", "taux plein"]],
  ["S114", "Calcul de la retraite de base", "L'Assurance retraite", "https://www.lassuranceretraite.fr/portail-info/portail-info/home/actif/montant-retraite/montant-retraite.html", "date de mise à jour non indiquée", ["retraite de base", "revenu annuel moyen", "taux", "durée d'assurance"]],
  ["S115", "Droit à l'information retraite", "Info Retraite", "https://www.info-retraite.fr/portail-info/sites/PortailInformationnel/home/le-droit-a-linformation-retrai-1.html", "date de mise à jour non indiquée", ["RIS", "EIG", "entretien information retraite", "compte retraite"]],
  ["S116", "Réversion Agirc-Arrco", "Agirc-Arrco", "https://www.agirc-arrco.fr/categorie_expert/reversions/", "date de mise à jour non indiquée", ["Agirc-Arrco", "réversion", "points", "conditions"]],
  ["S117", "Pension de réversion de l'Assurance retraite", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F13104", "2025-01-01", ["réversion", "régime général", "ressources", "mariage"]],
  ["S118", "Demande de retraite", "Info Retraite", "https://www.info-retraite.fr/portail-info/sites/PortailInformationnel/home/mes-droits-a-la-retraite/age-et-montant-de-ma-retraite/depart-a-la-retraite/demande-de-retraite.html", "date de mise à jour non indiquée", ["liquidation", "demande de retraite", "date d'effet"]],
  ["S119", "Plus-values de cession de parts de SCI", "impots.gouv.fr", "https://www.impots.gouv.fr/particulier/questions/je-cede-les-parts-que-je-possede-dans-une-societe-civile-immobiliere-imposee", "2026-07-06", ["SCI", "plus-value", "parts sociales"]],
  ["S120", "Calcul et paiement des droits de donation", "impots.gouv.fr", "https://www.impots.gouv.fr/particulier/calcul-et-paiement-des-droits", "date de mise à jour non indiquée", ["donation", "abattements", "paiement des droits"]],
  ["S121", "Déclaration de revenus d'un couple marié ou pacsé", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F2705", "date de mise à jour non indiquée", ["foyer fiscal", "mariage", "Pacs", "imposition commune"]],
  ["S122", "Prélèvement à la source", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F34009", "2025-04-10", ["prélèvement à la source", "acomptes", "retenue"]],
  ["S123", "Effets patrimoniaux du Pacs", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F1026", "2024-06-21", ["Pacs", "séparation des patrimoines", "indivision"]],
  ["S124", "Retraite de base et complémentaire des professions libérales", "CNAVPL", "https://www.cnavpl.fr/les-regimes/regime-de-base/", "date de mise à jour non indiquée", ["professions libérales", "retraite de base", "sections professionnelles", "points"]],
  ["S125", "Retraite complémentaire des travailleurs indépendants", "L'Assurance retraite", "https://www.lassuranceretraite.fr/portail-info/hors-menu/annexe/travailleurs-independants/retraite-complementaire.html", "2026-11-02", ["artisans", "commerçants", "retraite complémentaire", "points"]],
  ["S126", "Droits du conjoint et du partenaire survivant sur le logement", "Service-Public.fr", "https://www.service-public.gouv.fr/particuliers/vosdroits/F1725", "2026-01-27", ["conjoint survivant", "partenaire de Pacs", "droit temporaire au logement", "droit viager au logement"]]
].map(([id, nom, organisme, url, date_document, sujets]) => ({
  id, nom, organisme, url, date_document, date_consultation: consulted, sujets
}));

const ids = new Set(additions.map((source) => source.id));
doc.sources = [...doc.sources.filter((source) => !ids.has(source.id)), ...additions]
  .sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`Catalogue mis à jour : ${doc.sources.length} sources.`);
