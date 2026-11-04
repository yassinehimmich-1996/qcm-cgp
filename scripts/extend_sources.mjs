#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "sources", "sources.json");
const doc = JSON.parse(fs.readFileSync(file, "utf8"));
const consulted = "2026-11-04";
const updated = "date de mise à jour indiquée sur la page";

const additions = [
  ["S040", "Livret de développement durable et solidaire (LDDS)", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F2368", updated, ["LDDS", "plafond", "fiscalité"]],
  ["S041", "Livret d'épargne populaire (LEP)", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F2367", updated, ["LEP", "conditions de revenus", "fiscalité"]],
  ["S042", "Ce qu'il faut savoir sur les placements collectifs", "Autorité des marchés financiers", "https://www.amf-france.org/fr/espace-epargnants/comprendre-les-produits-financiers/placements-collectifs/ce-quil-faut-savoir-sur-les-placements-collectifs-fonds-et-sicav", updated, ["OPC", "Sicav", "FCP", "valeur liquidative"]],
  ["S043", "Règles en matière d'héritage : défunt ayant eu des enfants", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F2529", updated, ["succession", "réserve héréditaire", "quotité disponible"]],
  ["S044", "Indivision : gestion des biens indivis", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F1296", updated, ["indivision", "majorités", "gestion"]],
  ["S045", "Contrat de mariage : séparation de biens", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F948", updated, ["régime matrimonial", "séparation de biens"]],
  ["S046", "Changement ou modification de régime matrimonial", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F1535", updated, ["régime matrimonial", "changement", "notaire"]],
  ["S047", "Donation-partage", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F1266", updated, ["donation-partage", "transmission"]],
  ["S048", "Acceptation d'une succession à concurrence de l'actif net", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/R49718", updated, ["succession", "option successorale", "actif net"]],
  ["S049", "Assurance prévoyance", "ABE Infoservice", "https://www.abe-infoservice.fr/fr/assurance/assurance-prevoyance", updated, ["prévoyance", "incapacité", "invalidité", "décès"]],
  ["S050", "Comptes et livrets d'épargne : quelles différences ?", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F34393", updated, ["Livret jeune", "livrets", "plafonds"]],
  ["S051", "Plan épargne logement (PEL)", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F16140", updated, ["PEL", "épargne logement", "fiscalité"]],
  ["S052", "Comptes et livrets d'épargne : quelles différences ?", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F34393", updated, ["compte à terme", "livrets", "disponibilité"]],
  ["S053", "Questions fréquentes sur la garantie des dépôts et des titres", "Fonds de Garantie des Dépôts et de Résolution", "https://www.garantiedesdepots.fr/fr/questions-frequentes", updated, ["garantie des dépôts", "garantie des titres", "plafonds"]],
  ["S054", "Investir en actions cotées en bourse", "Autorité des marchés financiers", "https://www.amf-france.org/fr/espace-epargnants/comprendre-les-produits-financiers/actions-obligations/actions/investir-en-actions-cotees-en-bourse", updated, ["actions", "dividendes", "droits de l'actionnaire"]],
  ["S055", "Rendement et risque des placements en actions", "Autorité des marchés financiers", "https://www.amf-france.org/fr/espace-epargnants/savoir-bien-investir/cadrer-son-projet/rendement-et-risque-des-placements-en-actions-0", updated, ["risque", "rendement", "volatilité"]],
  ["S056", "Diversifier ses placements", "Autorité des marchés financiers", "https://www.amf-france.org/fr/espace-epargnants/savoir-bien-investir/conseils-pratiques/diversifier-ses-placements", updated, ["diversification", "corrélation", "risque"]],
  ["S057", "Compte-titres", "Autorité des marchés financiers", "https://www.amf-france.org/fr/espace-epargnants/comprendre-les-produits-financiers/supports-dinvestissement/compte-titres", updated, ["compte-titres", "instruments financiers"]],
  ["S058", "Produits des contrats de capitalisation et d'assurance-vie", "BOFiP-Impôts", "https://bofip.impots.gouv.fr/bofip/3951-PGP.html/identifiant=BOI-RPPM-RCM-20-10-20-50-20220630", "2022-06-30", ["contrat de capitalisation", "fiscalité"]],
  ["S059", "Plan d'épargne entreprise (PEE)", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F2142", updated, ["PEE", "épargne salariale", "abondement"]],
  ["S060", "Personnes imposables à l'impôt sur la fortune immobilière", "impots.gouv.fr", "https://www.impots.gouv.fr/particulier/personnes-imposables-lifi", updated, ["IFI", "patrimoine immobilier", "seuil"]],
  ["S061", "Revenus immobiliers des non-résidents", "impots.gouv.fr", "https://www.impots.gouv.fr/international-particulier/questions/je-suis-non-resident-je-percois-des-revenus-immobiliers-sagit-i", updated, ["revenus fonciers", "non-résidents", "location"]],
  ["S062", "Bail d'habitation : logement vide ou meublé", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F1165", updated, ["location vide", "bail", "durée"]],
  ["S063", "Bail d'habitation : logement vide ou meublé", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F1165", updated, ["location meublée", "bail", "durée"]],
  ["S064", "Investissement locatif : simulation et bonnes pratiques", "Agence nationale pour l'information sur le logement", "https://www.anil.org/outil-mise-en-location-simulation-investissement-immobilier-rendement/", updated, ["investissement locatif", "vacance", "rendement"]],
  ["S065", "Charges de copropriété", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F2590", "2026-02-18", ["copropriété", "charges", "répartition"]],
  ["S066", "Placements financiers : quelle information sur les frais ?", "Autorité des marchés financiers", "https://www.amf-france.org/fr/espace-epargnants/savoir-bien-investir/cadrer-son-projet/comparer-les-frais/placements-financiers-quelle-information-sur-les-frais", updated, ["frais", "information", "MIF 2"]],
  ["S067", "Orientations sur les exigences de gouvernance des produits au titre de MIF 2", "Autorité des marchés financiers", "https://www.amf-france.org/fr/reglementation/doctrine/doc-2018-04", updated, ["MIF 2", "marché cible", "gouvernance produit"]],
  ["S068", "Exigences d'adéquation issues de MIF 2", "Autorité des marchés financiers", "https://www.amf-france.org/fr/actualites-publications/actualites/exigences-dadequation-issues-de-la-directive-mif-2-lamf-applique-les-orientations-de-lesma", updated, ["MIF 2", "adéquation", "durabilité", "arbitrage"]],
  ["S069", "Formuler une réclamation", "Autorité de contrôle prudentiel et de résolution", "https://acpr.banque-france.fr/fr/particuliers/vos-moyens-daction/formuler-une-reclamation", updated, ["réclamation", "délais", "médiation"]],
  ["S070", "Lignes directrices relatives à l'identification et à la connaissance de la clientèle", "Autorité de contrôle prudentiel et de résolution", "https://acpr.banque-france.fr/fr/publications-et-statistiques/publications/lignes-directrices-relatives-lidentification-la-verification-de-lidentite-et-la-connaissance-de-la", "2026-09-24", ["LCB-FT", "identification", "bénéficiaire effectif", "vigilance"]],
  ["S071", "Règlement européen sur la protection des données", "CNIL", "https://www.cnil.fr/fr/reglement-europeen-protection-donnees", updated, ["RGPD", "droits", "minimisation", "sécurité"]],
  ["S072", "Durées de conservation des données du secteur de l'assurance", "CNIL", "https://www.cnil.fr/fr/les-durees-de-conservation-des-donnees-du-secteur-de-lassurance", updated, ["RGPD", "conservation", "prospects"]],
  ["S073", "Compte bancaire joint", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F10412", updated, ["compte joint", "cotitulaires", "incident de chèque"]],
  ["S074", "Compte bancaire individuel", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F2413", updated, ["mobilité bancaire", "clôture", "compte"]],
  ["S075", "Faire valoir son droit au compte bancaire", "Banque de France", "https://www.banque-france.fr/fr/a-votre-service/particuliers/faire-valoir-droit-au-compte-bancaire", updated, ["droit au compte", "services bancaires de base"]],
  ["S076", "Fraude à la carte bancaire", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F31324", updated, ["fraude", "carte bancaire", "opposition"]],
  ["S077", "Clôture d'un compte bancaire par la banque", "Service-Public.fr", "https://www.service-public.fr/particuliers/vosdroits/F31456", updated, ["clôture de compte", "préavis"]],
  ["S078", "Déposer un dossier de surendettement", "Banque de France", "https://www.banque-france.fr/fr/a-votre-service/particuliers/dossier-surendettement", updated, ["surendettement", "FICP", "procédure"]],
  ["S079", "Faire face à des difficultés financières ou à des dettes", "ABE Infoservice", "https://www.abe-infoservice.fr/fr/a-votre-service/particuliers/faire-face-difficultes-financieres-ou-dettes", updated, ["fragilité financière", "offre spécifique", "frais bancaires"]],
  ["S080", "Inflation et déflation", "Banque de France", "https://www.banque-france.fr/fr/publications-et-statistiques/publications/inflation-et-deflation", updated, ["inflation", "déflation", "pouvoir d'achat"]],
  ["S081", "Les taux directeurs", "Banque de France", "https://www.banque-france.fr/fr/publications-et-statistiques/publications/les-taux-directeurs", updated, ["taux directeurs", "politique monétaire", "crédit"]],
  ["S082", "Comprendre nos simulateurs de frais et d'épargne", "Autorité des marchés financiers", "https://www.amf-france.org/fr/espace-epargnants/lexique-simulateurs-et-outils-pratiques/nos-simulateurs", updated, ["capitalisation", "intérêts", "frais"]],
  ["S083", "Obligations de l'intermédiaire financier", "Autorité des marchés financiers", "https://www.amf-france.org/fr/espace-epargnants/savoir-bien-investir/etre-bien-conseille/les-obligations-de-votre-intermediaire-financier", updated, ["conflits d'intérêts", "déontologie", "conseil"]],
  ["S084", "Résident de France : domicile fiscal", "impots.gouv.fr", "https://www.impots.gouv.fr/resident-de-france", updated, ["résidence fiscale", "domicile fiscal", "conventions"]],
  ["S085", "Transferts d'informations en application de CRS/DAC2", "impots.gouv.fr", "https://www.impots.gouv.fr/transferts-dinformations-en-application-des-dispositifs-crsdac2", updated, ["CRS", "échange automatique", "résidence fiscale"]],
  ["S086", "Transferts d'informations en application de FATCA", "impots.gouv.fr", "https://www.impots.gouv.fr/transferts-dinformations-en-application-de-la-loi-fatca", updated, ["FATCA", "États-Unis", "déclaration"]]
].map(([id, nom, organisme, url, date_document, sujets]) => ({
  id, nom, organisme, url, date_document, date_consultation: consulted, sujets
}));

const keep = doc.sources.filter((source) => Number(source.id.slice(1)) < 40);
doc.sources = [...keep, ...additions];
fs.writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`Catalogue étendu : ${doc.sources.length} sources.`);
