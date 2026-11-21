// Remplacements éditoriaux : 150 questions originales, sans changement des quotas.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const files=fs.readdirSync(path.join(root,'questions')).filter(x=>/^lot-\d+\.json$/.test(x)).sort();
let all=files.flatMap(f=>JSON.parse(read('questions/'+f)));
const alreadyApplied=all.some(q=>Number(q.id.slice(-4))>800);
let domain,source;const additions=[];
const distractors=JSON.parse(read('data/coverage-distractors.json'));
const extra={
 'Diagnostic patrimonial':['S082','S083'], 'Allocation et portefeuille':['S055','S066','S068'],
 'Risques patrimoniaux':['S033','S053','S055','S155'], 'Finance durable':['S156','S157'],
 'Patrimoine professionnel':['S068'], 'International':['S061','S084','S085','S086'],
 'Digital et intelligence artificielle':['S071','S158'], 'Clientèle vulnérable':['S159','S160'],
 'Santé et dépendance':['S028','S161'], 'Assurances de biens et responsabilité':['S162','S163','S169'],
 'Actifs réels et philanthropie':['S164'], 'Gouvernance et qualité professionnelle':['S068','S070'],
 'Ingénierie patrimoniale':['S017','S047','S099','S165','S166'], 'Épargne salariale':['S031','S167'],
 'Contrat de capitalisation':['S022','S058','S168']
};
for(const line of read('data/coverage-upgrade.txt').split('\n')){
 if(!line||line.startsWith('#'))continue;
 if(line.startsWith('@')){[domain,source]=line.slice(1).split('|');continue;}
 const fields=line.split('|');if(fields.length!==8)throw Error('Ligne invalide '+line);
 const [sub,enonce,a,b,c,d,answers,rule]=fields;
 const correct=answers.split(',').map(Number);
 const replacement=distractors[`${domain}/${sub}`];
 const vals=replacement?[a,...replacement]:[a,b,c,d].filter(Boolean);
 const offset=additions.length%vals.length;
 const order=vals.map((v,i)=>({v,i}));order.push(...order.splice(0,offset));
 const choix={},bonnes_reponses=[],pieges={};
 order.forEach(({v,i},j)=>{const k='ABCD'[j];choix[k]=v;if(correct.includes(i))bonnes_reponses.push(k);else pieges[k]=`Proposition écartée : « ${v} » ${rule}`;});
 additions.push({id:`CGP-2026-${String(801+additions.length).padStart(4,'0')}`,domaine:domain,sous_domaine:sub,
  difficulte:correct.length>1||/Dutreil|Quasi|Remploi|Récompense|Antériorité|automatisée|SFDR|Taxonomie|tutelle|curatelle/i.test(sub)?'expert':'avance',
  type_question:vals.length===2?'vrai_faux':correct.length>1?'multiple':'unique',enonce,choix,bonnes_reponses,
  explication:rule,sources:[...new Set([source,...(extra[domain]||[])])],pieges,origine:'entrainement_original',statut:'verifie_sources_publiques',date_verification:'2026-11-21'});
}
if(additions.length!==150)throw Error('150 questions attendues');
const counts=arr=>arr.reduce((m,q)=>(m[q.domaine]=(m[q.domaine]||0)+1,m),{});
const baselineCounts=counts(all),domainCounts={...baselineCounts},retired=[];
const signature=q=>`${q.type_question}:${q.bonnes_reponses.length}${q.type_question==='vrai_faux'?':'+q.choix[q.bonnes_reponses[0]]:''}`;
if(alreadyApplied){
 retired.push(...JSON.parse(read('docs/coverage-upgrade-manifest.json')).retired_ids);
 all=all.filter(q=>Number(q.id.slice(-4))<=800);
}
for(const n of alreadyApplied?[]:additions){
 const candidates=all.filter(q=>signature(q)===signature(n)&&domainCounts[q.domaine]>Math.max(3,Math.floor(baselineCounts[q.domaine]*.62)));
 candidates.sort((a,b)=>{
 const score=q=>(/association|associe|rapprochement/i.test(q.enonce)?150:0)+(/La difficulté tient|règle exacte|portée précise/.test(q.explication)?50:0)+(q.difficulte==='intermediaire'?25:0)+domainCounts[q.domaine];
 return score(b)-score(a)||a.id.localeCompare(b.id);
 });
 if(!candidates.length)throw Error('Remplacement impossible '+signature(n));
 const old=candidates[0];all=all.filter(q=>q.id!==old.id);domainCounts[old.domaine]--;retired.push(old.id);
}
all.push(...additions);
// Redistribuer par thème sur les 16 lots, tout en conservant les identifiants.
const groups=new Map();for(const q of all){if(!groups.has(q.domaine))groups.set(q.domaine,[]);groups.get(q.domaine).push(q);}
const lots=files.map(()=>[]);let cursor=0;
for(const group of [...groups.values()].sort((a,b)=>b.length-a.length))for(const q of group){while(lots[cursor%16].length>=50)cursor++;lots[cursor++%16].push(q);}
files.forEach((f,i)=>write('questions/'+f,JSON.stringify(lots[i],null,2)+'\n'));
write('docs/coverage-upgrade-manifest.json',JSON.stringify({date:'2026-11-21',original:800,replaced:150,total:800,retired_ids:retired,new_ids:additions.map(q=>q.id),domains:counts(all)},null,2)+'\n');
console.log('150 remplacements effectués ; 800 questions conservées.');
