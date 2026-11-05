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
const TARGET = 800;
const TARGET_TYPES = { unique: 440, multiple: 256, vrai_faux: 104 };
const TARGET_THREE_ANSWER_MULTIPLE = 32;
const LOT_SIZE = 50;
const LOT_COUNT = TARGET / LOT_SIZE;
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
    .map((value, index) => ({
      value,
      index,
      obvious: OBVIOUS_WORDS.test(value) ? 1 : 0,
      proximity: lexicalProximity(fact.correct, value)
    }))
    .sort((a, b) => a.obvious - b.obvious || b.proximity - a.proximity || a.index - b.index);
  return ordered[offset % ordered.length].value;
}

function normalizedWords(value) {
  return new Set(value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("fr")
    .replace(/[^a-z0-9%]+/g, " ").split(/\s+/).filter((word) => word.length > 3));
}

function lexicalProximity(left, right) {
  const a = normalizedWords(left);
  const b = normalizedWords(right);
  const common = [...a].filter((word) => b.has(word)).length;
  return common / Math.max(1, new Set([...a, ...b]).size);
}

function contextualLabel(fact) {
  if (fact.originalEnonce) return fact.originalEnonce.replace(/[?.!]$/, "");
  return `${fact.topic} — ${fact.angle}`;
}

function contextualStatement(fact, value) {
  return `« ${contextualLabel(fact)} » : ${value}`;
}

