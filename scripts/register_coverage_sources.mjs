import fs from 'node:fs';
const file=new URL('../sources/sources.json',import.meta.url);
const doc=JSON.parse(fs.readFileSync(file,'utf8'));
const rows=[
 ['S147','Taxonomie et SFDR : exprimer ses préférences','AMF','https://www.amf-france.org/fr/espace-epargnants/comprendre-les-produits-financiers/finance-durable/faire-un-placement-durable/finance-durable-bien-comprendre-la-taxonomie-et-le-reglement-sfdr-pour-exprimer-vos-preferences','Finance durable, SFDR, taxonomie'],
 ['S148','Transmission de sociétés : dispositif Dutreil','DGFiP – BOFiP','https://bofip.impots.gouv.fr/bofip/6509-PGP.html/identifiant=BOI-ENR-DMTG-10-20-40-10-20260810','Dutreil, activité, holding animatrice, conservation'],
 ['S149','Suis-je non-résident fiscal ?','DGFiP','https://www.impots.gouv.fr/particulier/suis-je-bien-non-resident','Résidence, conventions fiscales'],
 ['S150','IA : comment être en conformité avec le RGPD ?','CNIL','https://www.cnil.fr/fr/intelligence-artificielle/ia-comment-etre-en-conformite-avec-le-rgpd','IA, minimisation, données'],
 ['S151','Curatelle d’une personne majeure','Service Public','https://www.service-public.gouv.fr/particuliers/vosdroits/F2094','Capacité, assistance, actes'],
 ['S152','Ticket modérateur, forfait et franchises','Service Public','https://www.service-public.gouv.fr/particuliers/vosdroits/F165','Santé, remboursement, reste à charge'],
 ['S153','Responsabilité civile habitation','Service Public','https://www.service-public.gouv.fr/particuliers/vosdroits/F2123','MRH, tiers, dommages'],
 ['S154','Placements atypiques : prudence','AMF','https://www.amf-france.org/fr/espace-epargnants/proteger-son-epargne/placements-atypiques/placements-atypiques-des-investissements-considerer-avec-prudence','Actifs réels, liquidité, frais'],
 ['S155','Comprendre les obligations avant d’investir','AMF','https://www.amf-france.org/fr/espace-epargnants/comprendre-les-produits-financiers/actions-obligations/obligations/comprendre-les-obligations-avant-dinvestir','Taux, crédit, change'],
 ['S156','Finance durable : les labels ne suffisent pas','AMF','https://www.amf-france.org/fr/espace-epargnants/comprendre-les-produits-financiers/finance-durable/finance-durable-les-labels-ne-suffisent-pas-pour-bien-investir','Labels, risques, adéquation'],
 ['S157','Finance responsable','Banque de France','https://www.banque-france.fr/fr/publications-et-statistiques/publications/finance-responsable','ESG, durabilité'],
 ['S158','RGPD : droits, article 22','CNIL','https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3','Décisions automatisées, supervision'],
 ['S159','Article L132-4-1 du Code des assurances','Légifrance','https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038310472/','Assurance-vie, protection, conflits'],
 ['S160','Mandat de protection future','Service Public','https://www.service-public.gouv.fr/particuliers/vosdroits/F16670','Mandat, activation, capacité'],
 ['S161','Assurance dépendance','Ministère de l’Économie','https://www.economie.gouv.fr/particuliers/gerer-mon-argent/gerer-mon-budget-et-mon-epargne/etes-vous-le-beneficiaire-dun-contrat-dassurance-dependance','Autonomie, définitions contractuelles'],
 ['S162','Article L113-1 du Code des assurances','Légifrance','https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006791984/','Exclusions formelles et limitées'],
 ['S163','Garantie protection juridique','Service Public','https://www.service-public.gouv.fr/particuliers/vosdroits/F3049','Avocat, plafonds, exclusions'],
 ['S164','Dons aux organismes d’intérêt général','Service Public','https://www.service-public.gouv.fr/particuliers/vosdroits/F426','Philanthropie, conditions fiscales'],
 ['S165','Article 1434 du Code civil','Légifrance','https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006439640/','Emploi et remploi'],
 ['S166','Usufruit : articles 578 à 624 du Code civil','Légifrance','https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006136246/','Quasi-usufruit, restitution'],
 ['S167','Déblocage anticipé de l’épargne salariale','Service Public','https://www.service-public.gouv.fr/particuliers/vosdroits/F31622','PEE, PER, conditions'],
 ['S168','Observatoire des produits d’épargne financière 2026','Banque de France','https://www.banque-france.fr/system/files/2026-11/OPEF2026.pdf','Capitalisation, transmission'],
 ['S169','Article L121-1 du Code des assurances','Légifrance','https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006792236/','Principe indemnitaire']
];
for(const [id,nom,organisme,url,sujets] of rows){
 if(!doc.sources.some(s=>s.id===id))doc.sources.push({id,nom,organisme,url,date_document:'Version officielle consultée le 21 novembre 2026',date_consultation:'2026-11-21',sujets:sujets.split(', ')});
}
fs.writeFileSync(file,JSON.stringify(doc,null,2)+'\n');
