#!/usr/bin/env python3
"""Validation sans dépendance externe de la banque QCM CGP France."""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUESTION_DIR = ROOT / "questions"
SOURCE_FILE = ROOT / "sources" / "sources.json"
ID_RE = re.compile(r"^CGP-\d{4}-\d{4}$")
SOURCE_RE = re.compile(r"^S\d{3}$")
SCENARIO_RE = re.compile(r"\b(un|une)\s+client(e)?\b|\bM(?:me|onsieur)?\.?\s", re.IGNORECASE)
CALCULATION_RE = re.compile(r"(?:\d\s*[×x*/+]\s*\d)|(?:combien\s+(?:vaut|représente|reste))", re.IGNORECASE)
ARTIFICIAL_RE = re.compile(r"^(analyse croisée|contrôle de précision|sélection raisonnée|rapprochement réglementaire|synthèse transversale)\b", re.IGNORECASE)
TARGET_QUESTIONS = 1_100
TARGET_LOT_SIZE = 50
ALLOWED_DIFFICULTIES = {"intermediaire", "avance", "expert"}
ALLOWED_TYPES = {"unique", "multiple", "vrai_faux"}
ALLOWED_STATUSES = {"verifie_sources_publiques", "a_actualiser", "retiree"}
ALLOWED_DOMAINS = {
    "Assurance", "Assurance emprunteur", "Assurance-vie", "Banque quotidienne",
    "Conformité", "Crédit", "Crédit immobilier", "Crédit à la consommation",
    "Droit civil", "Enveloppes d'investissement", "Fiscalité",
    "Fiscalité immobilière", "Immobilier", "Immobilier locatif", "International",
    "LCB-FT", "Placements financiers", "Placements immobiliers", "Prévoyance",
    "RGPD", "Relation commerciale", "Retraite", "Régimes matrimoniaux",
    "Réglementation", "Transmission", "Économie et marchés", "Épargne bancaire",
    "Épargne salariale",
}


