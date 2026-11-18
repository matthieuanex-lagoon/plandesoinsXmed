// node tests/safe.test.js — non-régression du moteur partagé (valeurs de référence = anciennes sorties de la maquette)
const assert = require('assert'), fs = require('fs'), path = require('path'), M = require('../safe/safe.js');
const load = d => fs.readdirSync(path.join(__dirname, '../regles/v1', d)).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(__dirname, '../regles/v1', d, f))));
const FRED = load('document-fred'), EX = load('exemples-generateur');
const patient = () => ({ naissance: '1980-11-12', sexe: '', episodes: [{ d: '2025-08-24', l: 'Tabagisme' }, { d: '2025-09-04', l: 'Diabète de type 2' }, { d: '2026-11-12', l: 'Coronaropathie' }],
  atcdFam: [{ l: 'Emphysème du poumon', lien: 'Grand-oncle m.' }, { l: 'Lymphome cérébral', lien: 'Grand-père' }],
  traitements: [{ label: 'SIMVASTATINE 20MG', atc: null, debut: '2026-09-02' }], vaccins: [], documents: [],
  suivi: [{ date: '2026-08-08', lib: 'HbA1c', val: 7.2, unit: '%' }, { date: '2026-04-01', lib: 'HbA1c', val: 8, unit: '%' }, { date: '2025-11-12', lib: 'Cholestérol total', val: 3, unit: 'g/l' },
    { date: '2025-11-12', lib: 'Cholestérol LDL', val: 1.5, unit: 'g/l' }, { date: '2025-06-01', lib: 'Hémoglobine', val: 12.2, unit: 'g/100ml' }] });
const ctx = (o = {}) => ({ today: '2026-11-18', policy: 'min', overrides: {}, patientPer: {}, prescrit: {}, ...o });
const sig = rows => rows.map(w => [w.label, w.st, w.due, w.days || ''].join('|'));
let n = 0; const t = (nom, f) => { f(); n++; console.log('ok -', nom); };

