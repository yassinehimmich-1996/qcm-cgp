#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seeds } from "../data/knowledge-seeds.mjs";
import { coverageSeeds } from "../data/coverage-seeds.mjs";
import { testLevelSeeds } from "../data/test-level-seeds.mjs";
import { captureGapSeeds } from "../data/capture-gap-seeds.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTION_DIR = path.join(ROOT, "questions");
const TARGET = 1100;
const YEAR = 2026;
const VERIFIED = "2026-11-05";
const STATUS = "verifie_sources_publiques";
const LETTERS = ["A", "B", "C", "D"];
const DIFFICULTY = { debutant: 0, intermediaire: 1, avance: 2, expert: 3 };
const DOMAIN_FAMILIES = [
  ["Crédit", "Crédit immobilier", "Crédit à la consommation", "Assurance emprunteur"],
  ["Immobilier", "Immobilier locatif", "Fiscalité immobilière", "Placements immobiliers"],
  ["Assurance", "Assurance-vie", "Prévoyance"],
  ["Placements financiers", "Enveloppes d'investissement", "Épargne bancaire", "Épargne salariale", "Économie et marchés"],
  ["Transmission", "Droit civil", "Régimes matrimoniaux"],
  ["Conformité", "LCB-FT", "RGPD", "Réglementation", "Relation commerciale"],
  ["Fiscalité", "International"],
  ["Banque quotidienne"]
];