def load_json(path: Path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def validate() -> list[str]:
    errors: list[str] = []
    sources_doc = load_json(SOURCE_FILE)
    sources = sources_doc.get("sources", [])
    source_ids = {source.get("id") for source in sources}

    if len(source_ids) != len(sources):
        fail(errors, "Les identifiants de sources ne sont pas uniques.")
    for source in sources:
        sid = source.get("id", "")
        if not SOURCE_RE.fullmatch(sid):
            fail(errors, f"Source invalide : {sid!r}")
        for field in ("nom", "organisme", "url", "date_document", "date_consultation", "sujets"):
            if not source.get(field):
                fail(errors, f"{sid}: champ source manquant : {field}")

    questions = []
    lot_paths = sorted(QUESTION_DIR.glob("lot-*.json"))
    for path in lot_paths:
        doc = load_json(path)
        if not isinstance(doc, list):
            fail(errors, f"{path.name}: la racine doit être une liste.")
            continue
        if len(doc) != TARGET_LOT_SIZE:
            fail(errors, f"{path.name}: le lot doit contenir {TARGET_LOT_SIZE} questions, {len(doc)} trouvées.")
        domain_count = len({question.get("domaine") for question in doc})
        if domain_count < 12:
            fail(errors, f"{path.name}: répartition insuffisante, seulement {domain_count} domaines.")
        questions.extend((path, question) for question in doc)

    ids = [question.get("id") for _, question in questions]
    for duplicate, count in Counter(ids).items():
        if count > 1:
            fail(errors, f"Identifiant dupliqué : {duplicate}")

    statements = [
        re.sub(r"\W+", " ", f"{question.get('enonce', '')} {' '.join(sorted(question.get('choix', {}).values()))}".casefold()).strip()
        for _, question in questions
    ]
    for duplicate, count in Counter(statements).items():
        if duplicate and count > 1:
            fail(errors, f"Question dupliquée ({count} occurrences) : {duplicate[:90]}")

    required = {
        "id", "domaine", "sous_domaine", "difficulte", "enonce", "choix",
        "type_question", "bonnes_reponses", "explication", "pieges", "sources", "origine",
        "statut", "date_verification"
    }
    for path, question in questions:
        qid = question.get("id", f"{path.name}:sans-id")
        missing = required - question.keys()
        if missing:
            fail(errors, f"{qid}: champs manquants : {sorted(missing)}")
            continue
        if not ID_RE.fullmatch(qid):
            fail(errors, f"{qid}: format d'identifiant invalide.")
        if question["domaine"] not in ALLOWED_DOMAINS:
            fail(errors, f"{qid}: thème inconnu ou non classifié : {question['domaine']!r}.")
        if not question["sous_domaine"].strip():
            fail(errors, f"{qid}: sous-thème manquant.")
        if question["difficulte"] not in ALLOWED_DIFFICULTIES:
            fail(errors, f"{qid}: difficulté invalide.")
        if question["type_question"] not in ALLOWED_TYPES:
            fail(errors, f"{qid}: type de question invalide.")
        if question["statut"] not in ALLOWED_STATUSES:
            fail(errors, f"{qid}: statut invalide.")
        elif question["statut"] != "verifie_sources_publiques":
            fail(errors, f"{qid}: une question publiée doit être vérifiée sur sources publiques.")
        if question["origine"] != "entrainement_original":
            fail(errors, f"{qid}: origine non autorisée.")
        choices = question["choix"]
        choice_keys = set(choices)
        if choice_keys not in ({"A", "B"}, {"A", "B", "C", "D"}):
            fail(errors, f"{qid}: les choix doivent être A-B pour un vrai/faux ou A-D pour un QCM.")
        correct = question["bonnes_reponses"]
        if not isinstance(correct, list) or not 1 <= len(correct) <= 3 or len(set(correct)) != len(correct):
            fail(errors, f"{qid}: une à trois réponses correctes distinctes sont requises.")
            continue
        if any(letter not in choices for letter in correct):
            fail(errors, f"{qid}: réponse correcte absente des choix.")
        if question["type_question"] == "vrai_faux":
            if choice_keys != {"A", "B"} or len(correct) != 1 or set(choices.values()) != {"Vrai", "Faux"}:
                fail(errors, f"{qid}: un vrai/faux exige exactement Vrai et Faux avec une seule bonne réponse.")
        else:
            expected_type = "unique" if len(correct) == 1 else "multiple"
            if question["type_question"] != expected_type:
                fail(errors, f"{qid}: type incohérent avec le nombre de réponses correctes.")
            if choice_keys != {"A", "B", "C", "D"}:
                fail(errors, f"{qid}: une question unique ou multiple exige quatre choix A à D.")
        if len(set(choices.values())) != len(choices):
            fail(errors, f"{qid}: propositions dupliquées.")
        wrong = {key for key in choices if key not in correct}
        if set(question["pieges"]) != wrong:
            fail(errors, f"{qid}: les pièges doivent documenter toutes les mauvaises réponses.")
        if not question["sources"]:
            fail(errors, f"{qid}: aucune source.")
        for sid in question["sources"]:
            if sid not in source_ids:
                fail(errors, f"{qid}: source inconnue {sid}.")
        try:
            checked = date.fromisoformat(question["date_verification"])
            if checked > date.today():
                fail(errors, f"{qid}: date de vérification future.")
        except ValueError:
            fail(errors, f"{qid}: date de vérification invalide.")
        if SCENARIO_RE.search(question["enonce"]):
            fail(errors, f"{qid}: formulation de cas client détectée.")
        if CALCULATION_RE.search(question["enonce"]):
            fail(errors, f"{qid}: calcul apparent détecté.")
        if ARTIFICIAL_RE.search(question["enonce"]):
            fail(errors, f"{qid}: libellé artificiel de génération détecté.")

    if not questions:
        fail(errors, "Aucune question trouvée.")
    elif len(questions) != TARGET_QUESTIONS:
        fail(errors, f"La banque doit contenir exactement {TARGET_QUESTIONS} questions, {len(questions)} trouvées.")
    type_counts = Counter(question.get("type_question") for _, question in questions)
    if type_counts["multiple"] < 300:
        fail(errors, f"La banque doit conserver au moins 300 questions à réponses multiples, {type_counts['multiple']} trouvées.")
    if type_counts["vrai_faux"] < 250:
        fail(errors, f"La banque doit conserver au moins 250 questions vrai/faux, {type_counts['vrai_faux']} trouvées.")
    advanced_count = sum(question.get("difficulte") in {"avance", "expert"} for _, question in questions)
    if advanced_count < 850:
        fail(errors, f"Au moins 850 questions doivent être avancées ou expertes, {advanced_count} trouvées.")
    expected_lots = TARGET_QUESTIONS // TARGET_LOT_SIZE
    if len(lot_paths) != expected_lots:
        fail(errors, f"La banque doit contenir {expected_lots} lots, {len(lot_paths)} trouvés.")
    return errors


if __name__ == "__main__":
    problems = validate()
    if problems:
        print("VALIDATION ÉCHOUÉE")
        for problem in problems:
            print(f"- {problem}")
        sys.exit(1)
    count = sum(len(load_json(path)) for path in QUESTION_DIR.glob("lot-*.json"))
    domain_count = len({question["domaine"] for path in QUESTION_DIR.glob("lot-*.json") for question in load_json(path)})
    print(f"VALIDATION RÉUSSIE — {count} questions classifiées dans {domain_count} thèmes")