t('patient diabétique 46 ans (HbA1c 7,2) : plan de Fred identique à l\'ancien moteur', () => {
  const C = M.planifier(FRED, patient(), ctx());
  assert.deepStrictEqual(sig(C.bio), ['NFS|late|2026-06-01|365', 'HbA1c|late|2026-11-07|91', 'EAL|late|2026-11-12|365', 'SGOT|late|2026-11-18|365', 'SGPT|late|2026-11-18|365',
    'Gamma GT|late|2026-11-18|365', 'TP|late|2026-11-18|365', 'Clairance de la créatinine|late|2026-11-18|365', 'RAC|late|2026-11-18|365']);
  assert.deepStrictEqual(C.prev.map(w => w.label), ['ECG']);
});
t('HbA1c ≤ 7 : la règle diabète s\'éteint', () => {
  const P = patient(); P.suivi.push({ date: '2026-11-18', lib: 'HbA1c', val: 6.8, unit: '%' });
  assert.strictEqual(M.planifier(FRED, P, ctx()).rows.length, 0);
});
t('instauration lamotrigine : jalons fusionnés avec la règle diabète', () => {
  const P = patient(); P.traitements.unshift({ label: 'LAMOTRIGINE', atc: 'N03AX09', debut: '2026-11-18' });
  const C = M.planifier(FRED, P, ctx());
  assert.deepStrictEqual(sig(C.bio).slice(0, 3), ['NFS|late|2026-06-01|365', 'HbA1c|late|2026-11-07|91', 'EAL|late|2026-11-12|365']);
  const g = C.bio.find(w => w.label === 'Glycémie'); assert.strictEqual(g.due, '2026-11-18'); assert.strictEqual(g.jal.length, 3);
  assert.strictEqual(C.bio.find(w => w.label === 'NFS').jal.length, 2);
  assert.strictEqual(C.bio.length, 13);
});
t('lamotrigine après 1 an : phase entretien (12 mois), plus de jalons', () => {
  const P = patient(); P.traitements.unshift({ label: 'LAMOTRIGINE', atc: 'N03AX09', debut: '2025-10-01' });
  const C = M.planifier(FRED, P, ctx()), nfs = C.bio.find(w => w.label === 'NFS');
  assert.strictEqual(nfs.jal.length, 0); assert.strictEqual(nfs.days, 365);
});
t('dépistage colorectal : 46 ans non, 56 ans oui, CR de coloscopie récent non', () => {
  const lab = P => M.planifier(FRED, P, ctx()).prev.map(w => w.label);
  assert.ok(!lab(patient()).includes('Recherche de sang dans les selles'));
  const P = patient(); P.naissance = '1970-01-01'; assert.ok(lab(P).includes('Recherche de sang dans les selles'));
  P.documents.push({ libelle: 'Coloscopie', date: '2024-01-01' }); assert.ok(!lab(P).includes('Recherche de sang dans les selles'));
  const Q = patient(); Q.naissance = '1970-01-01'; Q.atcdFam.push({ l: 'Cancer du côlon', lien: 'Mère' }); assert.ok(!lab(Q).includes('Recherche de sang dans les selles'));
  const R = patient(); R.naissance = '1970-01-01'; R.atcdFam.push({ l: 'Cancer du côlon', lien: 'Grand-père' }); assert.ok(lab(R).includes('Recherche de sang dans les selles'));
});
t('IEC/ARA2 : instauration (S2-4 puis M12) puis entretien ; ATC par préfixe', () => {
  const P = patient(); P.suivi = []; P.episodes = []; P.traitements = [{ label: 'X', atc: 'C09CA01', debut: '2026-11-18' }];
  let C = M.planifier(FRED, P, ctx()); const io = C.bio.find(w => w.key === 'ionogramme'); assert.strictEqual(io.due, '2026-12-02'); assert.strictEqual(io.jal.length, 2);
  C = M.planifier(FRED, P, ctx({ today: '2027-12-01' }));
  const iono = C.bio.find(w => w.key === 'ionogramme'); assert.strictEqual(iono.days, 365); assert.strictEqual(iono.jal.length, 0);
});
t('période la plus courte, surcharge utilisateur (droit au remords) et périodicité patient', () => {
  const P = patient(); const k = 'diabete-hba1c-sup-7|' + FRED.find(r => r.id === 'diabete-hba1c-sup-7').alors.findIndex(a => a.examens.includes('HbA1c')) + '|hba1c';
  let w = M.planifier(FRED, P, ctx({ overrides: { [k]: 182 } })).bio.find(x => x.key === 'hba1c');
  assert.strictEqual(w.days, 182); assert.ok(w.srcs[0].mod); assert.strictEqual(w.srcs[0].livre, 91);
  w = M.planifier(FRED, P, ctx({ patientPer: { hba1c: 60 } })).bio.find(x => x.key === 'hba1c'); assert.strictEqual(w.days, 60);
  w = M.planifier(FRED, P, ctx({ patientPer: { hba1c: 400 }, policy: 'patient' })).bio.find(x => x.key === 'hba1c'); assert.strictEqual(w.days, 400);
  w = M.planifier(FRED, P, ctx({ patientPer: { hba1c: 400 } })).bio.find(x => x.key === 'hba1c'); assert.strictEqual(w.days, 91);
});
t('exemples du générateur : tétanos (indicateur + ordonnance), diabète, Zyprexa', () => {
  const P = patient(); P.naissance = '1981-11-18'; // 45 ans
  let C = M.planifier(EX, P, ctx()); assert.strictEqual(C.indicateurs.length, 1); assert.strictEqual(C.indicateurs[0].niveau, 'alerte');
  assert.ok(C.prev.some(w => w.label === 'Vaccin tétanos' && w.st === 'late'));
  P.vaccins.push({ libelle: 'Tétanos' }); assert.strictEqual(M.planifier(EX, P, ctx()).indicateurs.length, 0);
  P.traitements.push({ label: 'ZYPREXA 10MG', atc: null, debut: '2026-10-01' });
  assert.ok(M.planifier(EX, P, ctx()).ev.find(x => x.r.id === 'zyprexa-numeration').ev.ok);
});
t('règle désactivée : ignorée', () => {
  const r = JSON.parse(JSON.stringify(EX[0])); r.actif = false; assert.strictEqual(M.planifier([r], patient(), ctx()).rows.length, 0);
});
const CAS = load('cas-supplementaires');
t('cas sourcés : dépistage du sein (femme 50–74 ans) → mammographie tous les 2 ans', () => {
  const P = patient(); P.sexe = 'F'; P.naissance = '1974-01-01';
  const w = M.planifier(CAS, P, ctx()).prev.find(x => x.label === 'Mammographie'); assert.ok(w); assert.strictEqual(w.days, 731); assert.strictEqual(w.st, 'late');
  P.sexe = 'M'; assert.ok(!M.planifier(CAS, P, ctx()).prev.some(x => x.label === 'Mammographie'));
  P.sexe = 'F'; P.naissance = '1950-01-01'; assert.ok(!M.planifier(CAS, P, ctx()).prev.some(x => x.label === 'Mammographie'));
  P.naissance = '1974-01-01'; P.suivi.push({ date: '2026-03-01', lib: 'Mammographie', val: 'ok', unit: '' }); assert.strictEqual(M.planifier(CAS, P, ctx()).prev.find(x => x.label === 'Mammographie').due, '2028-03-01');
});
t('cas sourcés : col de l\'utérus 25–29 (cytologie 3 ans) et 30–65 (HPV-HR 5 ans)', () => {
  const P = patient(); P.sexe = 'F'; P.naissance = '1999-01-01';
  let C = M.planifier(CAS, P, ctx()); assert.strictEqual(C.prev.find(x => /cytologique/.test(x.label)).days, 1096); assert.ok(!C.prev.some(x => /HPV/.test(x.label)));
  P.naissance = '1990-01-01'; C = M.planifier(CAS, P, ctx()); assert.strictEqual(C.prev.find(x => /HPV/.test(x.label)).days, 1826); assert.ok(!C.prev.some(x => /cytologique/.test(x.label)));
});
t('cas sourcés : rappel dTcaP à 45 ans (pas à 46), disparaît si le vaccin est fait', () => {
  const P = patient(); P.naissance = '1981-11-18'; let C = M.planifier(CAS, P, ctx());
  assert.strictEqual(C.indicateurs.length, 1); assert.ok(C.prev.some(x => x.label === 'Vaccin dTcaP'));
  P.vaccins.push({ libelle: 'dTcaP' }); assert.strictEqual(M.planifier(CAS, P, ctx()).indicateurs.length, 0);
  assert.strictEqual(M.planifier(CAS, patient(), ctx()).indicateurs.length, 0);
});
t('cas sourcés : lithium (ATC N05AN01) — bilan T0, lithiémies J7/J14, ECG/EEG en prévention', () => {
  const P = patient(); P.traitements.push({ label: 'TERALITHE LP 400', atc: 'N05AN01', debut: '2026-11-18' });
  const C = M.planifier(CAS, P, ctx()), li = C.bio.find(x => x.label === 'Lithiémie');
  assert.strictEqual(li.due, '2026-11-25'); assert.strictEqual(li.jal.length, 2);
  ['Créatinine', 'Calcémie', 'Protéinurie', 'Ionogramme', 'NFS', 'TSH', 'Glycémie à jeun'].forEach(e => assert.ok(C.bio.some(x => x.label === e && x.due === '2026-11-18'), e));
  assert.deepStrictEqual(C.prev.map(x => x.label).sort(), ['ECG', 'EEG']);
});
t('toutes les règles ont un id unique et sont documentées (a_valider ou valide)', () => {
  const all = [...FRED, ...CAS, ...EX], ids = all.map(r => r.id); assert.strictEqual(new Set(ids).size, ids.length);
  all.forEach(r => assert.ok(['a_valider', 'valide'].includes(r.statut_validation)));
  CAS.forEach(r => assert.ok(r.references && r.references.length && r.references[0].url, r.id + ' sans source'));
});
console.log(`\n${n} tests passés`);
