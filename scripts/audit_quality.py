#!/usr/bin/env python3
"""Rapport reproductible sur l'équilibre et la qualité formelle de la banque."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUESTION_DIR = ROOT / "questions"
ABSOLUTE_CUE = re.compile(
    r"\b(toujours|jamais|automatiquement|obligatoirement|aucun|sans condition|garanti(?:e)?|illimité(?:e)?)\b",
    re.IGNORECASE,
)


def load_questions():
    lots = []
    for path in sorted(QUESTION_DIR.glob("lot-*.json")):
        with path.open(encoding="utf-8") as handle:
            lots.append((path.name, json.load(handle)))
    return lots


def percentages(counter: Counter, total: int) -> str:
    return ", ".join(f"{key}={value} ({value / total:.1%})" for key, value in counter.items())


def main() -> None:
    lots = load_questions()
    questions = [question for _, lot in lots for question in lot]
    total = len(questions)
    types = Counter(question["type_question"] for question in questions)
    difficulties = Counter(question["difficulte"] for question in questions)
    multiple_answers = Counter(
        len(question["bonnes_reponses"])
        for question in questions
        if question["type_question"] == "multiple"
    )
    unique_positions = Counter(
        question["bonnes_reponses"][0]
        for question in questions
        if question["type_question"] == "unique"
    )
    true_false = Counter(
        question["choix"][question["bonnes_reponses"][0]]
        for question in questions
        if question["type_question"] == "vrai_faux"
    )
    stem_frequency = Counter(question["enonce"] for question in questions)
    wrong_options = [
        value
        for question in questions
        for letter, value in question["choix"].items()
        if letter not in question["bonnes_reponses"]
    ]

    print(f"TOTAL: {total} questions, {len(lots)} lots, {len({q['domaine'] for q in questions})} thèmes")
    print(f"TYPES: {percentages(types, total)}")
    print(f"DIFFICULTÉS: {percentages(difficulties, total)}")
    print(f"MULTIPLES: {dict(sorted(multiple_answers.items()))} bonnes réponses")
    print(f"POSITIONS UNIQUES: {dict(sorted(unique_positions.items()))}")
    print(f"VRAI/FAUX: {dict(sorted(true_false.items()))}")
    print(f"INDICES ABSOLUS DANS LES MAUVAISES RÉPONSES: {sum(bool(ABSOLUTE_CUE.search(value)) for value in wrong_options)}/{len(wrong_options)}")
    print(f"RÉPÉTITION MAXIMALE D'UN ÉNONCÉ: {stem_frequency.most_common(1)[0][1]}")
    print("LOTS:")
    for name, lot in lots:
        print(
            f"- {name}: {len({q['domaine'] for q in lot})} thèmes; "
            f"types={dict(Counter(q['type_question'] for q in lot))}; "
            f"difficultés={dict(Counter(q['difficulte'] for q in lot))}"
        )


if __name__ == "__main__":
    main()
