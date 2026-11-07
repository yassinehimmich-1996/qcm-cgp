#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seeds } from "../data/knowledge-seeds.mjs";
import { coverageSeeds } from "../data/coverage-seeds.mjs";
import { testLevelSeeds } from "../data/test-level-seeds.mjs";
import { captureGapSeeds } from "../data/capture-gap-seeds.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "fiches", "fiches.json");

const domainDescriptions = {
  "Assurance": "Comprendre la distribution des contrats, le devoir de conseil et les obligations du professionnel.",
  "Assurance emprunteur": "Maîtriser les garanties, la quotité, l’équivalence et les règles de changement d’assurance.",
  "Assurance-vie": "Relier le fonctionnement du contrat, les supports, les rachats, la fiscalité et la transmission.",
  "Banque quotidienne": "Sécuriser les connaissances relatives aux comptes, aux dépôts, à la fraude et aux clients fragiles.",
  "Conformité": "Savoir pourquoi une recommandation est adaptée, traçable, compréhensible et conforme aux intérêts du client.",
  "Crédit": "Distinguer les différents taux et comprendre ce qu’ils mesurent réellement.",
  "Crédit immobilier": "Revoir tout le cycle du financement, de l’instruction du dossier au remboursement anticipé.",
  "Crédit à la consommation": "Connaître l’information précontractuelle, la solvabilité, la rétractation et le crédit renouvelable.",
  "Droit civil": "Maîtriser la propriété, le démembrement, l’indivision et les effets patrimoniaux du Pacs.",
  "Enveloppes d'investissement": "Comparer PEA, compte-titres et contrat de capitalisation sans confondre leurs règles.",
  "Fiscalité": "Structurer les règles d’imposition des revenus, placements, plus-values et avantages fiscaux.",
  "Fiscalité immobilière": "Comprendre l’imposition de la détention, de la location et de la cession immobilières.",
  "Immobilier": "Revoir l’acquisition, les mandats, la copropriété, les SCI, la VEFA et la performance énergétique.",
  "Immobilier locatif": "Comparer location nue et meublée, régimes fiscaux, déficits, rendement et contraintes énergétiques.",
  "International": "Distinguer résidence fiscale, FATCA, CRS, auto-certification et obligations des non-résidents.",
  "LCB-FT": "Identifier les niveaux de vigilance, le bénéficiaire effectif et les règles entourant Tracfin.",
  "Placements financiers": "Relier rendement, risque, liquidité, horizon et fonctionnement des principaux instruments.",
  "Placements immobiliers": "Comprendre le fonctionnement et les risques propres aux SCPI.",
  "Prévoyance": "Distinguer incapacité, invalidité, décès, carence, franchise et exclusions contractuelles.",
  "RGPD": "Appliquer les principes de minimisation, conservation, sécurité, droits et prospection.",
  "Relation commerciale": "Conduire une découverte patrimoniale loyale, argumentée, actualisée et traçable.",
  "Retraite": "Relier régimes, âge, durée d’assurance, taux plein, réversion et épargne retraite.",
  "Régimes matrimoniaux": "Comprendre la composition des patrimoines et les conséquences de chaque régime.",
  "Réglementation": "Situer les rôles de l’ACPR, de l’IOBSP et du cadre européen du crédit immobilier.",
  "Transmission": "Maîtriser succession, donations, réserve, démembrement et droits du conjoint survivant.",
  "Économie et marchés": "Comprendre comment inflation, taux et cycle économique influencent les actifs financiers.",
  "Épargne bancaire": "Connaître les livrets, comptes à terme, PEL, CEL, intérêts et garanties des dépôts.",
  "Épargne salariale": "Comprendre le PEE, l’abondement et la disponibilité de l’épargne.",
};

const compact = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const normalize = (value) => compact(value).toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const unique = (values) => [...new Map(values.filter(Boolean).map((value) => [normalize(value), compact(value)])).values()];
const sentence = (value) => { const text = compact(value); return text && !/[.!?]$/.test(text) ? `${text}.` : text; };
const slug = (value) => normalize(value).replace(/\s+/g, "-");
const clarify = (topic, value) => {
  const text = sentence(value);
  return /^(il|elle|ils|elles|ce|cet|cette|ces|cela|celui|celle)\b/i.test(text)
    ? `${topic} : ${text.charAt(0).toLocaleLowerCase("fr")}${text.slice(1)}`
    : text;
};
const topicNames = (subdomain) => unique(compact(subdomain).split("/").map((part) => part.replace(/\s+—\s+distinctions$/i, "").trim()))
  .map((topic) => topic === "Option au barème" ? "Option pour le barème" : topic);

