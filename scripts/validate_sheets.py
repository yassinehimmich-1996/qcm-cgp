#!/usr/bin/env python3
"""Validation des 28 fiches thématiques et de toutes leurs sous-notions."""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHEETS_FILE = ROOT / "fiches" / "fiches.json"
SOURCES_FILE = ROOT / "sources" / "sources.json"
QUESTION_DIR = ROOT / "questions"
ID_RE = re.compile(r"^THEME-\d{2}$")


def load_json(path: Path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def normalize(value: str) -> str:
    value = value.casefold().replace("— distinctions", "")
    value = "".join(char for char in unicodedata.normalize("NFD", value) if unicodedata.category(char) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def topics(value: str) -> set[str]:
    result = {normalize(part) for part in value.split("/") if normalize(part)}
    if "option au bareme" in result:
        result.remove("option au bareme")
        result.add("option pour le bareme")
    return result


def validate() -> list[str]:
    errors: list[str] = []
    sheets = load_json(SHEETS_FILE)
    source_ids = {source["id"] for source in load_json(SOURCES_FILE)["sources"]}
    questions = [question for path in QUESTION_DIR.glob("lot-*.json") for question in load_json(path)]
    expected_domains = {question["domaine"] for question in questions}
    expected_topics: dict[str, set[str]] = {domain: set() for domain in expected_domains}
    for question in questions:
        expected_topics[question["domaine"]].update(topics(question["sous_domaine"]))

    if not isinstance(sheets, list) or len(sheets) != len(expected_domains):
        return [f"La bibliothèque doit contenir exactement {len(expected_domains)} fiches thématiques."]

    ids: set[str] = set()
    domains: set[str] = set()
    section_ids: set[str] = set()
    required = {"id", "domaine", "titre", "priorite", "temps", "accroche", "question_count", "resume", "schema", "memo", "sections", "sources"}
    section_required = {"id", "titre", "poids", "points", "reperes", "pieges", "questions", "sources"}

    for sheet in sheets:
        sheet_id = sheet.get("id", "sans identifiant")
        missing = required - sheet.keys()
        if missing:
            errors.append(f"{sheet_id}: champs manquants {sorted(missing)}")
            continue
        if not ID_RE.fullmatch(sheet_id) or sheet_id in ids:
            errors.append(f"{sheet_id}: identifiant invalide ou dupliqué")
        ids.add(sheet_id)
        domain = sheet["domaine"]
        if domain not in expected_domains or domain in domains:
            errors.append(f"{sheet_id}: thème inconnu ou dupliqué {domain!r}")
        domains.add(domain)
        if sheet["titre"] != domain:
            errors.append(f"{sheet_id}: le titre doit reprendre exactement le thème")
        if len(sheet["resume"]) < 1 or len(sheet["sections"]) < 1:
            errors.append(f"{sheet_id}: résumé ou sous-notions absents")
        if sheet["schema"] != [section.get("titre") for section in sheet["sections"]]:
            errors.append(f"{sheet_id}: le schéma doit reprendre l’ordre des sous-notions")

        actual_topics: set[str] = set()
        for section in sheet["sections"]:
            section_id = section.get("id", "sans identifiant")
            missing_section = section_required - section.keys()
            if missing_section:
                errors.append(f"{section_id}: champs manquants {sorted(missing_section)}")
                continue
            if section_id in section_ids:
                errors.append(f"{section_id}: sous-notion dupliquée")
            section_ids.add(section_id)
            actual_topics.add(normalize(section["titre"]))
            if not section["points"] or not section["questions"] or not section["sources"]:
                errors.append(f"{section_id}: contenu, question flash ou source absent")
            if len(section["pieges"]) < 2:
                errors.append(f"{section_id}: au moins deux pièges sont requis")
            for flash in section["questions"]:
                if set(flash) != {"question", "reponse"} or not all(flash.values()):
                    errors.append(f"{section_id}: question flash incomplète")
                if "…" in flash["question"] or "…" in flash["reponse"]:
                    errors.append(f"{section_id}: question flash tronquée")
            for source_id in section["sources"]:
                if source_id not in source_ids:
                    errors.append(f"{section_id}: source inconnue {source_id}")
        missing_topics = expected_topics[domain] - actual_topics
        if missing_topics:
            errors.append(f"{sheet_id}: sous-notions manquantes {sorted(missing_topics)}")
        for source_id in sheet["sources"]:
            if source_id not in source_ids:
                errors.append(f"{sheet_id}: source inconnue {source_id}")

    missing_domains = expected_domains - domains
    if missing_domains:
        errors.append(f"Thèmes sans fiche : {sorted(missing_domains)}")
    return errors


if __name__ == "__main__":
    problems = validate()
    if problems:
        print("VALIDATION FICHES ÉCHOUÉE")
        for problem in problems:
            print(f"- {problem}")
        sys.exit(1)
    sheets = load_json(SHEETS_FILE)
    section_count = sum(len(sheet["sections"]) for sheet in sheets)
    print(f"VALIDATION FICHES RÉUSSIE — {len(sheets)} thèmes, {section_count} sous-notions couvertes")