function stableHash(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rotate(values, offset) {
  const shift = ((offset % values.length) + values.length) % values.length;
  return [...values.slice(shift), ...values.slice(0, shift)];
}

function promoteDifficulty(value, extra = 0) {
  const rank = Math.min(3, Math.max(1, (DIFFICULTY[value] ?? 1) + extra));
  return ["debutant", "intermediaire", "avance", "expert"][rank];
}

function harderOf(...values) {
  return values.map((value) => promoteDifficulty(value)).sort((a, b) => DIFFICULTY[b] - DIFFICULTY[a])[0];
}

function factFromKnowledge(seed) {
  const [domaine, sousDomaine, topic, angle, correct, w1, w2, w3, source, difficulte] = seed;
  return { domaine, sousDomaine, topic, angle, correct, wrong: [w1, w2, w3], source, difficulte };
}

function factFromCoverage(seed) {
  return {
    domaine: seed.domaine,
    sousDomaine: seed.sousDomaine,
    topic: seed.sousDomaine,
    angle: seed.enonce.replace(/[?.!]$/, "").toLocaleLowerCase("fr"),
    correct: seed.correct,
    wrong: seed.wrong,
    traps: seed.traps,
    source: seed.source,
    difficulte: seed.difficulte,
    originalEnonce: seed.enonce,
    originalExplanation: seed.explication
  };
}

function buildQuestion({ domaine, sousDomaine, difficulte, enonce, values, correctValues, explication, sources, trapByValue = new Map(), typeQuestion = null }) {
  if (![2, 4].includes(values.length)) throw new Error(`Nombre de choix non pris en charge : ${values.length}`);
  const letters = LETTERS.slice(0, values.length);
  const choix = Object.fromEntries(letters.map((letter, index) => [letter, values[index]]));
  const bonnesReponses = letters.filter((letter) => correctValues.includes(choix[letter]));
  const pieges = {};
  for (const letter of letters) {
    if (!bonnesReponses.includes(letter)) {
      pieges[letter] = trapByValue.get(choix[letter]) || "Cette proposition altère une condition, une portée ou un effet juridique essentiel de la règle applicable.";
    }
  }
  return {
    domaine,
    sous_domaine: sousDomaine,
    difficulte: promoteDifficulty(difficulte),
    type_question: typeQuestion || (bonnesReponses.length === 1 ? "unique" : "multiple"),
    enonce,
    choix,
    bonnes_reponses: bonnesReponses,
    explication,
    pieges,
    sources: [...new Set(sources)],
    origine: "entrainement_original",
    statut: STATUS,
    date_verification: VERIFIED
  };
}

const OBVIOUS_WORDS = /\b(toujours|jamais|automatiquement|obligatoirement|aucun|toute?\s+circonstance|sans\s+condition|garanti[et]?|illimité[es]?|exclusivement)\b/i;

function preciseWrong(fact, offset = 0) {
  const ordered = fact.wrong
    .map((value, index) => ({ value, index, obvious: OBVIOUS_WORDS.test(value) ? 1 : 0 }))
    .sort((a, b) => a.obvious - b.obvious || a.index - b.index);
  return ordered[offset % ordered.length].value;
}

function directFactQuestion(fact, index, family) {
  const values = rotate([fact.correct, ...fact.wrong], index % 4);
  const trapByValue = new Map(fact.wrong.map((wrong, wrongIndex) => [
    wrong,
    fact.traps?.[wrongIndex] || `Cette réponse attribue à ${fact.topic} un effet ou une condition qui ne correspond pas à la règle exacte.`
  ]));
  const enonce = fact.originalEnonce || `Concernant ${fact.topic} et ${fact.angle}, quelle proposition restitue exactement la règle applicable ?`;
  return buildQuestion({
    domaine: fact.domaine,
    sousDomaine: fact.sousDomaine,
    difficulte: fact.difficulte,
    enonce: family === "knowledge" ? `${enonce.replace(/[?.!]$/, "")}?` : enonce,
    values,
    correctValues: [fact.correct],
    explication: fact.originalExplanation || `${fact.correct} La difficulté tient à la portée précise de la règle : les formulations absolues ou les confusions de régime doivent être écartées.`,
    sources: [fact.source],
    trapByValue
  });
}

function trueFalseQuestion(fact, index) {
  const isTrue = index % 2 === 0;
  const statement = isTrue ? fact.correct : preciseWrong(fact, index);
  const values = ["Vrai", "Faux"];
  return buildQuestion({
    domaine: fact.domaine,
    sousDomaine: fact.sousDomaine,
    difficulte: promoteDifficulty(fact.difficulte, 1),
    enonce: `Dans le thème « ${fact.sousDomaine} », l'affirmation suivante est-elle exacte ? « ${statement} »`,
    values,
    correctValues: [isTrue ? "Vrai" : "Faux"],
    explication: isTrue
      ? `L'affirmation est exacte. ${fact.correct}`
      : `L'affirmation est inexacte. La règle à retenir est la suivante : ${fact.correct}`,
    sources: [fact.source],
    typeQuestion: "vrai_faux"
  });
}

function multipleQuestion(first, second, index) {
  const raw = [
    { value: first.correct, correct: true },
    { value: second.correct, correct: true },
    { value: preciseWrong(first, index + 1), correct: false },
    { value: preciseWrong(second, index + 2), correct: false }
  ];
  const rotated = rotate(raw, index % 4);
  const themes = [...new Set([first.sousDomaine, second.sousDomaine])].map((value) => `« ${value} »`).join(" et ");
  return buildQuestion({
    domaine: first.domaine,
    sousDomaine: `${first.sousDomaine} / ${second.sousDomaine}`,
    difficulte: promoteDifficulty(harderOf(first.difficulte, second.difficulte), 1),
    enonce: `Parmi les affirmations suivantes portant sur ${themes}, lesquelles sont exactes ?`,
    values: rotated.map((item) => item.value),
    correctValues: rotated.filter((item) => item.correct).map((item) => item.value),
    explication: `Les deux règles à retenir sont : ${first.correct} ${second.correct}`,
    sources: [first.source, second.source]
  });
}

function incorrectStatementQuestion(first, partners, wrongOffset, index) {
  const incorrect = preciseWrong(first, wrongOffset);
  const raw = [
    { value: first.correct, incorrect: false },
    ...partners.map((partner) => ({ value: partner.correct, incorrect: false })),
    { value: incorrect, incorrect: true }
  ];
  const rotated = rotate(raw, index % 4);
  return buildQuestion({
    domaine: first.domaine,
    sousDomaine: first.sousDomaine,
    difficulte: promoteDifficulty(harderOf(first.difficulte, ...partners.map((partner) => partner.difficulte)), 1),
    enonce: `Parmi les affirmations suivantes portant sur « ${first.sousDomaine} », laquelle est inexacte ?`,
    values: rotated.map((item) => item.value),
    correctValues: [incorrect],
    explication: `L'affirmation à écarter est inexacte. La règle correcte est : ${first.correct} Les autres propositions décrivent des règles applicables au même domaine.`,
    sources: [first.source, ...partners.map((partner) => partner.source)]
  });
}

function testQuestion(seed, index) {
  const raw = seed.choix.map((value, choiceIndex) => ({ value, correct: seed.correct.includes(choiceIndex) }));
  const rotated = rotate(raw, index % 4);
  return buildQuestion({
    domaine: seed.domaine,
    sousDomaine: seed.sousDomaine,
    difficulte: seed.difficulte,
    enonce: seed.enonce,
    values: rotated.map((item) => item.value),
    correctValues: rotated.filter((item) => item.correct).map((item) => item.value),
    explication: seed.explication,
    sources: [seed.source]
  });
}

function relatedPartner(facts, fact, index, offset) {
  const family = DOMAIN_FAMILIES.find((values) => values.includes(fact.domaine)) || [fact.domaine];
  const sameSubdomain = facts.filter((candidate) => candidate.domaine === fact.domaine && candidate.sousDomaine === fact.sousDomaine && candidate !== fact);
  const sameDomain = facts.filter((candidate) => candidate.domaine === fact.domaine && candidate !== fact);
  const related = sameSubdomain.length
    ? sameSubdomain
    : sameDomain.length ? sameDomain
    : facts.filter((candidate) => family.includes(candidate.domaine) && candidate !== fact);
  if (!related.length) throw new Error(`Aucun fait connexe pour le domaine ${fact.domaine}.`);
  return related[(index + offset) % related.length];
}

function balanceByDomain(values, lotCount = 22, lotSize = 50) {
  const grouped = new Map();
  for (const question of values) {
    const group = grouped.get(question.domaine) || [];
    group.push(question);
    grouped.set(question.domaine, group);
  }
  const groups = [...grouped.entries()]
    .map(([domain, group]) => [domain, group.sort((a, b) => stableHash(a.enonce) - stableHash(b.enonce))])
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "fr"));
  const lots = Array.from({ length: lotCount }, () => []);
  const domainCounts = Array.from({ length: lotCount }, () => new Map());
  for (const [domain, group] of groups) {
    for (const question of group) {
      const start = stableHash(question.enonce) % lotCount;
      const candidates = lots.map((lot, index) => ({
        index,
        size: lot.length,
        domainCount: domainCounts[index].get(domain) || 0,
        distance: (index - start + lotCount) % lotCount
      })).filter((candidate) => candidate.size < lotSize)
        .sort((a, b) => a.domainCount - b.domainCount || a.size - b.size || a.distance - b.distance);
      if (!candidates.length) throw new Error("Capacité de répartition insuffisante.");
      const selected = candidates[0].index;
      lots[selected].push(question);
      domainCounts[selected].set(domain, (domainCounts[selected].get(domain) || 0) + 1);
    }
  }
  if (lots.some((lot) => lot.length !== lotSize)) throw new Error(`Répartition incomplète : ${lots.map((lot) => lot.length).join(", ")}`);
  return lots.flat();
}