const editorialRecords = [];
for (const item of seeds) {
  editorialRecords.push({
    domaine: item[0], sousDomaine: item[1], question: `Concernant ${item[2]}, que faut-il retenir sur ${item[3]} ?`,
    reponse: item[4], point: item[4], sujet: compact(item[2]), pieges: item.slice(5, 8), sources: [item[8]],
  });
}
for (const item of coverageSeeds) {
  editorialRecords.push({
    domaine: item.domaine, sousDomaine: item.sousDomaine, question: item.enonce, reponse: item.correct,
    point: item.explication || item.correct, pieges: [...(item.traps || []), ...(item.wrong || [])], sources: [item.source],
  });
}
for (const item of [...testLevelSeeds, ...captureGapSeeds]) {
  const answers = (item.correct || []).map((index) => item.choix[index]);
  editorialRecords.push({
    domaine: item.domaine, sousDomaine: item.sousDomaine, question: item.enonce, reponse: answers.join(" "),
    point: item.explication || answers.join(" "), pieges: item.choix.filter((_, index) => !item.correct.includes(index)), sources: [item.source],
  });
}

const questionRecords = [];
for (const file of fs.readdirSync(path.join(root, "questions")).filter((name) => /^lot-\d+\.json$/.test(name)).sort()) {
  for (const item of JSON.parse(fs.readFileSync(path.join(root, "questions", file), "utf8"))) {
    questionRecords.push({
      domaine: item.domaine, sousDomaine: item.sous_domaine, question: item.enonce,
      reponse: item.bonnes_reponses.map((letter) => item.choix[letter]).join(" "), point: item.explication,
      pieges: Object.values(item.pieges || {}), sources: item.sources,
    });
  }
}

const domains = [...new Set(questionRecords.map((record) => record.domaine))].sort((a, b) => a.localeCompare(b, "fr"));
const sheets = domains.map((domain, domainIndex) => {
  const domainEditorial = editorialRecords.filter((record) => record.domaine === domain);
  const domainQuestions = questionRecords.filter((record) => record.domaine === domain);
  const topics = unique([...domainEditorial, ...domainQuestions].flatMap((record) => topicNames(record.sousDomaine)));
  const topicWeights = new Map(topics.map((topic) => [topic, domainQuestions.filter((record) => topicNames(record.sousDomaine).some((name) => normalize(name) === normalize(topic))).length]));

  const sections = topics.map((topic) => {
    const matches = (record) => topicNames(record.sousDomaine).some((name) => normalize(name) === normalize(topic));
    const editorial = domainEditorial.filter(matches);
    const questions = domainQuestions.filter(matches);
    const content = editorial.length ? editorial : questions;
    const points = unique(content.map((record) => clarify(record.sujet || topic, record.point))).slice(0, 8);
    const pieges = unique([...editorial, ...questions].flatMap((record) => record.pieges || []).map((value) => sentence(value))).slice(0, 6);
    const flash = [];
    const seen = new Set();
    for (const record of [...editorial, ...questions]) {
      const questionKey = normalize(record.question);
      if (!record.question || !record.reponse || seen.has(questionKey)) continue;
      seen.add(questionKey);
      flash.push({ question: compact(record.question), reponse: compact(record.reponse) });
      if (flash.length === 3) break;
    }
    return {
      id: `${slug(domain)}-${slug(topic)}`, titre: topic, poids: topicWeights.get(topic) || 0, points,
      reperes: points.slice(0, 2).map((definition, index) => ({ terme: index === 0 ? topic : "À distinguer", definition })),
      pieges, questions: flash, sources: unique([...editorial, ...questions].flatMap((record) => record.sources || [])),
    };
  }).sort((a, b) => b.poids - a.poids || a.titre.localeCompare(b.titre, "fr"));

  const questionCount = domainQuestions.length;
  const priority = questionCount >= 40 ? "Très prioritaire" : questionCount >= 15 ? "Prioritaire" : "À connaître";
  const resume = unique(sections.slice(0, 6).flatMap((section) => section.points.slice(0, 1))).slice(0, 6);
  return {
    id: `THEME-${String(domainIndex + 1).padStart(2, "0")}`, domaine: domain, titre: domain, priorite: priority,
    temps: `${Math.max(10, Math.ceil(sections.length * 2.5 / 5) * 5)} min`,
    accroche: domainDescriptions[domain] || `Maîtriser l’ensemble des notions du thème ${domain}.`,
    question_count: questionCount, resume, schema: sections.map((section) => section.titre),
    memo: `FIL CONDUCTEUR : ${sections.slice(0, 4).map((section) => section.titre).join(" → ")}`,
    sections, sources: unique(sections.flatMap((section) => section.sources)),
  };
});

fs.writeFileSync(outputPath, `${JSON.stringify(sheets, null, 2)}\n`);
console.log(`GÉNÉRATION RÉUSSIE — ${sheets.length} fiches thématiques, ${sheets.reduce((sum, sheet) => sum + sheet.sections.length, 0)} sous-notions`);
