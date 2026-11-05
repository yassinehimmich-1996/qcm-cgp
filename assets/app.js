const DATA_VERSION = 1;
const STORAGE_KEY = "qcm-cgp-progress-v1";
const EXAM_SECONDS = 60 * 60;
const letters = ["A", "B", "C", "D"];
const EXAM_BLUEPRINT = [
  { count: 12, domains: ["Fiscalité"] },
  { count: 10, domains: ["Immobilier", "Immobilier locatif", "Fiscalité immobilière", "Placements immobiliers"] },
  { count: 12, domains: ["Placements financiers", "Épargne bancaire", "Économie et marchés"] },
  { count: 16, domains: ["Assurance-vie", "Enveloppes d'investissement", "Épargne salariale"] },
  { count: 14, domains: ["Transmission", "Droit civil", "Régimes matrimoniaux"] },
  { count: 10, domains: ["Retraite"] },
  { count: 8, domains: ["Conformité", "LCB-FT", "RGPD", "Relation commerciale", "Réglementation"] },
  { count: 8, domains: ["Crédit immobilier", "Crédit à la consommation", "Crédit", "Assurance emprunteur"] },
  { count: 5, domains: ["Prévoyance", "Assurance"] },
  { count: 5, domains: ["Banque quotidienne", "International"] }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const screens = {
  home: $("#homeScreen"),
  quiz: $("#quizScreen"),
  results: $("#resultsScreen"),
  stats: $("#statsScreen")
};

let questions = [];
let sources = new Map();
let timerId = null;
let confirmCallback = null;

const emptyProgress = () => ({
  version: DATA_VERSION,
  answers: {},
  errors: [],
  bookmarks: [],
  sessions: [],
  streak: 0,
  bestStreak: 0
});

let progress = loadProgress();
let session = null;

function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return parsed?.version === DATA_VERSION ? { ...emptyProgress(), ...parsed } : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sample(values, count, preferUnseen = true) {
  if (!preferUnseen) return shuffle(values).slice(0, count);
  const unseen = shuffle(values.filter((question) => !progress.answers[question.id]));
  const seen = shuffle(values.filter((question) => progress.answers[question.id]));
  return [...unseen, ...seen].slice(0, count);
}

function sampleBalancedExam(values) {
  const selected = [];
  const selectedIds = new Set();
  for (const block of EXAM_BLUEPRINT) {
    const pool = values.filter((question) => block.domains.includes(question.domaine) && !selectedIds.has(question.id));
    for (const question of sample(pool, block.count, false)) {
      selected.push(question);
      selectedIds.add(question.id);
    }
  }

  if (selected.length < 100) {
    const remainder = values.filter((question) => !selectedIds.has(question.id));
    selected.push(...sample(remainder, 100 - selected.length, false));
  }
  return shuffle(selected);
}

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function difficultyLabel(value) {
  return { debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé", expert: "Expert" }[value] || value;
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => element.classList.toggle("hidden", key !== name));
  const inQuiz = name === "quiz";
  $("#bottomNav").classList.toggle("hidden", inQuiz);
  $("#backButton").classList.toggle("hidden", !inQuiz);
  $$("#bottomNav [data-screen]").forEach((item) => item.classList.toggle("active", item.dataset.screen === name));
  window.scrollTo({ top: 0, behavior: "instant" });
}

function updateDashboard() {
  const errorCount = progress.errors.length;
  $("#reviewErrorCount").textContent = errorCount
    ? `${errorCount} question${errorCount > 1 ? "s" : ""} à revoir`
    : "Aucune erreur enregistrée";
}

function openReview() {
  updateDashboard();
  $("#reviewDialog").showModal();
}

function openThemes() {
  renderThemeList();
  $("#themeDialog").showModal();
  setTimeout(() => $("#themeSearch").focus(), 120);
}

function renderThemeList(filter = "") {
  const normalized = filter.trim().toLocaleLowerCase("fr");
  const domains = [...new Set(questions.map((q) => q.domaine))]
    .filter((domain) => domain.toLocaleLowerCase("fr").includes(normalized))
    .sort((a, b) => a.localeCompare(b, "fr"));
  $("#themeList").innerHTML = domains.map((domain) => {
    const all = questions.filter((q) => q.domaine === domain);
    const seen = all.filter((q) => progress.answers[q.id]).length;
    return `<button class="theme-option" type="button" data-domain="${escapeHtml(domain)}">
      <span><strong>${escapeHtml(domain)}</strong><small>${all.length} questions · ${seen} déjà vues</small></span><span>→</span>
    </button>`;
  }).join("") || `<p>Aucun thème trouvé.</p>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

function startSession(mode, options = {}) {
  let pool = questions;
  let count = questions.length;
  let label = "Toutes les questions";
  let feedback = true;

  if (mode === "all") {
    count = pool.length;
  } else if (mode === "exam") {
    count = 100;
    label = "Examen blanc";
    feedback = false;
  } else if (mode === "theme") {
    pool = questions.filter((q) => q.domaine === options.domain);
    count = Math.min(20, pool.length);
    label = options.domain;
  } else if (mode === "errors") {
    pool = questions.filter((q) => progress.errors.includes(q.id));
    count = Math.min(20, pool.length);
    label = "Mes erreurs";
  } else if (mode === "custom") {
    pool = options.questions || [];
    count = pool.length;
    label = options.label || "Révision";
  }

  if (!pool.length) {
    showToast(mode === "errors" ? "Aucune erreur à revoir pour le moment." : "Aucune question enregistrée dans cette sélection.");
    return;
  }

  session = {
    mode,
    label,
    feedback,
    questions: mode === "custom"
      ? [...pool]
      : mode === "exam"
        ? sampleBalancedExam(pool)
        : sample(pool, count, true),
    index: 0,
    responses: [],
    selected: null,
    validated: false,
    startedAt: Date.now(),
    questionStartedAt: Date.now(),
    remaining: mode === "exam" ? EXAM_SECONDS : null
  };

  $("#quizModeLabel").textContent = label;
  showScreen("quiz");
  renderQuestion();
  startTimer();
}

function currentQuestion() {
  return session?.questions[session.index];
}

function renderQuestion() {
  const question = currentQuestion();
  if (!question) return finishSession();
  session.selected = null;
  session.validated = false;
  session.questionStartedAt = Date.now();

  $("#questionIndex").textContent = `Question ${session.index + 1}`;
  $("#questionTotal").textContent = `sur ${session.questions.length}`;
  $("#quizProgress").style.width = `${(session.index / session.questions.length) * 100}%`;
  $("#questionDomain").textContent = question.domaine;
  $("#questionDifficulty").textContent = difficultyLabel(question.difficulte);
  $("#questionText").textContent = question.enonce;
  $("#feedback").classList.add("hidden");
  $("#feedback").classList.remove("incorrect");
  $("#validateButton").classList.remove("hidden");
  $("#validateButton").disabled = true;
  $("#nextButton").classList.add("hidden");
  $("#skipButton").classList.remove("hidden");
  $("#answers").innerHTML = letters.map((letter) => `<button class="answer" type="button" data-answer="${letter}">
    <span class="letter">${letter}</span><span class="answer-copy">${escapeHtml(question.choix[letter])}</span><span class="answer-state" aria-hidden="true"></span>
  </button>`).join("");
  $("#questionCard").scrollIntoView({ behavior: "instant", block: "start" });
}

function selectAnswer(letter) {
  if (!session || session.validated) return;
  session.selected = letter;
  $$(".answer").forEach((answer) => answer.classList.toggle("selected", answer.dataset.answer === letter));
  $("#validateButton").disabled = false;
}

function validateAnswer() {
  if (!session?.selected || session.validated) return;
  const question = currentQuestion();
  const correct = session.selected === question.bonne_reponse;
  const elapsed = Math.max(1, Math.round((Date.now() - session.questionStartedAt) / 1000));
  session.validated = true;
  session.responses.push({ id: question.id, selected: session.selected, correct, seconds: elapsed });
  recordAnswer(question, correct);

  if (!session.feedback) {
    goNext();
    return;
  }

  $$(".answer").forEach((answer) => {
    answer.disabled = true;
    const letter = answer.dataset.answer;
    if (letter === question.bonne_reponse) {
      answer.classList.add("correct");
      answer.querySelector(".answer-state").textContent = "✓";
    } else if (letter === session.selected) {
      answer.classList.add("wrong");
      answer.querySelector(".answer-state").textContent = "×";
    }
  });
  renderFeedback(question, correct);
  $("#validateButton").classList.add("hidden");
  $("#skipButton").classList.add("hidden");
  $("#nextButton").classList.remove("hidden");
  $("#nextButton").textContent = session.index === session.questions.length - 1 ? "Voir mon résultat →" : "Question suivante →";
  $("#feedback").focus({ preventScroll: true });
  $("#feedback").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderFeedback(question, correct) {
  const feedback = $("#feedback");
  feedback.classList.remove("hidden");
  feedback.classList.toggle("incorrect", !correct);
  $("#feedbackHeading").textContent = correct ? "Bonne réponse" : `Réponse correcte : ${question.bonne_reponse}`;
  $("#feedbackText").textContent = question.explication;
  const wrongTraps = Object.entries(question.pieges)
    .map(([letter, text]) => `<p><strong>${letter}.</strong> ${escapeHtml(text)}</p>`).join("");
  $("#trapText").innerHTML = wrongTraps;
  const source = sources.get(question.sources[0]);
  const sourceLink = $("#sourceLink");
  if (source) {
    sourceLink.href = source.url;
    sourceLink.innerHTML = `${escapeHtml(source.organisme)} · ${escapeHtml(source.nom)} <span>↗</span>`;
    sourceLink.classList.remove("hidden");
  } else {
    sourceLink.classList.add("hidden");
  }
}

function recordAnswer(question, correct) {
  const item = progress.answers[question.id] || { attempts: 0, correct: 0, lastCorrect: false, lastAnswered: null };
  item.attempts += 1;
  if (correct) item.correct += 1;
  item.lastCorrect = correct;
  item.lastAnswered = new Date().toISOString();
  progress.answers[question.id] = item;

  const errors = new Set(progress.errors);
  if (correct) errors.delete(question.id); else errors.add(question.id);
  progress.errors = [...errors];
  progress.streak = correct ? progress.streak + 1 : 0;
  progress.bestStreak = Math.max(progress.bestStreak, progress.streak);
  saveProgress();
}

function skipQuestion() {
  if (!session || session.validated) return;
  const question = currentQuestion();
  session.responses.push({ id: question.id, selected: null, correct: false, seconds: Math.max(1, Math.round((Date.now() - session.questionStartedAt) / 1000)) });
  recordAnswer(question, false);
  goNext();
}

function goNext() {
  if (session.index >= session.questions.length - 1) {
    finishSession();
    return;
  }
  session.index += 1;
  renderQuestion();
}

function startTimer() {
  clearInterval(timerId);
  updateTimer();
  timerId = window.setInterval(() => {
    if (!session) return;
    if (session.mode === "exam") {
      session.remaining = Math.max(0, EXAM_SECONDS - Math.floor((Date.now() - session.startedAt) / 1000));
      if (session.remaining === 0) finishSession(true);
    }
    updateTimer();
  }, 1000);
}

function updateTimer() {
  if (!session) return;
  const value = session.mode === "exam"
    ? session.remaining
    : Math.floor((Date.now() - session.startedAt) / 1000);
  $("#timer b").textContent = formatTime(value);
  $("#timer").classList.toggle("danger", session.mode === "exam" && value <= 300);
}

function finishSession(timedOut = false) {
  if (!session) return;
  clearInterval(timerId);
  if (timedOut) {
    const answeredIds = new Set(session.responses.map((response) => response.id));
    session.questions.filter((question) => !answeredIds.has(question.id)).forEach((question) => {
      session.responses.push({ id: question.id, selected: null, correct: false, seconds: 0 });
      recordAnswer(question, false);
    });
  }

  const correct = session.responses.filter((response) => response.correct).length;
  const total = session.questions.length;
  const wrong = total - correct;
  const score = total ? Math.round((correct / total) * 100) : 0;
  const duration = Math.round((Date.now() - session.startedAt) / 1000);
  const wrongIds = session.responses.filter((response) => !response.correct).map((response) => response.id);

  progress.sessions.unshift({ date: new Date().toISOString(), mode: session.mode, total, correct, duration });
  progress.sessions = progress.sessions.slice(0, 50);
  saveProgress();

  $("#scorePercent").textContent = `${score}%`;
  $("#scoreRing").style.setProperty("--score", `${score * 3.6}deg`);
  $("#resultCorrect").textContent = correct;
  $("#resultWrong").textContent = wrong;
  $("#resultTime").textContent = formatTime(duration);
  $("#resultMessage").textContent = timedOut
    ? "Temps écoulé : les questions non répondues sont comptées comme erreurs."
    : score >= 90 ? "Excellent niveau : tu dépasses l’objectif de 90 %." : score >= 75 ? "Solide. Quelques révisions ciblées feront la différence." : "Reprends les erreurs, puis relance une série inédite.";
  $("#retryErrorsButton").disabled = wrongIds.length === 0;
  $("#retryErrorsButton").dataset.ids = JSON.stringify(wrongIds);
  $("#reviewList").innerHTML = wrongIds.slice(0, 10).map((id) => {
    const question = questions.find((item) => item.id === id);
    return question ? `<article class="review-item"><small>${escapeHtml(question.domaine)} · ${question.id}</small><p>${escapeHtml(question.enonce)}</p></article>` : "";
  }).join("");

  session = null;
  showScreen("results");
  updateDashboard();
}

function renderStats() {
  const entries = Object.values(progress.answers);
  const attempts = entries.reduce((sum, item) => sum + item.attempts, 0);
  const correct = entries.reduce((sum, item) => sum + item.correct, 0);
  $("#statsRate").textContent = attempts ? `${Math.round((correct / attempts) * 100)} %` : "—";

  const byDomain = [...new Set(questions.map((q) => q.domaine))].map((domain) => {
    const domainQuestions = questions.filter((q) => q.domaine === domain);
    const seen = domainQuestions.filter((q) => progress.answers[q.id]);
    const domainAttempts = seen.reduce((sum, q) => sum + progress.answers[q.id].attempts, 0);
    const domainCorrect = seen.reduce((sum, q) => sum + progress.answers[q.id].correct, 0);
    return { domain, seen: seen.length, total: domainQuestions.length, rate: domainAttempts ? Math.round((domainCorrect / domainAttempts) * 100) : 0 };
  }).sort((a, b) => b.seen - a.seen || a.domain.localeCompare(b.domain, "fr"));

  $("#statsList").innerHTML = byDomain.map((item) => `<article class="stat-domain">
    <header><strong>${escapeHtml(item.domain)}</strong><span>${item.seen}/${item.total} · ${item.seen ? `${item.rate}%` : "non commencé"}</span></header>
    <div class="progress-track"><span style="width:${(item.seen / item.total) * 100}%"></span></div>
  </article>`).join("");
}

function showConfirm(title, text, callback) {
  $("#confirmTitle").textContent = title;
  $("#confirmText").textContent = text;
  confirmCallback = callback;
  $("#confirmDialog").showModal();
}

function quitQuiz() {
  if (!session) return;
  showConfirm("Quitter cette série ?", "Les réponses déjà validées restent dans tes statistiques, mais cette session ne sera pas comptabilisée.", () => {
    clearInterval(timerId);
    session = null;
    showScreen("home");
    updateDashboard();
    history.replaceState(null, "", "#home");
  });
}

let toastTimeout;
function showToast(message) {
  clearTimeout(toastTimeout);
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2600);
}

function bindEvents() {
  $("#answers").addEventListener("click", (event) => {
    const answer = event.target.closest("[data-answer]");
    if (answer) selectAnswer(answer.dataset.answer);
  });
  $("#validateButton").addEventListener("click", validateAnswer);
  $("#nextButton").addEventListener("click", goNext);
  $("#skipButton").addEventListener("click", skipQuestion);
  $("#backButton").addEventListener("click", quitQuiz);

  $$('[data-mode]').forEach((button) => button.addEventListener("click", () => {
    const mode = button.dataset.mode;
    if (mode === "theme") return openThemes();
    startSession(mode);
  }));
  $$('[data-open-review]').forEach((button) => button.addEventListener("click", openReview));
  $$('[data-review-mode]').forEach((button) => button.addEventListener("click", () => {
    $("#reviewDialog").close();
    startSession(button.dataset.reviewMode);
  }));
  $$('[data-open-theme]').forEach((button) => button.addEventListener("click", openThemes));
  $("#themeSearch").addEventListener("input", (event) => renderThemeList(event.target.value));
  $("#themeList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-domain]");
    if (!button) return;
    $("#themeDialog").close();
    startSession("theme", { domain: button.dataset.domain });
  });
  $("#homeButton").addEventListener("click", () => { location.hash = "home"; });
  $("#retryErrorsButton").addEventListener("click", (event) => {
    const ids = JSON.parse(event.currentTarget.dataset.ids || "[]");
    const selected = ids.map((id) => questions.find((q) => q.id === id)).filter(Boolean);
    startSession("custom", { questions: selected, label: "Erreurs de la session" });
  });
  $("#resetProgressButton").addEventListener("click", () => showConfirm(
    "Réinitialiser la progression ?",
    "Cette action effacera tes scores et tes erreurs enregistrés sur cet appareil.",
    () => { progress = emptyProgress(); saveProgress(); updateDashboard(); renderStats(); showToast("Progression réinitialisée."); }
  ));
  $("#confirmDialog").addEventListener("close", (event) => {
    if (event.target.returnValue === "confirm" && confirmCallback) confirmCallback();
    confirmCallback = null;
  });
  window.addEventListener("hashchange", route);
}

function route() {
  const routeName = location.hash.replace("#", "") || "home";
  if (session && routeName !== "quiz") {
    history.replaceState(null, "", "#quiz");
    quitQuiz();
    return;
  }
  if (routeName === "stats") {
    renderStats();
    showScreen("stats");
  } else {
    updateDashboard();
    showScreen("home");
  }
}

async function init() {
  try {
    const lotUrls = Array.from({ length: 22 }, (_, index) => `questions/lot-${String(index + 1).padStart(3, "0")}.json`);
    const [lotResponses, sourceResponse] = await Promise.all([
      Promise.all(lotUrls.map((url) => fetch(url))),
      fetch("sources/sources.json")
    ]);
    if (lotResponses.some((response) => !response.ok) || !sourceResponse.ok) throw new Error("Données indisponibles");
    questions = (await Promise.all(lotResponses.map((response) => response.json()))).flat();
    const sourceDocument = await sourceResponse.json();
    sources = new Map(sourceDocument.sources.map((source) => [source.id, source]));
    bindEvents();
    updateDashboard();
    route();
  } catch (error) {
    console.error(error);
    $("#main").innerHTML = `<section class="screen"><h1>Impossible de charger le QCM</h1><p>Vérifie ta connexion puis recharge la page.</p></section>`;
  }

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js?v=7").catch((error) => console.warn("Service worker non enregistré", error));
  }
}

init();
