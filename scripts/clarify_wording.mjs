import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=fs.readdirSync(path.join(root,'questions')).filter(f=>/^lot-\d+\.json$/.test(f)).sort();
const before=files.flatMap(f=>JSON.parse(fs.readFileSync(path.join(root,'questions',f),'utf8')));
const corrections=[];
function topic(s){
 s=s.trim().replace(/\s+/g,' ').replace(/[? ]+$/,'');
 if(s.includes(' — '))return s.split(' — ')[0];
 return s
 .replace(/^Quelle condition permet en principe de demander /,'Condition permettant de demander ')
 .replace(/^Quel abattement s'applique en principe à /,'Abattement applicable à ')
 .replace(/^Que devient en principe /,'Traitement de ')
 .replace(/^En cas d'option (.*), quelle fraction de CSG peut en principe être déductible du revenu global$/,'Fraction de CSG déductible du revenu global en cas d’option $1')
 .replace(/^Comment un associé (.*) déclare-t-il en principe (.*)$/,'Déclaration de $2 par un associé $1')
 .replace(/^Quel régime patrimonial s'applique par défaut (.*)$/,'Régime patrimonial applicable par défaut $1')
 .replace(/^Dans quelle situation (.*) peut-il notamment être demandé$/,'Situation permettant de demander $1')
 .replace(/^Quel droit protège de plein droit (.*)$/,'Protection de plein droit de $1')
 .replace(/^Quelle est la durée minimale d'engagement attachée à (.*)$/,'Durée minimale d’engagement attachée à $1')
 .replace(/^Quelle cession bénéficie en principe de (.*)$/,'Cession bénéficiant de $1')
 .replace(/^Quelle affirmation est exacte sur (.*)$/,'Règle applicable à $1')
 .replace(/^Après quelle durée (.*) est-elle totalement exonérée (.*)$/,'Durée requise pour l’exonération totale de $1 $2')
 .replace(/^Quel régime de plus-value s'applique en principe à (.*)$/,'Régime de plus-value applicable à $1')
 .replace(/^Quel seuil de prix de cession ouvre en principe (.*)$/,'Seuil de prix de cession ouvrant $1')
 .replace(/^Comment les déficits (.*) sont-ils en principe imputés$/,'Imputation des déficits $1')
 .replace(/^Quel événement fait courir (.*)$/,'Événement faisant courir $1')
 .replace(/^Quelle règle générale s'applique à (.*)$/,'Règle applicable à $1')
 .replace(/^Quelle fraction du déficit foncier peut s'imputer (.*)$/,'Fraction du déficit foncier imputable $1')
 .replace(/^Comment fonctionne (.*)$/,'Fonctionnement de $1')
 .replace(/^Les dons (.*) entrent-ils dans (.*)$/,'Inclusion des dons $1 dans $2')
 .replace(/^Quels avantages peuvent relever (.*)$/,'Avantages relevant $1')
 .replace(/^Quelle condition de location accompagne (.*)$/,'Condition de location attachée à $1')
 .replace(/^Quel taux de rémunération est attaché aux (.*)$/,'Taux de rémunération des $1')
 .replace(/^Quel taux d'impôt sur le revenu s'applique en principe à (.*)$/,'Taux d’impôt sur le revenu applicable à $1')
 .replace(/^Quelle démarche conditionne en principe (.*)$/,'Démarche conditionnant $1')
 .replace(/^Quel est le plafond de versements (.*)$/,'Plafond de versements $1')
 .replace(/^Quels sont le plafond (.*)$/,'Plafond $1')
 .replace(/^Quelles conditions une dette doit-elle notamment remplir pour être déductible de l'IFI$/,'Conditions de déductibilité d’une dette à l’IFI')
 .replace(/^Quel pourcentage (.*) représente en principe (.*)$/,'Pourcentage $1 représenté par $2')
 .replace(/^Comment évolue (.*) lorsque (.*)$/,'Évolution de $1 lorsque $2')
 .replace(/^Le paiement (.*) constitue-t-il (.*)$/,'Qualification du paiement $1 comme $2')
 .replace(/^Quelles conditions doivent être cumulativement remplies pour (.*)$/,'Conditions cumulatives requises pour $1')
 .replace(/^Quel plafond global de versements s'applique au (.*)$/,'Plafond global de versements applicable au $1')
 .replace(/^Quel ordre logique structure (.*)$/,'Ordre des étapes de $1')
 .replace(/^Pour (.*), quels repères s'appliquent à (.*)$/,'Repères applicables à $2 pour $1')
 .replace(/^Quelles conditions d'âge accompagnent (.*)$/,'Conditions d’âge attachées à $1')
 .replace(/^Pourquoi (.*) doivent-ils être actualisés dans la durée$/,'Motif d’actualisation de $1 dans la durée')
 .replace(/^À partir de quel âge peut-on en principe demander (.*)$/,'Âge à partir duquel demander $1')
 .replace(/^Quel effet produit (.*) sur (.*)$/,'Effet de $1 sur $2')
 .replace(/^Quels droits légaux le conjoint survivant possède-t-il lorsque (.*)$/,'Droits légaux du conjoint survivant lorsque $1')
 .replace(/^Dans quelle catégorie (.*) déclare-t-il (.*)$/,'Catégorie de déclaration de $2 par $1')
 .replace(/^Quelle est la finalité principale de (.*)$/,'Finalité de $1')
 .replace(/^Comment le prélèvement à la source est-il généralement acquitté sur (.*)$/,'Paiement du prélèvement à la source sur $1')
 .replace(/^Quel est le principe de paiement (.*)$/,'Principe de paiement $1')
 .replace(/^Comment l'article 669 du CGI valorise-t-il fiscalement (.*)$/,'Valorisation fiscale de $1 selon l’article 669 du CGI')
 .replace(/^Quelle est la quotité disponible ordinaire (.*)$/,'Quotité disponible ordinaire $1')
 .replace(/^Quel est le taux de rémunération (.*)$/,'Taux de rémunération $1')
 .replace(/^Comment les droits (.*) sont-ils principalement constitués$/,'Constitution des droits $1')
 .replace(/^Sur quelle durée (.*) peut-elle en principe être reportée$/,'Durée de report de $1')
 .replace(/^Quel est l'effet du (.*)$/,'Effet du $1')
 .replace(/^Sur quelle base est en principe déterminé (.*)$/,'Base de détermination de $1')
 .replace(/^Quel abattement personnel s'applique en principe à (.*)$/,'Abattement personnel applicable à $1')
 .replace(/^Le prélèvement à la source constitue-t-il (.*)$/,'Prélèvement à la source et $1')
 .replace(/^Quels biens sont expressément exonérés (.*)$/,'Biens expressément exonérés $1')
 .replace(/^Quel réflexe s'impose lorsqu'(.*)$/,'Démarche à suivre lorsqu’$1')
 .replace(/^Quel est le caractère de (.*)$/,'Caractère de $1')
 .replace(/^Qui doit en principe déclarer (.*)$/,'Personne tenue de déclarer $1')
 .replace(/^Quel est le principe de (.*)$/,'Principe de $1')
 .replace(/^Quel est l'effet d'(.*)$/,'Effet d’$1')
 .replace(/^Quel principe social s'applique à (.*)$/,'Régime social applicable à $1')
 .replace(/^Quel abattement forfaitaire s'applique au (.*)$/,'Abattement forfaitaire applicable au $1')
 .replace(/^Quand le régime micro-foncier peut-il en principe s'appliquer aux (.*)$/,'Conditions d’application du régime micro-foncier aux $1')
 .replace(/^Quel principe caractérise (.*)$/,'Principe caractérisant $1')
 .replace(/de le /g,'du ').replace(/de les /g,'des ');
}
const cap=s=>s.charAt(0).toLocaleUpperCase('fr')+s.slice(1);
function statement(label,value){
 const context=cap(topic(label));
 if(/^(Quel|Quelle|Quels|Quelles|Comment|Pourquoi|Quand|Qui|Dans quelle|Sur quelle|À partir)/.test(context))throw Error('Contexte à relire : '+label);
 value=value.trim();
 if(label.includes(' — ')){
   if(value.startsWith("Il s'agit d'"))return context+' est '+value.slice(12);
   if(/^(Il|Elle|Ils|Elles)\s/.test(value))return `${context} ${value.replace(/^(Il|Elle|Ils|Elles)\s/,'')}`;
   // Une proposition déjà autonome n'a pas besoin d'une seconde étiquette.
   if(/^(Lorsque|Chaque|Sans |Le plafond|Les produits attachés|Les actes de disposition)/.test(value))return value;
 }
 const fraction=label.match(/^Que devient en principe (.*)$/);
 if(fraction&&/^Elle /.test(value))return cap(fraction[1])+value.replace(/^Elle/,'');
 return `${context} : ${value}`;
}
function clean(s){
 return s.replace(/«\s*([^»]+?)\s*»\s*:\s*([^]*?)(?=$)/g,(_,label,value)=>statement(label,value))
 .replace(/[«»]/g,'').replace(/\s+/g,' ').trim();
}
for(const q of before){
 const old=JSON.parse(JSON.stringify(q));
 const vf=q.enonce.match(/^Vrai ou faux — «\s*(.*?)\s*»\s*:\s*(.*)$/s);
 if(vf)q.enonce=statement(vf[1],vf[2]);
 else if(q.enonce.startsWith('Parmi les affirmations suivantes portant sur'))q.enonce='Quelles affirmations sont exactes ?';
 else if(/association|associe|rapprochement/.test(q.enonce))q.enonce='Quelle affirmation est incorrecte ?';
 else q.enonce=clean(q.enonce);
 q.enonce=q.enonce.replace(/^Concernant (.+) et (.+), quelle proposition restitue exactement la règle applicable\s*\?$/,'Quelle affirmation est exacte concernant $1 ($2) ?');
 q.choix=Object.fromEntries(Object.entries(q.choix).map(([k,v])=>[k,clean(v)]));
 // Nettoyage typographique des explications sans changement de la règle.
 q.explication=clean(q.explication);
 q.pieges=Object.fromEntries(Object.entries(q.pieges).map(([k,v])=>[k,clean(v)]));
 if(JSON.stringify(q)!==JSON.stringify(old))corrections.push({id:q.id,avant:old.enonce,apres:q.enonce,choix_avant:old.choix,choix_apres:q.choix});
}
for(const f of files){const original=JSON.parse(fs.readFileSync(path.join(root,'questions',f),'utf8'));const ids=new Set(original.map(q=>q.id));fs.writeFileSync(path.join(root,'questions',f),JSON.stringify(before.filter(q=>ids.has(q.id)),null,2)+'\n');}