if (seeds.length !== 190 || coverageSeeds.length !== 102) {
  throw new Error(`Corpus source inattendu : ${seeds.length} faits et ${coverageSeeds.length} compléments.`);
}

const knowledge = seeds.map(factFromKnowledge);
const coverage = coverageSeeds.map(factFromCoverage);
const corpus = [...knowledge, ...coverage];
const built = [];

built.push(...knowledge.map((fact, index) => directFactQuestion(fact, index, "knowledge")));
built.push(...coverage.map((fact, index) => directFactQuestion(fact, index, "coverage")));
const trueFalseSeen = new Set();
for (const [index, fact] of corpus.entries()) {
  let question;
  let fingerprint;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    question = trueFalseQuestion(fact, index + attempt);
    fingerprint = `${question.enonce}\u0000${Object.values(question.choix).join("\u0000")}`;
    if (!trueFalseSeen.has(fingerprint)) break;
  }
  if (trueFalseSeen.has(fingerprint)) throw new Error(`Impossible de créer un vrai/faux distinct pour ${fact.sousDomaine}.`);
  trueFalseSeen.add(fingerprint);
  built.push(question);
}
built.push(...corpus.map((fact, index) => multipleQuestion(fact, relatedPartner(corpus, fact, index, 7), index)));
built.push(...[...testLevelSeeds, ...captureGapSeeds].map(testQuestion));

