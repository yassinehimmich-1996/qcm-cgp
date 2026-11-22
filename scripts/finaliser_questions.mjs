import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const file = name => new URL(name, root);
const read = name => JSON.parse(fs.readFileSync(file(name), 'utf8'));
const save = (name, value) => fs.writeFileSync(file(name), JSON.stringify(value, null, 2) + '\n');
const pairs = new Map(fs.readFileSync(file('data/reponses-revues.txt'), 'utf8').trim().split('\n').map(line => {
  const [id, exact, distracteur] = line.split('|');
  return [Number(id), {exact, distracteur}];
}));
const refs = read('sources/sources.json');
for (const [id, nom, organisme, url] of [
  ['S170', 'Garanties décès, invalidité et incapacité du prêt immobilier', 'Service Public', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F21128'],
  ['S171', 'Code de la construction et de l’habitation, article L. 271-1', 'Légifrance', 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037667917/']
]) {
  if (!refs.sources.some(s => s.id === id)) refs.sources.push({id, nom, organisme, url, date_document:'Version consultée le 22 novembre 2026', date_consultation:'2026-11-22', sujets:[nom]});
}
save('sources/sources.json', refs);
for (const name of fs.readdirSync(file('questions/')).filter(n => /^lot-\d+\.json$/.test(n))) {
  const lot = read('questions/' + name);
  for (const q of lot) {
    const id = Number(q.id.slice(-4));
    const pair = pairs.get(id);
    if (pair) {
      const key = q.bonnes_reponses[0];
      const wrong = Object.keys(q.pieges).sort((a,b) => q.choix[a].length - q.choix[b].length)[0];
      q.choix[key] = pair.exact;
      q.choix[wrong] = pair.distracteur;
      q.explication = q.explication.split(' La difficulté tient')[0];
      q.pieges[wrong] = q.explication;
    }
    if (q.enonce === 'Quelles affirmations sont exactes ?' || q.enonce === 'Quelle affirmation est incorrecte ?') {
      q.enonce = q.sous_domaine.split(' / ').join(' et ') + ' — ' + q.enonce[0].toLowerCase() + q.enonce.slice(1);
    }
    for (const [k,v] of Object.entries(q.pieges)) {
      const match = v.match(/, la règle exacte est : (.*)$/);
      if (match) q.pieges[k] = match[1];
    }
    if (q.explication.startsWith('Les règles à retenir sont')) q.explication = q.bonnes_reponses.map(k => q.choix[k]).join(' ');
    if (q.explication.startsWith("L'association à écarter") && q.explication.includes('la règle correcte est : ')) q.explication = q.explication.split('la règle correcte est : ').at(-1);
    if (id === 39) {
      const key = q.bonnes_reponses[0];
      const alternatives = [
        ['Une incapacité temporaire totale avec arrêt de travail prescrit.', 'Un arrêt temporaire relève de l’ITT.'],
        ['Une invalidité professionnelle définitive, même si l’assuré reste autonome au quotidien.', 'L’incapacité professionnelle seule ne caractérise pas la PTIA.'],
        ['Une perte partielle de revenus après une reprise d’activité à temps réduit.', 'La perte de revenus ne démontre ni impossibilité définitive ni dépendance.']
      ];
      for (const k of Object.keys(q.choix)) {
        if (k === key) q.choix[k] = 'Une impossibilité définitive de travailler avec besoin permanent d’une tierce personne pour les actes ordinaires de la vie.';
        else [q.choix[k], q.pieges[k]] = alternatives.shift();
      }
      Object.assign(q, {id:'CGP-2026-0951', sous_domaine:'Perte totale et irréversible d’autonomie', enonce:'En assurance emprunteur, quelle situation caractérise la PTIA ?', explication:'La PTIA associe l’impossibilité totale et définitive d’exercer une activité professionnelle et le besoin permanent d’assistance pour les actes de la vie quotidienne. La notice précise les conditions de prise en charge.', sources:['S170'], date_verification:'2026-11-22'});
    }
    if (id === 370) {
      q.enonce = 'En VEFA, sans avant-contrat préalable, quel délai protège l’acquéreur non professionnel qui reçoit le projet d’acte authentique ?';
      q.explication = 'La notification ou la remise du projet ouvre un délai de réflexion de dix jours. L’acte authentique ne peut être signé pendant ce délai.';
      q.sources = ['S171','S142'];
      q.date_verification = '2026-11-22';
      for (const k of Object.keys(q.pieges)) q.pieges[k] = q.explication;
    }
    if (id === 591) {
      q.enonce = 'Quelles règles s’appliquent au Livret A d’un particulier ?';
      q.choix.A = 'Le montant des versements est illimité.';
      q.choix.C = 'Le plafond de versements est de 22 950 €, hors intérêts capitalisés.';
      q.explication = 'Le plafond limite les versements. La capitalisation des intérêts peut porter le solde au-delà de 22 950 €. Ces intérêts sont exonérés d’impôt sur le revenu et de prélèvements sociaux.';
    }
    if (id === 642) {
      q.enonce = 'Quelles règles concernent la modulation du prélèvement à la source et la résidence principale détenue directement pour l’IFI ?';
      q.choix = {A:'Une baisse de revenu autorise seulement une modulation à compter de l’année suivante.', B:'La résidence principale est intégralement exonérée d’IFI.', C:'La modulation à la baisse suppose un écart de prélèvement supérieur à 5 %.', D:'Un abattement de 30 % s’applique à la valeur vénale de la résidence principale.'};
      q.explication = 'Pour la modulation, on compare le prélèvement estimé avec celui dû sans modification. Pour l’IFI, on applique l’abattement à la valeur vénale du logement occupé comme résidence principale.';
      q.pieges = {A:'Le contribuable peut demander une modulation en cours d’année si les conditions sont réunies.', B:'L’abattement réduit la base imposable. Il ne constitue pas une exonération totale.'};
    }
  }
  save('questions/'+name, lot);
}