function falseStatementQuality(fact, statement) {
  const proximity = lexicalProximity(fact.correct, statement);
  const correctHasNumber = /\d/.test(fact.correct);
  const statementHasNumber = /\d/.test(statement);
  const lengthRatio = Math.min(fact.correct.length, statement.length) / Math.max(fact.correct.length, statement.length);
  return proximity * 90
    + (correctHasNumber && statementHasNumber ? 45 : 0)
    + lengthRatio * 25
    - (OBVIOUS_WORDS.test(statement) ? 35 : 0)
    - (lengthRatio < 0.45 ? 30 : 0);
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

function trueFalseQuestion(fact, isTrue, index) {
  const statement = isTrue ? fact.correct : preciseWrong(fact, index);
  const values = ["Vrai", "Faux"];
  const question = buildQuestion({
    domaine: fact.domaine,
    sousDomaine: fact.sousDomaine,
    difficulte: promoteDifficulty(fact.difficulte, 1),
    enonce: `Vrai ou faux — ${contextualStatement(fact, statement)}`,
    values,
    correctValues: [isTrue ? "Vrai" : "Faux"],
    explication: isTrue
      ? `L'affirmation est exacte. ${fact.correct}`
      : `L'affirmation est inexacte. La règle à retenir est la suivante : ${fact.correct}`,
    sources: [fact.source],
    typeQuestion: "vrai_faux"
  });
  return isTrue ? question : { ...question, _selectionScore: falseStatementQuality(fact, statement) };
}

function multipleQuestion(first, second, index, third = null) {
  const facts = third ? [first, second, third] : [first, second];
  const raw = facts.map((fact) => ({ value: contextualStatement(fact, fact.correct), correct: true, fact }));
  raw.push({ value: contextualStatement(first, preciseWrong(first, index + 1)), correct: false, fact: first });
  if (!third) raw.push({ value: contextualStatement(second, preciseWrong(second, index + 2)), correct: false, fact: second });
  const rotated = rotate(raw, index % 4);
  const themes = [...new Set(facts.map((fact) => fact.sousDomaine))].map((value) => `« ${value} »`).join(", ").replace(/, ([^,]*)$/, " et $1");
  return buildQuestion({
    domaine: first.domaine,
    sousDomaine: facts.map((fact) => fact.sousDomaine).join(" / "),
    difficulte: promoteDifficulty(harderOf(...facts.map((fact) => fact.difficulte)), 1),
    enonce: `Parmi les affirmations suivantes portant sur ${themes}, lesquelles sont exactes ?`,
    values: rotated.map((item) => item.value),
    correctValues: rotated.filter((item) => item.correct).map((item) => item.value),
    explication: `Les règles à retenir sont : ${facts.map((fact) => contextualStatement(fact, fact.correct)).join(" ")}`,
    sources: facts.map((fact) => fact.source),
    trapByValue: new Map(rotated.filter((item) => !item.correct).map((item) => [
      item.value,
      `Cette association est inexacte. Pour « ${contextualLabel(item.fact)} », la règle exacte est : ${item.fact.correct}`
    ]))
  });
}

function associationQuestion(first, partners, wrongOffset, index) {
  const incorrect = contextualStatement(first, preciseWrong(first, wrongOffset));
  const raw = [
    { value: incorrect, incorrect: true, fact: first },
    ...partners.map((partner) => ({ value: contextualStatement(partner, partner.correct), incorrect: false, fact: partner }))
  ];
  const rotated = rotate(raw, index % 4);
  const trapByValue = new Map(rotated.filter((item) => !item.incorrect).map((item) => [
    item.value,
    `Cette association est exacte : ${item.fact.correct}`
  ]));
  const stems = [
    "Une seule des associations suivantes comporte une règle inexacte. Laquelle ?",
    "Quelle association ne restitue pas exactement la règle applicable ?",
    "Parmi les associations suivantes, laquelle est incorrecte ?",
    "Quel rapprochement entre une notion et sa règle est erroné ?",
    "Quel énoncé associe incorrectement la notion et la règle ?",
    "Une association est juridiquement ou techniquement inexacte. Laquelle ?"
  ];
  return buildQuestion({
    domaine: first.domaine,
    sousDomaine: `${first.sousDomaine} — distinctions`,
    difficulte: promoteDifficulty(harderOf(first.difficulte, ...partners.map((partner) => partner.difficulte)), 1),
    enonce: stems[index % stems.length],
    values: rotated.map((item) => item.value),
    correctValues: [incorrect],
    explication: `L'association à écarter est inexacte. Pour « ${contextualLabel(first)} », la règle correcte est : ${first.correct}`,
    sources: [first.source, ...partners.map((partner) => partner.source)],
    trapByValue
  });
}

function testQuestion(seed, index) {
  const raw = seed.choix.map((value, choiceIndex) => ({ value, correct: seed.correct.includes(choiceIndex) }));
  const rotated = rotate(raw, index % 4);
  const trapByValue = new Map(rotated.filter((item) => !item.correct).map((item) => [
    item.value,
    `Cette proposition est incompatible avec la règle expliquée dans le corrigé : ${seed.explication}`
  ]));
  return buildQuestion({
    domaine: seed.domaine,
    sousDomaine: seed.sousDomaine,
    difficulte: seed.difficulte,
    enonce: seed.enonce,
    values: rotated.map((item) => item.value),
    correctValues: rotated.filter((item) => item.correct).map((item) => item.value),
    explication: seed.explication,
    sources: [seed.source],
    trapByValue
  });
}

function relatedPartner(facts, fact, index, offset, excluded = []) {
  const family = DOMAIN_FAMILIES.find((values) => values.includes(fact.domaine)) || [fact.domaine];
  const eligible = (candidate) => candidate !== fact && !excluded.includes(candidate);
  const sameSubdomain = facts.filter((candidate) => candidate.domaine === fact.domaine && candidate.sousDomaine === fact.sousDomaine && eligible(candidate));
  const sameDomain = facts.filter((candidate) => candidate.domaine === fact.domaine && eligible(candidate));
  const related = sameSubdomain.length
    ? sameSubdomain
    : sameDomain.length ? sameDomain
    : facts.filter((candidate) => family.includes(candidate.domaine) && eligible(candidate));
  if (!related.length) throw new Error(`Aucun fait connexe pour le domaine ${fact.domaine}.`);
  return related[(index + offset) % related.length];
}

function balanceByDomain(values, lotCount = LOT_COUNT, lotSize = LOT_SIZE) {
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
  const typeCounts = Array.from({ length: lotCount }, () => new Map());
  const difficultyCounts = Array.from({ length: lotCount }, () => new Map());
  for (const [domain, group] of groups) {
    for (const question of group) {
      const start = stableHash(question.enonce) % lotCount;
      const candidates = lots.map((lot, index) => ({
        index,
        size: lot.length,
        domainCount: domainCounts[index].get(domain) || 0,
        typeCount: typeCounts[index].get(question.type_question) || 0,
        difficultyCount: difficultyCounts[index].get(question.difficulte) || 0,
        distance: (index - start + lotCount) % lotCount
      })).filter((candidate) => candidate.size < lotSize)
        .sort((a, b) => a.domainCount - b.domainCount || a.typeCount - b.typeCount || a.difficultyCount - b.difficultyCount || a.size - b.size || a.distance - b.distance);
      if (!candidates.length) throw new Error("Capacité de répartition insuffisante.");
      const selected = candidates[0].index;
      lots[selected].push(question);
      domainCounts[selected].set(domain, (domainCounts[selected].get(domain) || 0) + 1);
      typeCounts[selected].set(question.type_question, (typeCounts[selected].get(question.type_question) || 0) + 1);
      difficultyCounts[selected].set(question.difficulte, (difficultyCounts[selected].get(question.difficulte) || 0) + 1);
    }
  }
  if (lots.some((lot) => lot.length !== lotSize)) throw new Error(`Répartition incomplète : ${lots.map((lot) => lot.length).join(", ")}`);
  return lots.flat();
}

function candidateScore(question) {
  const difficulty = DIFFICULTY[question.difficulte] ?? 0;
  const obvious = Object.values(question.choix).filter((value) => OBVIOUS_WORDS.test(value)).length;
  const editorial = question._selectionScore ?? 0;
  return difficulty * 100 + editorial * 3 - obvious * 15 + (stableHash(question.enonce + Object.values(question.choix).join("")) % 100) / 100;
}

function selectProportionally(candidates, target, referenceQuestions) {
  const reference = referenceQuestions.reduce((counts, question) => {
    counts.set(question.domaine, (counts.get(question.domaine) || 0) + 1);
    return counts;
  }, new Map());
  const groups = new Map();
  for (const candidate of candidates) {
    const group = groups.get(candidate.domaine) || [];
    group.push(candidate);
    groups.set(candidate.domaine, group);
  }
  for (const group of groups.values()) group.sort((a, b) => candidateScore(b) - candidateScore(a));
  const totalReference = [...reference.values()].reduce((sum, value) => sum + value, 0);
  const allocations = [...groups.keys()].map((domain) => {
    const exact = target * (reference.get(domain) || 1) / totalReference;
    return { domain, count: Math.min(groups.get(domain).length, Math.floor(exact)), remainder: exact - Math.floor(exact) };
  });
  let allocated = allocations.reduce((sum, item) => sum + item.count, 0);
  while (allocated < target) {
    const eligible = allocations.filter((item) => item.count < groups.get(item.domain).length)
      .sort((a, b) => b.remainder - a.remainder || (reference.get(b.domain) || 0) - (reference.get(a.domain) || 0));
    if (!eligible.length) throw new Error(`Sélection proportionnelle impossible : ${allocated}/${target}.`);
    eligible[0].count += 1;
    eligible[0].remainder = 0;
    allocated += 1;
  }
  return allocations.flatMap((item) => groups.get(item.domain).slice(0, item.count));
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
const handcrafted = [...testLevelSeeds, ...captureGapSeeds].map(testQuestion);
built.push(...handcrafted);

const baseReference = [...built];
const requiredUnique = TARGET_TYPES.unique - built.filter((question) => question.type_question === "unique").length;
const requiredMultiple = TARGET_TYPES.multiple - built.filter((question) => question.type_question === "multiple").length;
const requiredTrueFalse = TARGET_TYPES.vrai_faux;

const associationCandidates = corpus.map((fact, index) => {
  const partners = [
    relatedPartner(corpus, fact, index, 5),
    relatedPartner(corpus, fact, index, 11),
    relatedPartner(corpus, fact, index, 17)
  ].filter((candidate, position, values) => candidate !== fact && values.indexOf(candidate) === position);
  const fallback = corpus.filter((candidate) => candidate.domaine === fact.domaine && candidate !== fact && !partners.includes(candidate));
  while (partners.length < 3 && fallback.length) partners.push(fallback.shift());
  if (partners.length < 3) return null;
  return associationQuestion(fact, partners, 0, index);
}).filter(Boolean);
built.push(...selectProportionally(associationCandidates, requiredUnique, baseReference));

const twoAnswerMultipleCandidates = corpus.map((fact, index) => multipleQuestion(
  fact,
  relatedPartner(corpus, fact, index, 7),
  index
));
const threeAnswerMultipleCandidates = corpus.map((fact, index) => {
  const second = relatedPartner(corpus, fact, index, 7);
  const third = relatedPartner(corpus, fact, index, 13, [second]);
  return multipleQuestion(fact, second, index, third);
});
const handcraftedThreeAnswer = handcrafted.filter((question) => question.type_question === "multiple" && question.bonnes_reponses.length === 3).length;
const requiredThreeAnswer = Math.max(0, TARGET_THREE_ANSWER_MULTIPLE - handcraftedThreeAnswer);
if (requiredThreeAnswer > requiredMultiple) throw new Error("Quota de questions à trois réponses incohérent.");
built.push(...selectProportionally(threeAnswerMultipleCandidates, requiredThreeAnswer, baseReference));
built.push(...selectProportionally(twoAnswerMultipleCandidates, requiredMultiple - requiredThreeAnswer, baseReference));

const halfTrueFalse = requiredTrueFalse / 2;
if (!Number.isInteger(halfTrueFalse)) throw new Error("Le quota vrai/faux doit être pair.");
const trueCandidates = corpus.map((fact, index) => trueFalseQuestion(fact, true, index));
const falseCandidates = corpus.map((fact, index) => trueFalseQuestion(fact, false, index));
built.push(...selectProportionally(trueCandidates, halfTrueFalse, baseReference));
built.push(...selectProportionally(falseCandidates, halfTrueFalse, baseReference));

if (built.length !== TARGET) throw new Error(`Total inattendu : ${built.length}`);
const withIds = built.map((question, index) => {
  const { _selectionScore, ...cleanQuestion } = question;
  return { ...cleanQuestion, id: `CGP-${YEAR}-${String(index + 1).padStart(4, "0")}` };
});
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
for (const [type, expected] of Object.entries(TARGET_TYPES)) {
  if (typeCounts[type] !== expected) throw new Error(`Quota ${type} inattendu : ${typeCounts[type]}/${expected}.`);
}
const threeAnswerCount = balanced.filter((question) => question.type_question === "multiple" && question.bonnes_reponses.length === 3).length;
if (threeAnswerCount !== TARGET_THREE_ANSWER_MULTIPLE) throw new Error(`Quota multiple à trois réponses inattendu : ${threeAnswerCount}/${TARGET_THREE_ANSWER_MULTIPLE}.`);
console.log(`Banque générée : ${balanced.length} questions (${Object.entries(typeCounts).map(([type, count]) => `${count} ${type}`).join(", ")}), ${LOT_COUNT} lots.`);
