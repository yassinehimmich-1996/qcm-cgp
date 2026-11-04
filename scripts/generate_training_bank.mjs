#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seeds } from "../data/knowledge-seeds.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTION_DIR = path.join(ROOT, "questions");
const BASE_FILE = path.join(QUESTION_DIR, "lot-001.json");
const TARGET = 1000;
const YEAR = 2026;
const VERIFIED = "2026-11-04";
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
    statut: "a_valider",
    date_verification: VERIFIED
  };
}

if (seeds.length !== 190) {
  throw new Error(`190 faits sont requis pour produire 950 questions ; ${seeds.length} trouvés.`);
}

const base = JSON.parse(fs.readFileSync(BASE_FILE, "utf8"));
if (base.length !== 50) throw new Error("Le lot initial doit contenir 50 questions.");

const generated = [];
let number = 51;
for (let variant = 0; variant < templates.length; variant += 1) {
  for (const seed of seeds) {
    generated.push(questionFromSeed(seed, variant, number));
    number += 1;
  }
}

if (base.length + generated.length !== TARGET) {
  throw new Error(`Total inattendu : ${base.length + generated.length}`);
}

for (const file of fs.readdirSync(QUESTION_DIR)) {
  if (/^lot-(?!001)\d{3}\.json$/.test(file)) fs.unlinkSync(path.join(QUESTION_DIR, file));
}

for (let offset = 0; offset < generated.length; offset += 50) {
  const lotNumber = 2 + offset / 50;
  const file = path.join(QUESTION_DIR, `lot-${String(lotNumber).padStart(3, "0")}.json`);
  fs.writeFileSync(file, `${JSON.stringify(generated.slice(offset, offset + 50), null, 2)}\n`);
}

const all = [...base, ...generated];
console.log(`Banque générée : ${all.length} questions, ${seeds.length} faits, 20 lots.`);