const remaining = TARGET - built.length;
if (remaining < 0) throw new Error(`Le corpus dépasse la cible de ${-remaining} questions.`);
const subdomainGroups = corpus.reduce((groups, fact) => {
  const key = `${fact.domaine}\u0000${fact.sousDomaine}`;
  groups.set(key, [...(groups.get(key) || []), fact]);
  return groups;
}, new Map());
const reverseCandidates = [];
let reverseIndex = 0;
for (const group of subdomainGroups.values()) {
  if (group.length < 3) continue;
  for (const first of group) {
    const others = group.filter((candidate) => candidate !== first && candidate.correct !== first.correct);
    for (let left = 0; left < others.length; left += 1) {
      for (let right = left + 1; right < others.length; right += 1) {
        for (let wrongOffset = 0; wrongOffset < first.wrong.length; wrongOffset += 1) {
          const question = incorrectStatementQuestion(first, [others[left], others[right]], wrongOffset, reverseIndex);
          reverseIndex += 1;
          if (new Set(Object.values(question.choix)).size === 4) reverseCandidates.push(question);
        }
      }
    }
  }
}
const uniqueReverse = [...new Map(reverseCandidates.map((question) => [
  `${question.enonce}\u0000${Object.values(question.choix).sort().join("\u0000")}`,
  question
])).values()].sort((a, b) => stableHash(`${a.enonce}${Object.values(a.choix).join("")}`) - stableHash(`${b.enonce}${Object.values(b.choix).join("")}`));
if (uniqueReverse.length < remaining) throw new Error(`Seulement ${uniqueReverse.length} questions inversées cohérentes pour ${remaining} attendues.`);
built.push(...uniqueReverse.slice(0, remaining));

if (built.length !== TARGET) throw new Error(`Total inattendu : ${built.length}`);
const withIds = built.map((question, index) => ({ ...question, id: `CGP-${YEAR}-${String(index + 1).padStart(4, "0")}` }));
const balanced = balanceByDomain(withIds);

for (const file of fs.readdirSync(QUESTION_DIR)) {
  if (/^lot-\d{3}\.json$/.test(file)) fs.unlinkSync(path.join(QUESTION_DIR, file));
}
for (let offset = 0; offset < balanced.length; offset += 50) {
  const lotNumber = 1 + offset / 50;
  const file = path.join(QUESTION_DIR, `lot-${String(lotNumber).padStart(3, "0")}.json`);
  fs.writeFileSync(file, `${JSON.stringify(balanced.slice(offset, offset + 50), null, 2)}\n`);
}

const typeCounts = Object.groupBy
  ? Object.fromEntries(Object.entries(Object.groupBy(balanced, (question) => question.type_question)).map(([type, group]) => [type, group.length]))
  : balanced.reduce((counts, question) => ({ ...counts, [question.type_question]: (counts[question.type_question] || 0) + 1 }), {});
console.log(`Banque générée : ${balanced.length} questions (${Object.entries(typeCounts).map(([type, count]) => `${count} ${type}`).join(", ")}), 22 lots.`);
