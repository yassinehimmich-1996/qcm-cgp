import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const source=fs.readFileSync(new URL('assets/app.js',root),'utf8');
const blueprint=source.slice(source.indexOf('const EXAM_BLUEPRINT'),source.indexOf('const $ ='));
const functions=source.slice(source.indexOf('function shuffle('),source.indexOf('function formatTime('));
const context=vm.createContext({});
vm.runInContext(blueprint+functions,context);
const questions=fs.readdirSync(new URL('questions/',root)).filter(x=>/^lot-\d+\.json$/.test(x)).flatMap(f=>JSON.parse(fs.readFileSync(new URL('questions/'+f,root),'utf8')));
context.bank=questions;
const reached=new Set();
for(let i=0;i<500;i++){
 const exam=vm.runInContext('sampleBalancedExam(bank)',context);
 assert.equal(exam.length,100);assert.equal(new Set(exam.map(q=>q.id)).size,100);
 for(const [t,n] of Object.entries({unique:55,multiple:32,vrai_faux:13}))assert.equal(exam.filter(q=>q.type_question===t).length,n);
 for(const q of exam)reached.add(q.domaine);
 assert.ok(exam.filter(q=>Number(q.id.slice(-4))>800).length>=10);
}
assert.equal(reached.size,new Set(questions.map(q=>q.domaine)).size);
console.log('500 examens contrôlés : 100 questions distinctes, quotas 55/32/13, tous les thèmes atteignables, nouveaux sujets présents.');
