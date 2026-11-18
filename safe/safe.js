/* SAFE (Si · Alors · Faire · Échéance) — moteur de règles du plan de soins, partagé par generateur/, maquette/ et tests/.
 * Lit des règles v1 (regles/schema-v1.json) et un patient, produit : évaluation des règles,
 * indicateurs de prévention, plan fusionné (période la plus courte), échéances.
 *
 * Patient : {naissance:'AAAA-MM-JJ', sexe:'F'|'M'|'', episodes:[{d,l}], atcdFam:[{l,lien}],
 *            traitements:[{label,atc,debut}], suivi:[{date,lib,val,unit}], vaccins:[{libelle,date?}],
 *            documents:[{libelle,date}]}
 * Contexte : {today, overrides:{'<regle>|<action>|<examen>':jours}, patientPer:{'<cle>':jours},
 *            policy:'min'|'patient', prescrit:{'<cle>':date}}
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SAFE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const UNIT = { semaines: 7, mois: 30.4375, ans: 365.25 };
  const addDays = (s, n) => new Date(new Date(s + 'T00:00:00Z').getTime() + Math.round(n) * 864e5).toISOString().slice(0, 10);
  const addMonths = (s, m) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + m); return d.toISOString().slice(0, 10); };
  const diffDays = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
  const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/cholesterol/g, 'chol').replace(/\s+/g, ' ').trim();
  const nk = s => norm(String(s).replace(/\(.*?\)/g, ''));
  const SYM = { '>=': '≥', '<=': '≤' };

  function age(P, today) {
    const t = new Date(today), b = new Date(P.naissance);
    let a = t.getUTCFullYear() - b.getUTCFullYear();
    if (t.getUTCMonth() < b.getUTCMonth() || (t.getUTCMonth() === b.getUTCMonth() && t.getUTCDate() < b.getUTCDate())) a--;
    return a;
  }
  const has = (list, l) => !!l && list.some(x => norm(x).includes(norm(l)));
  const sameLabel = (a, b) => { const m = norm(a), n = norm(b); return m === n || m.startsWith(n) || n.startsWith(m); };
  function lastOf(P, labels, today, mois) {
    const lim = mois ? addMonths(today, -mois) : '0000-00-00';
    return P.suivi.filter(x => labels.some(l => sameLabel(x.lib, l)) && x.date <= today && x.date >= lim)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
  }
  const atcList = n => (Array.isArray(n.atc) ? n.atc : n.atc ? [n.atc] : []);
  const medMatch = (n, t) => (n.libelle && norm(t.label).includes(norm(n.libelle))) || (t.atc && atcList(n).some(a => t.atc.startsWith(a)));
  // « Lien » est du texte libre dans XMed : hypothèse à remplacer par un degré de parenté structuré.
  const PREMIER_DEGRE_OUI = /\b(pere|mere|frere|soeur|enfant|fils|fille|parents?)\b/, PREMIER_DEGRE_NON = /grand|oncle|tante|cousin|neveu|niece|demi/;
  const estPremierDegre = lien => { const n = norm(lien); return !PREMIER_DEGRE_NON.test(n) && PREMIER_DEGRE_OUI.test(n); };

  /* ---- Lecture en français d'une condition ---- */
  function decrireCondition(n) {
    const v = x => x ?? '?'; let s = '';
    if (n.type === 'age') s = n.op === 'entre' ? `l'âge est entre ${v(n.valeur)} et ${v(n.valeur2)} ans` : `l'âge ${SYM[n.op] || n.op} ${v(n.valeur)} ans`;
    if (n.type === 'sexe') s = `sexe ${n.valeur === 'F' ? 'féminin' : 'masculin'}`;
    if (n.type === 'pathologie') s = `épisode « ${n.libelle || '…'} » présent (ouvert ou fermé)`;
    if (n.type === 'medicament') { const a = atcList(n); s = n.libelle ? `traitement par « ${n.libelle} »` + (a.length ? ` (ATC ${a.join(' / ')})` : '') : a.length ? `traitement de classe ATC ${a.join(' / ')}` : 'traitement par « … »'; }
    if (n.type === 'vaccin') s = `vaccin « ${n.libelle || '…'} » ${n.statut === 'fait' ? 'fait' : 'non fait'}`;
    if (n.type === 'antecedent_familial') s = `antécédent familial « ${n.libelle || '…'} »${n.premier_degre ? ' (1ᵉʳ degré)' : ''}`;
    if (n.type === 'compte_rendu') s = `compte rendu « ${n.libelle || '…'} »${n.depuis_mois ? ` de moins de ${n.depuis_mois} mois` : ''}`;
    if (n.type === 'element_suivi') {
      const w = n.depuis_mois ? ` sur les ${n.depuis_mois} derniers mois` : '';
      s = n.op === 'existe' ? `« ${n.libelle || '…'} » a un résultat${w}` : n.op === 'absent' ? `« ${n.libelle || '…'} » sans résultat${w}`
        : `dernière valeur de « ${n.libelle || '…'} » ${SYM[n.op] || n.op} ${v(n.valeur)}${w}`;
    }
    return n.non ? `NON (${s})` : s;
  }
  function decrireArbre(n) {
    if (!n.conditions) return decrireCondition(n);
    const k = n.conditions.map(decrireArbre);
    const s = k.length ? (k.length > 1 ? '(' + k.join(` ${n.op} `) + ')' : k[0]) : '(aucune condition)';
    return n.non ? `NON ${s}` : s;
  }

  /* ---- Évaluation des conditions ---- */
  function evalCondition(n, P, today) {
    let ok = false;
    if (n.type === 'age') { const a = age(P, today); ok = n.op === '=' ? a === +n.valeur : n.op === '>=' ? a >= n.valeur : n.op === '<=' ? a <= n.valeur : n.op === '>' ? a > n.valeur : n.op === '<' ? a < n.valeur : (a >= n.valeur && a <= n.valeur2); }
    else if (n.type === 'sexe') ok = P.sexe === n.valeur;
    else if (n.type === 'pathologie') ok = has(P.episodes.map(e => e.l), n.libelle);
    else if (n.type === 'medicament') ok = P.traitements.some(t => medMatch(n, t));
    else if (n.type === 'vaccin') { const f = (P.vaccins || []).some(x => norm(x.libelle).includes(norm(n.libelle))); ok = n.statut === 'fait' ? f : !f; }
    else if (n.type === 'antecedent_familial') ok = (P.atcdFam || []).some(x => norm(x.l).includes(norm(n.libelle)) && (!n.premier_degre || estPremierDegre(x.lien)));
    else if (n.type === 'compte_rendu') { const lim = n.depuis_mois ? addMonths(today, -n.depuis_mois) : '0000'; ok = (P.documents || []).some(d => norm(d.libelle).includes(norm(n.libelle)) && d.date >= lim && d.date <= today); }
    else if (n.type === 'element_suivi') {
      const l = lastOf(P, [n.libelle || ''], today, n.depuis_mois);
      if (n.op === 'existe') ok = !!l; else if (n.op === 'absent') ok = !l;
      else if (l) { const x = +l.val, y = +n.valeur; ok = n.op === '>' ? x > y : n.op === '>=' ? x >= y : n.op === '<' ? x < y : n.op === '<=' ? x <= y : x === y; }
    }
    return n.non ? !ok : ok;
  }
  function evalArbre(n, P, today) {
    if (!n.conditions) return { ok: evalCondition(n, P, today), t: decrireCondition(n) };
    const k = n.conditions.map(c => evalArbre(c, P, today));
    let ok = k.length ? (n.op === 'ET' ? k.every(x => x.ok) : k.some(x => x.ok)) : false;
    if (n.non) ok = !ok;
    return { ok, t: `${n.non ? 'NON ' : ''}${n.op}${k.length ? '' : ' (vide)'}`, k };
  }
  /* traitement déclencheur : premier traitement du patient correspondant à une condition « médicament » positive de la règle */
  function traitementDeclencheur(n, P) {
    const feuilles = []; (function walk(x, neg) { if (x.conditions) x.conditions.forEach(c => walk(c, neg !== !!x.non)); else if (x.type === 'medicament' && !(neg !== !!x.non)) feuilles.push(x); })(n, false);
    for (const f of feuilles) { const t = P.traitements.find(t => medMatch(f, t)); if (t) return t; }
    return null;
  }

  // Un « traitement » à générer est déjà fait si le patient le prend : sa date de début joue le rôle du dernier résultat
  function dernierTraitement(P, nom) {
    const t = P.traitements.filter(x => norm(x.label).includes(norm(nom))).sort((a, b) => b.debut.localeCompare(a.debut))[0];
    return t ? { date: t.debut, lib: t.label, val: t.label, unit: '' } : undefined;
  }

  /* ---- Fréquences ---- */
  // T0 = début ; Jn = n jours ; Sn ou Sn-m = semaines (borne basse) ; Mn = n mois
  const jalonJours = j => j === 'T0' ? 0 : j[0] === 'J' ? +j.slice(1) : j[0] === 'M' ? Math.round(+j.slice(1) * 30.4375) : +j.slice(1).split('-')[0] * 7;
  const frequenceJours = f => Math.round(f.valeur * UNIT[f.unite]);

  /* ---- Correspondances « élément cherché » ↔ « élément à prescrire » ---- */
  function correspondances(rules) {
    const presc2ch = {}, ch2presc = [];
    rules.forEach(r => (r.alors || []).forEach(a => { const o = a.action === 'ordonnance' ? a : a.ordonnance; if (!o || !o.cherche) return;
      Object.entries(o.cherche).forEach(([ex, ch]) => { (presc2ch[nk(ex)] ??= []).push(ch); ch2presc.push([ch, ex]); }); }));
    return { presc2ch, ch2presc };
  }
  function cleDepuisLibelle(label, rules) {
    const n = norm(label), f = correspondances(rules).ch2presc.find(([c]) => sameLabel(c, label) || n === norm(c));
    return f ? nk(f[1]) : nk(label);
  }

  /* ---- Plan de soins fusionné ---- */
  function planifier(rules, P, ctx) {
    const today = ctx.today, overrides = ctx.overrides || {}, patientPer = ctx.patientPer || {}, prescrit = ctx.prescrit || {};
    const { presc2ch } = correspondances(rules);
    const ev = [], indicateurs = [], map = {};
    const ensure = (lab, canal) => map[nk(lab)] ??= { key: nk(lab), label: lab, canal, srcs: [] };
    for (const r of rules) {
      if (r.actif === false) { ev.push({ r, ev: { ok: false, inactive: true, t: 'règle désactivée' } }); continue; }
      const e = evalArbre(r.quand, P, today), treat = traitementDeclencheur(r.quand, P);
      e.treat = treat; ev.push({ r, ev: e }); if (!e.ok) continue;
      const inst = !!treat && today < addDays(treat.debut, 365.25), start = treat ? treat.debut : today;
      (r.alors || []).forEach((a, ai) => {
        if (a.action === 'indicateur_prevention') indicateurs.push({ r, libelle: a.libelle, niveau: a.niveau, ordonnance: a.ordonnance || null });
        const o = a.action === 'ordonnance' ? a : a.ordonnance; if (!o) return;
        if (o.phase === 'instauration' && !inst) return;
        if (o.phase === 'entretien' && inst) return;
        const canal = { biologie: 'biologie', imagerie: 'imagerie', traitement: 'traitement' }[o.categorie] || 'prevention', f = o.frequence;
        o.examens.forEach(ex => {
          const w = ensure(ex, canal), ch = o.cherche && o.cherche[ex];
          if (f.mode === 'tous_les') { const k = `${r.id}|${ai}|${nk(ex)}`, livre = frequenceJours(f), ov = overrides[k];
            w.srcs.push({ r, phase: o.phase === 'instauration' ? 'instauration' : 'entretien', days: ov ?? livre, livre, mod: ov != null, ch, ovKey: k }); }
          else if (f.mode === 'jalons') w.srcs.push({ r, phase: 'instauration', jal: f.jalons, start, ch });
          else w.srcs.push({ r, phase: 'entretien', once: true, ch });
        });
      });
    }
    const rows = Object.values(map);
    for (const w of rows) {
      const labels = [...new Set([...w.srcs.map(s => s.ch).filter(Boolean), ...(presc2ch[w.key] || []), w.label])];
      w.last = w.canal === 'traitement' ? dernierTraitement(P, w.label) : lastOf(P, labels, today);
      const per = w.srcs.filter(s => s.days).map(s => s.days), pat = patientPer[w.key]; w.pat = pat;
      let pd = per.slice(); if (pat != null) pd = ctx.policy === 'patient' ? [pat] : [...pd, pat];
      const c = []; w.never = false; w.jal = []; w.planDone = false;
      if (pd.length) { w.days = Math.min(...pd); if (w.last) c.push(addDays(w.last.date, w.days)); else { c.push(today); w.never = true; } }
      for (const s of w.srcs.filter(s => s.jal)) {
        const ds = s.jal.map(j => addDays(s.start, jalonJours(j)));
        w.jal.push(...s.jal.map((j, i) => j + ' (' + ds[i].split('-').reverse().join('/') + ')'));
        const nx = ds.find(d => !w.last || w.last.date < addDays(d, -30));
        if (nx) { c.push(nx); if (!w.last) w.never = true; } else w.planDone = true;
      }
      if (w.srcs.some(s => s.once)) { if (!w.last) { c.push(today); w.never = true; } else w.planDone = true; }
      w.due = c.length ? c.sort()[0] : null;
      const pr = prescrit[w.key]; w.prescrit = pr && (!w.last || w.last.date < pr) ? pr : null;
      w.st = !w.due ? 'na' : w.prescrit ? 'presc' : w.due <= today ? 'late' : w.due <= addDays(today, 30) ? 'soon' : 'ok';
    }
    rows.sort((a, b) => (a.due || '9').localeCompare(b.due || '9'));
    return { ev, rows, bio: rows.filter(x => x.canal === 'biologie'), imagerie: rows.filter(x => x.canal === 'imagerie'), traitement: rows.filter(x => x.canal === 'traitement'), prev: rows.filter(x => x.canal === 'prevention'), indicateurs };
  }
  return { planifier, evalArbre, evalCondition, decrireArbre, decrireCondition, cleDepuisLibelle, correspondances,
    traitementDeclencheur, age, norm, nk, addDays, addMonths, diffDays, frequenceJours, jalonJours, UNIT };
});
