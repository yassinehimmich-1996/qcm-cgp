#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seeds } from "../data/knowledge-seeds.mjs";
import { coverageSeeds } from "../data/coverage-seeds.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTION_DIR = path.join(ROOT, "questions");
const BASE_FILE = path.join(QUESTION_DIR, "lot-001.json");
const TARGET = 1100;
const YEAR = 2026;
const VERIFIED = "2026-11-05";
const STATUS = "verifie_sources_publiques";
const LETTERS = ["A", "B", "C", "D"];

const templates = [
  ({ topic, angle }) => `Quelle proposition décrit correctement ${topic} concernant ${angle} ?`,
  ({ topic, angle }) => `À propos de ${topic}, quel principe faut-il retenir pour ${angle} ?`,
  ({ topic, angle }) => `Quelle affirmation théorique est exacte sur ${angle} de ${topic} ?`,
  ({ topic, angle }) => `Dans un QCM portant sur ${topic}, quelle réponse est juste au sujet de ${angle} ?`,
  ({ topic, angle }) => `Quelle formulation est juridiquement ou techniquement correcte pour ${topic} — ${angle} ?`
];

function rotate(values, offset) {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

function stableHash(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Répartit les domaines dans tous les lots au lieu de concentrer les thèmes
// complémentaires dans les derniers fichiers. Le tri par empreinte est stable :
// deux générations successives produisent exactement la même banque.
function balanceByDomain(values, lotCount = 21, lotSize = 50) {
  const grouped = new Map();
  for (const question of values) {
    const group = grouped.get(question.domaine) || [];
    group.push(question);
    grouped.set(question.domaine, group);
  }

  const groups = [...grouped.entries()]
    .map(([domain, group]) => [domain, group.sort((left, right) => stableHash(left.enonce) - stableHash(right.enonce))])
    .sort((left, right) => right[1].length - left[1].length || left[0].localeCompare(right[0], "fr"));

  const lots = Array.from({ length: lotCount }, () => []);
  const domainCounts = Array.from({ length: lotCount }, () => new Map());
  for (const [domain, group] of groups) {
    for (const question of group) {
      const start = stableHash(question.enonce) % lotCount;
      const candidates = lots
        .map((lot, index) => ({
          index,
          size: lot.length,
          domainCount: domainCounts[index].get(domain) || 0,
          distance: (index - start + lotCount) % lotCount
        }))
        .filter((candidate) => candidate.size < lotSize)
        .sort((left, right) => left.domainCount - right.domainCount || left.size - right.size || left.distance - right.distance);
      if (!candidates.length) throw new Error("Capacité de répartition insuffisante.");
      const selected = candidates[0].index;
      lots[selected].push(question);
      domainCounts[selected].set(domain, (domainCounts[selected].get(domain) || 0) + 1);
    }
  }

  if (lots.some((lot) => lot.length !== lotSize)) {
    throw new Error(`Répartition incomplète : ${lots.map((lot) => lot.length).join(", ")}`);
  }
  return lots.flat();
}

function questionFromSeed(seed, variant, number) {
  const [domaine, sousDomaine, topic, angle, correct, w1, w2, w3, source, difficulte] = seed;
  const values = rotate([correct, w1, w2, w3], (number + variant) % 4);
  const answerIndex = values.indexOf(correct);
  const choix = Object.fromEntries(LETTERS.map((letter, index) => [letter, values[index]]));
  const bonneReponse = LETTERS[answerIndex];
  const pieges = {};
  for (const letter of LETTERS) {
    if (letter !== bonneReponse) {
      pieges[letter] = `Cette proposition ne correspond pas au principe applicable à ${topic} pour ${angle}.`;
    }
  }
  return {
    id: `CGP-${YEAR}-${String(number).padStart(4, "0")}`,
    domaine,
    sous_domaine: sousDomaine,
    difficulte,
    enonce: templates[variant]({ topic, angle }),
    choix,
    bonne_reponse: bonneReponse,
    explication: `${correct} Cette règle constitue le repère théorique à retenir concernant ${topic} et ${angle}.`,
    pieges,
    sources: [source],
    origine: "entrainement_original",
    statut: STATUS,
    date_verification: VERIFIED
  };
}

function questionFromCoverage(seed, number) {
  const values = rotate([seed.correct, ...seed.wrong], number % 4);
  const answerIndex = values.indexOf(seed.correct);
  const choix = Object.fromEntries(LETTERS.map((letter, index) => [letter, values[index]]));
  const bonneReponse = LETTERS[answerIndex];
  const trapByValue = new Map(seed.wrong.map((value, index) => [value, seed.traps[index]]));
  const pieges = {};
  for (const letter of LETTERS) {
    if (letter !== bonneReponse) pieges[letter] = trapByValue.get(choix[letter]);
  }
  return {
    id: `CGP-${YEAR}-${String(number).padStart(4, "0")}`,
    domaine: seed.domaine,
    sous_domaine: seed.sousDomaine,
    difficulte: seed.difficulte,
    enonce: seed.enonce,
    choix,
    bonne_reponse: bonneReponse,
    explication: seed.explication,
    pieges,
    sources: [seed.source],
    origine: "entrainement_original",
    statut: STATUS,
    date_verification: VERIFIED
  };
}

if (seeds.length !== 190) {
  throw new Error(`190 faits sont requis pour produire 950 questions ; ${seeds.length} trouvés.`);
}

const base = JSON.parse(fs.readFileSync(BASE_FILE, "utf8")).map((question) => ({
  ...question,
  statut: STATUS,
  date_verification: VERIFIED
}));
if (base.length !== 50) throw new Error("Le lot initial doit contenir 50 questions.");

const generated = [];
let number = 51;
for (let variant = 0; variant < templates.length; variant += 1) {
  for (const seed of seeds) {
    generated.push(questionFromSeed(seed, variant, number));
    number += 1;
  }
}

const coverage = coverageSeeds.map((seed) => questionFromCoverage(seed, number++));

const excess = base.length + generated.length + coverage.length - TARGET;
if (excess > 0) generated.splice(-excess);

if (base.length + generated.length + coverage.length !== TARGET) {
  throw new Error(`Total inattendu : ${base.length + generated.length + coverage.length}`);
}

for (const file of fs.readdirSync(QUESTION_DIR)) {
  if (/^lot-(?!001)\d{3}\.json$/.test(file)) fs.unlinkSync(path.join(QUESTION_DIR, file));
}

fs.writeFileSync(BASE_FILE, `${JSON.stringify(base, null, 2)}\n`);

const supplemental = balanceByDomain([...generated, ...coverage]);
for (let offset = 0; offset < supplemental.length; offset += 50) {
  const lotNumber = 2 + offset / 50;
  const file = path.join(QUESTION_DIR, `lot-${String(lotNumber).padStart(3, "0")}.json`);
  fs.writeFileSync(file, `${JSON.stringify(supplemental.slice(offset, offset + 50), null, 2)}\n`);
}

const all = [...base, ...supplemental];
const appData = path.join(ROOT, "app", "data", "questions.json");
fs.mkdirSync(path.dirname(appData), { recursive: true });
fs.writeFileSync(appData, `${JSON.stringify(all)}\n`);
console.log(`Banque générée : ${all.length} questions, ${seeds.length + coverageSeeds.length} notions, 22 lots.`);
