'use strict';
/*
 * Verbentrainer: Formen werden aus Regeln erzeugt, Ausnahmen stehen ausdrücklich in der Liste.
 * Gestaffelt nach Ecco più 1–3: jede Zeit und jedes Verb hat einen Band, ab dem es geübt wird (kumulativ).
 *   Band 1: Presente, Passato prossimo · Band 2: Imperfetto, Futuro, Condizionale, Imperativo, stare + Gerundio,
 *   Trapassato prossimo, Congiuntivo presente (laut Verbtabelle im Anhang von Band 2) · Band 3: Congiuntivo
 *   passato/imperfetto/trapassato, Condizionale passato.
 * Übungen: Tabelle, Blitzrunde, Im Satz (tippen), Welche Form? (antippen), Hilfsverb und Partizip.
 */
const VB_PERSONS = ['io', 'tu', 'lui / lei', 'noi', 'voi', 'loro'];
const VB_IMP_PERSONS = ['tu', 'Lei', 'noi', 'voi'];
/* [Schlüssel, Name, ab Band] */
const VB_TENSES = [
  ['pres', 'Presente', 1],
  ['pp', 'Passato prossimo', 1],
  ['impf', 'Imperfetto', 2],
  ['fut', 'Futuro', 2],
  ['cond', 'Condizionale', 2],
  ['imp', 'Imperativo', 2],
  ['ger', 'stare + Gerundio', 2],
  ['trap', 'Trapassato prossimo', 2],
  ['cong', 'Congiuntivo presente', 2],
  ['congp', 'Congiuntivo passato', 3],
  ['congi', 'Congiuntivo imperfetto', 3],
  ['congt', 'Congiuntivo trapassato', 3],
  ['condp', 'Condizionale passato', 3]
];
const VB_BANDS = [[1, 'Ecco più 1'], [2, 'Ecco più 2'], [3, 'Ecco più 3']];
const vbPersons = t => (t === 'imp' ? VB_IMP_PERSONS : VB_PERSONS);
const VB_GROUPS = [
  ['reg', 'Regelmäßig'],
  ['aux', 'Hilfs- und Modalverben'],
  ['irr', 'Unregelmäßig'],
  ['refl', 'Reflexiv'],
  ['all', 'Alle']
];
/* [Infinitiv, Deutsch, Gruppe, Klasse, Besonderheiten, ab Band (Standard 1)] – Klasse: are | ere | ire | isc
   Besonderheiten: aux, pp, pres, impf (Stamm oder Formen), fut (Stamm), cong/congi/imp (Formen), ger, noImp, noGer */
const VB_DATA = [
  ['parlare', 'sprechen', 'reg', 'are', {}],
  ['abitare', 'wohnen', 'reg', 'are', {}],
  ['lavorare', 'arbeiten', 'reg', 'are', {}],
  ['comprare', 'kaufen', 'reg', 'are', {}],
  ['guardare', 'ansehen', 'reg', 'are', {}],
  ['ascoltare', 'zuhören', 'reg', 'are', {}],
  ['studiare', 'lernen, studieren', 'reg', 'are', { fut: 'studier' }],
  ['mangiare', 'essen', 'reg', 'are', {}],
  ['cominciare', 'beginnen', 'reg', 'are', {}],
  ['cercare', 'suchen', 'reg', 'are', {}],
  ['giocare', 'spielen', 'reg', 'are', {}],
  ['pagare', 'bezahlen', 'reg', 'are', {}],
  ['arrivare', 'ankommen', 'reg', 'are', { aux: 'essere' }],
  ['tornare', 'zurückkehren', 'reg', 'are', { aux: 'essere' }],
  ['vendere', 'verkaufen', 'reg', 'ere', {}],
  ['prendere', 'nehmen', 'reg', 'ere', { pp: 'preso' }],
  ['scrivere', 'schreiben', 'reg', 'ere', { pp: 'scritto' }],
  ['leggere', 'lesen', 'reg', 'ere', { pp: 'letto' }],
  ['chiedere', 'fragen', 'reg', 'ere', { pp: 'chiesto' }],
  ['mettere', 'stellen, legen', 'reg', 'ere', { pp: 'messo' }],
  ['rispondere', 'antworten', 'reg', 'ere', { pp: 'risposto' }],
  ['vedere', 'sehen', 'reg', 'ere', { pp: 'visto', fut: 'vedr' }],
  ['vivere', 'leben', 'reg', 'ere', { pp: 'vissuto', fut: 'vivr' }],
  ['conoscere', 'kennen', 'reg', 'ere', { pp: 'conosciuto', pres: ['conosco', 'conosci', 'conosce', 'conosciamo', 'conoscete', 'conoscono'] }],
  ['sentire', 'hören, fühlen', 'reg', 'ire', {}],
  ['dormire', 'schlafen', 'reg', 'ire', {}],
  ['partire', 'abfahren', 'reg', 'ire', { aux: 'essere' }],
  ['aprire', 'öffnen', 'reg', 'ire', { pp: 'aperto' }],
  ['offrire', 'anbieten', 'reg', 'ire', { pp: 'offerto' }],
  ['capire', 'verstehen', 'reg', 'isc', {}],
  ['finire', 'beenden', 'reg', 'isc', {}],
  ['preferire', 'vorziehen', 'reg', 'isc', {}],
  ['pulire', 'putzen', 'reg', 'isc', {}],
  ['essere', 'sein', 'aux', 'ere', {
    aux: 'essere', pp: 'stato', pres: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'],
    impf: ['ero', 'eri', 'era', 'eravamo', 'eravate', 'erano'], fut: 'sar', ger: 'essendo',
    cong: ['sia', 'sia', 'sia', 'siamo', 'siate', 'siano'], congi: ['fossi', 'fossi', 'fosse', 'fossimo', 'foste', 'fossero'],
    imp: [['sii'], ['sia'], ['siamo'], ['siate']], noGer: true
  }],
  ['avere', 'haben', 'aux', 'ere', {
    pp: 'avuto', pres: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'], fut: 'avr',
    cong: ['abbia', 'abbia', 'abbia', 'abbiamo', 'abbiate', 'abbiano'], imp: [['abbi'], ['abbia'], ['abbiamo'], ['abbiate']], noGer: true
  }],
  ['potere', 'können', 'aux', 'ere', {
    pp: 'potuto', pres: ['posso', 'puoi', 'può', 'possiamo', 'potete', 'possono'], fut: 'potr', noImp: true, noGer: true
  }],
  ['volere', 'wollen', 'aux', 'ere', {
    pp: 'voluto', pres: ['voglio', 'vuoi', 'vuole', 'vogliamo', 'volete', 'vogliono'], fut: 'vorr', noImp: true, noGer: true
  }],
  ['dovere', 'müssen', 'aux', 'ere', {
    pp: 'dovuto', pres: ['devo', 'devi', 'deve', 'dobbiamo', 'dovete', 'devono'], fut: 'dovr', noImp: true, noGer: true,
    cong: [['debba', 'deva'], ['debba', 'deva'], ['debba', 'deva'], 'dobbiamo', 'dobbiate', ['debbano', 'devano']]
  }],
  ['sapere', 'wissen, können', 'aux', 'ere', {
    pp: 'saputo', pres: ['so', 'sai', 'sa', 'sappiamo', 'sapete', 'sanno'], fut: 'sapr', noGer: true,
    cong: ['sappia', 'sappia', 'sappia', 'sappiamo', 'sappiate', 'sappiano'], imp: [['sappi'], ['sappia'], ['sappiamo'], ['sappiate']]
  }],
  ['andare', 'gehen, fahren', 'irr', 'are', {
    aux: 'essere', pres: ['vado', 'vai', 'va', 'andiamo', 'andate', 'vanno'], fut: 'andr',
    imp: [["va'", 'vai'], ['vada'], ['andiamo'], ['andate']]
  }],
  ['venire', 'kommen', 'irr', 'ire', {
    aux: 'essere', pp: 'venuto', pres: ['vengo', 'vieni', 'viene', 'veniamo', 'venite', 'vengono'], fut: 'verr'
  }],
  ['fare', 'machen, tun', 'irr', 'are', {
    pp: 'fatto', pres: ['faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno'], impf: 'facev', fut: 'far',
    imp: [["fa'", 'fai'], ['faccia'], ['facciamo'], ['fate']]
  }],
  ['dare', 'geben', 'irr', 'are', {
    pp: 'dato', pres: ['do', 'dai', 'dà', 'diamo', 'date', 'danno'], fut: 'dar',
    cong: ['dia', 'dia', 'dia', 'diamo', 'diate', 'diano'], congi: ['dessi', 'dessi', 'desse', 'dessimo', 'deste', 'dessero'],
    imp: [["da'", 'dai'], ['dia'], ['diamo'], ['date']]
  }],
  ['stare', 'sein, bleiben, sich befinden', 'irr', 'are', {
    aux: 'essere', pres: ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno'], fut: 'star', noGer: true,
    cong: ['stia', 'stia', 'stia', 'stiamo', 'stiate', 'stiano'], congi: ['stessi', 'stessi', 'stesse', 'stessimo', 'steste', 'stessero'],
    imp: [["sta'", 'stai'], ['stia'], ['stiamo'], ['state']]
  }],
  ['dire', 'sagen', 'irr', 'ire', {
    pp: 'detto', pres: ['dico', 'dici', 'dice', 'diciamo', 'dite', 'dicono'], impf: 'dicev', fut: 'dir',
    imp: [["di'"], ['dica'], ['diciamo'], ['dite']]
  }],
  ['uscire', 'ausgehen, hinausgehen', 'irr', 'ire', {
    aux: 'essere', pres: ['esco', 'esci', 'esce', 'usciamo', 'uscite', 'escono']
  }],
  ['bere', 'trinken', 'irr', 'ere', {
    pp: 'bevuto', pres: ['bevo', 'bevi', 'beve', 'beviamo', 'bevete', 'bevono'], impf: 'bevev', fut: 'berr'
  }],
  ['scegliere', 'wählen', 'irr', 'ere', {
    pp: 'scelto', pres: ['scelgo', 'scegli', 'sceglie', 'scegliamo', 'scegliete', 'scelgono']
  }],
  ['tenere', 'halten', 'irr', 'ere', {
    pp: 'tenuto', pres: ['tengo', 'tieni', 'tiene', 'teniamo', 'tenete', 'tengono'], fut: 'terr'
  }],
  ['rimanere', 'bleiben', 'irr', 'ere', {
    aux: 'essere', pp: 'rimasto', pres: ['rimango', 'rimani', 'rimane', 'rimaniamo', 'rimanete', 'rimangono'], fut: 'rimarr'
  }],
  ['salire', 'hinaufgehen, einsteigen', 'irr', 'ire', {
    aux: 'essere', pres: ['salgo', 'sali', 'sale', 'saliamo', 'salite', 'salgono']
  }],
  ['piacere', 'gefallen', 'irr', 'ere', {
    aux: 'essere', pp: 'piaciuto', pres: ['piaccio', 'piaci', 'piace', 'piacciamo', 'piacete', 'piacciono']
  }],
  ['togliere', 'entfernen, ausziehen', 'irr', 'ere', {
    pp: 'tolto', pres: ['tolgo', 'togli', 'toglie', 'togliamo', 'togliete', 'tolgono']
  }],
  ['raccogliere', 'sammeln, aufheben', 'irr', 'ere', {
    pp: 'raccolto', pres: ['raccolgo', 'raccogli', 'raccoglie', 'raccogliamo', 'raccogliete', 'raccolgono']
  }],
  ['cadere', 'fallen', 'irr', 'ere', {
    aux: 'essere', pp: 'caduto', fut: 'cadr'
  }],
  ['valere', 'gelten, wert sein', 'irr', 'ere', {
    aux: 'essere', pp: 'valso', pres: ['valgo', 'vali', 'vale', 'valiamo', 'valete', 'valgono'], fut: 'varr'
  }],
  ['porre', 'legen, stellen', 'irr', 'ere', {
    pp: 'posto', pres: ['pongo', 'poni', 'pone', 'poniamo', 'ponete', 'pongono'], impf: 'ponev', fut: 'porr'
  }],
  ['chiamarsi', 'heißen', 'refl', 'are', {}],
  ['alzarsi', 'aufstehen', 'refl', 'are', {}],
  ['lavarsi', 'sich waschen', 'refl', 'are', {}],
  ['svegliarsi', 'aufwachen', 'refl', 'are', {}],
  ['vestirsi', 'sich anziehen', 'refl', 'ire', {}],
  ['divertirsi', 'sich amüsieren', 'refl', 'ire', {}],
  ['sentirsi', 'sich fühlen', 'refl', 'ire', {}],
  ['mettersi', 'sich (etw.) anziehen, sich setzen', 'refl', 'ere', { pp: 'messo' }],
  // Ecco più 3 (in der Lista cronologica blau oder mit besonderen Formen)
  ['accettare', 'annehmen', 'reg', 'are', {}, 3],
  ['apprezzare', 'schätzen', 'reg', 'are', {}, 3],
  ['realizzare', 'verwirklichen', 'reg', 'are', {}, 3],
  ['impiegare', 'verwenden, brauchen', 'reg', 'are', {}, 3],
  ['ricercare', 'suchen, nachsehen', 'reg', 'are', {}, 3],
  ['praticare', 'ausüben, treiben', 'reg', 'are', {}, 3],
  ['temere', 'fürchten', 'reg', 'ere', {}, 3],
  ['sbattere', 'stoßen, knallen', 'reg', 'ere', {}, 3],
  ['difendere', 'verteidigen', 'reg', 'ere', { pp: 'difeso' }, 3],
  ['proteggere', 'schützen', 'reg', 'ere', { pp: 'protetto' }, 3],
  ['reggere', 'standhalten', 'reg', 'ere', { pp: 'retto' }, 3],
  ['risolvere', 'lösen', 'reg', 'ere', { pp: 'risolto' }, 3],
  ['travolgere', 'überrollen', 'reg', 'ere', { pp: 'travolto' }, 3],
  ['accrescere', 'vergrößern', 'reg', 'ere', { pp: 'accresciuto' }, 3],
  ['esplodere', 'explodieren', 'reg', 'ere', { pp: 'esploso', aux: 'essere' }, 3],
  ['sopravvivere', 'überleben', 'reg', 'ere', { pp: 'sopravvissuto', aux: 'essere', fut: 'sopravvivr' }, 3],
  ['abolire', 'abschaffen', 'reg', 'isc', {}, 3],
  ['distribuire', 'verteilen', 'reg', 'isc', {}, 3],
  ['cogliere', 'ergreifen, pflücken', 'irr', 'ere', {
    pp: 'colto', pres: ['colgo', 'cogli', 'coglie', 'cogliamo', 'cogliete', 'colgono']
  }, 3],
  ['proporre', 'vorschlagen', 'irr', 'ere', {
    pp: 'proposto', pres: ['propongo', 'proponi', 'propone', 'proponiamo', 'proponete', 'propongono'], impf: 'proponev', fut: 'proporr'
  }, 3],
  ['produrre', 'herstellen', 'irr', 'ere', {
    pp: 'prodotto', pres: ['produco', 'produci', 'produce', 'produciamo', 'producete', 'producono'], impf: 'producev', fut: 'produrr'
  }, 3],
  ['sostenere', 'unterstützen', 'irr', 'ere', {
    pp: 'sostenuto', pres: ['sostengo', 'sostieni', 'sostiene', 'sosteniamo', 'sostenete', 'sostengono'], fut: 'sosterr'
  }, 3],
  ['appartenere', 'gehören', 'irr', 'ere', {
    aux: 'essere', pp: 'appartenuto', pres: ['appartengo', 'appartieni', 'appartiene', 'apparteniamo', 'appartenete', 'appartengono'], fut: 'apparterr', noImp: true, noGer: true
  }, 3],
  ['intervenire', 'einschreiten', 'irr', 'ire', {
    aux: 'essere', pp: 'intervenuto', pres: ['intervengo', 'intervieni', 'interviene', 'interveniamo', 'intervenite', 'intervengono'], fut: 'interverr'
  }, 3],
  ['morire', 'sterben', 'irr', 'ire', {
    aux: 'essere', pp: 'morto', pres: ['muoio', 'muori', 'muore', 'moriamo', 'morite', 'muoiono'], noImp: true
  }, 3],
  ['stupirsi', 'sich wundern', 'refl', 'isc', {}, 3],
  ['concentrarsi', 'sich konzentrieren', 'refl', 'are', {}, 3],
  ['abituarsi', 'sich gewöhnen', 'refl', 'are', {}, 3]
];
/* Ab Band 2: weitere unregelmäßige Verben; ohne Imperativ/Gerundio, wo er im Unterricht nicht vorkommt. */
const VB_LATER = { scegliere: 2, tenere: 2, rimanere: 2, salire: 2, piacere: 2, togliere: 2, raccogliere: 2, cadere: 2, valere: 2, porre: 2, offrire: 2, vivere: 1 };
const VB_NO = { piacere: { noImp: true, noGer: true }, valere: { noImp: true, noGer: true }, cadere: { noImp: true } };
const VB_REFL = ['mi', 'ti', 'si', 'ci', 'vi', 'si'];
const VB_ENDINGS = {
  are: ['o', 'i', 'a', 'iamo', 'ate', 'ano'],
  ere: ['o', 'i', 'e', 'iamo', 'ete', 'ono'],
  ire: ['o', 'i', 'e', 'iamo', 'ite', 'ono'],
  isc: ['isco', 'isci', 'isce', 'iamo', 'ite', 'iscono']
};


const VB_AUX = {
  essere: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'],
  avere: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno']
};
/* Hilfsverb je zusammengesetzter Zeit */
const VB_AUX_T = {
  pp: VB_AUX,
  trap: { essere: ['ero', 'eri', 'era', 'eravamo', 'eravate', 'erano'], avere: ['avevo', 'avevi', 'aveva', 'avevamo', 'avevate', 'avevano'] },
  congp: { essere: ['sia', 'sia', 'sia', 'siamo', 'siate', 'siano'], avere: ['abbia', 'abbia', 'abbia', 'abbiamo', 'abbiate', 'abbiano'] },
  congt: { essere: ['fossi', 'fossi', 'fosse', 'fossimo', 'foste', 'fossero'], avere: ['avessi', 'avessi', 'avesse', 'avessimo', 'aveste', 'avessero'] },
  condp: { essere: ['sarei', 'saresti', 'sarebbe', 'saremmo', 'sareste', 'sarebbero'], avere: ['avrei', 'avresti', 'avrebbe', 'avremmo', 'avreste', 'avrebbero'] }
};
const VB_STARE = ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno'];
const vbList6 = x => (Array.isArray(x) ? x : [x]);

/* Verbliste mit fertigen Formen: { inf, de, group, band, aux, pp, tenses: { pres: [[Varianten] × 6], ... } } */
function vbBuild([inf, de, group, cls, o0, band0]) {
  const o = Object.assign({}, o0, VB_NO[inf] || {});
  const band = band0 || VB_LATER[inf] || 1;
  const refl = inf.endsWith('si');
  const base = refl ? inf.slice(0, -2) + 'e' : inf;
  let stem = base.slice(0, -3);
  const ends = VB_ENDINGS[cls];
  const join = (s, e) => (s.endsWith('i') && e.startsWith('i') ? s + e.slice(1) : s + e);
  // -care/-gare: h vor e/i
  const hard = /[cg]$/.test(stem) && cls === 'are';
  const pres = o.pres || ends.map(e => (hard && /^[ie]/.test(e) ? stem + 'h' + e : join(stem, e)));
  const impfStem = typeof o.impf === 'string' ? o.impf : stem + (cls === 'are' ? 'av' : cls === 'ere' ? 'ev' : 'iv');
  const impf = Array.isArray(o.impf) ? o.impf : ['o', 'i', 'a', 'amo', 'ate', 'ano'].map(e => impfStem + e);
  let fs = o.fut;
  if (!fs) {
    if (cls === 'are') fs = (hard ? stem + 'h' : /[cg]i$/.test(stem) ? stem.slice(0, -1) : /i$/.test(stem) && !o.keepI ? stem.slice(0, -1) : stem) + 'er';
    else fs = stem + (cls === 'ere' ? 'er' : 'ir');
    if (cls === 'are' && /[cg]$/.test(stem) && !hard) fs = stem + 'er';
  }
  const fut = ['ò', 'ai', 'à', 'emo', 'ete', 'anno'].map(e => fs + e);
  const cond = ['ei', 'esti', 'ebbe', 'emmo', 'este', 'ebbero'].map(e => fs + e);
  // Congiuntivo presente: aus der 1. Person Präsens (vado → vada) bzw. regelmäßig
  let cong = o.cong;
  if (!cong) {
    let sg;
    if (o.pres) sg = pres[0].replace(/o$/, 'a');
    else if (cls === 'are') sg = hard ? stem + 'hi' : join(stem, 'i');
    else if (cls === 'isc') sg = stem + 'isca';
    else sg = stem + 'a';
    cong = [sg, sg, sg, pres[3], pres[3].replace(/iamo$/, 'iate'), sg + 'no'];
  }
  cong = cong.map(vbList6);
  const congi = (o.congi || ['ssi', 'ssi', 'sse', 'ssimo', 'ste', 'ssero'].map(e => impfStem.replace(/v$/, '') + e)).map(vbList6);
  // Imperativo: tu, Lei, noi, voi
  let imp = null;
  if (!o.noImp) {
    imp = o.imp || [
      [cls === 'are' ? pres[2] : pres[1]],
      cong[2],
      [pres[3]],
      [pres[4]]
    ];
    if (refl) imp = [imp[0].map(f => f + 'ti'), imp[1].map(f => 'si ' + f), imp[2].map(f => f + 'ci'), imp[3].map(f => f + 'vi')];
  }
  // Gerundio mit stare
  const gerF = o.ger || (typeof o.impf === 'string' && /ev$/.test(o.impf) ? o.impf.slice(0, -2) + 'endo' : stem + (cls === 'are' ? 'ando' : 'endo'));
  const aux = o.aux || 'avere';
  const pp = o.pp || stem + (cls === 'are' ? 'ato' : cls === 'ere' ? 'uto' : 'ito');
  const ppForms = person => {
    if (aux !== 'essere' && !refl) return [pp];
    const m = pp.replace(/o$/, '');
    return person < 3 ? [m + 'o', m + 'a'] : [m + 'i', m + 'e'];
  };
  const auxKey = refl ? 'essere' : aux;
  const compound = t => VB_PERSONS.map((_, i) => ppForms(i).map(p => VB_AUX_T[t][auxKey][i] + ' ' + p));
  const tenses = {
    pres: pres.map(x => [x]),
    pp: compound('pp'),
    impf: impf.map(x => [x]),
    fut: fut.map(x => [x]),
    cond: cond.map(x => [x]),
    trap: compound('trap'),
    cong,
    congp: compound('congp'),
    congi,
    congt: compound('congt'),
    condp: compound('condp')
  };
  if (!o.noGer) tenses.ger = VB_STARE.map(s => [s + ' ' + gerF]);
  if (refl) {
    Object.keys(tenses).forEach(k => {
      tenses[k] = tenses[k].map((forms, i) => forms.map(f => VB_REFL[i] + ' ' + f));
    });
  }
  if (imp) tenses.imp = imp;
  return { inf, de, group, band, tenses, pp, aux: auxKey };
}
const VB_VERBS = VB_DATA.map(vbBuild);

/* Sätze für „Im Satz“ und „Welche Form?“: [Band, Zeit, Verb, Person, Satz mit ___ ]. Person bei imp: 0 tu, 1 Lei, 2 noi, 3 voi. */
const VB_SENT = [
  [1, 'pres', 'prendere', 0, 'Ogni mattina (io) ___ l’autobus alle sette.'],
  [1, 'pres', 'giocare', 2, 'Marco ___ a calcio il sabato.'],
  [1, 'pres', 'capire', 4, 'Ragazzi, ___ l’esercizio?'],
  [1, 'pres', 'vivere', 5, 'I miei nonni ___ in campagna.'],
  [1, 'pres', 'uscire', 3, 'Stasera (noi) ___ con gli amici.'],
  [1, 'pres', 'venire', 1, '___ (tu) alla festa sabato?'],
  [1, 'pres', 'fare', 4, 'Che cosa ___ (voi) nel tempo libero?'],
  [1, 'pres', 'sapere', 0, 'Non ___ (io) la risposta.'],
  [1, 'pres', 'andare', 2, 'Giulia ___ a scuola in bici.'],
  [1, 'pres', 'cercare', 3, '(Noi) ___ un regalo per Sara.'],
  [1, 'pres', 'dire', 5, 'I miei amici ___ sempre la verità.'],
  [1, 'pres', 'alzarsi', 0, 'La mattina (io) ___ alle sei.'],
  [1, 'pres', 'dovere', 1, '___ (tu) studiare di più.'],
  [1, 'pres', 'bere', 4, '___ (voi) un caffè?'],
  [1, 'pres', 'finire', 0, '(Io) ___ i compiti alle cinque.'],
  [1, 'pres', 'pagare', 1, 'Oggi ___ tu il gelato?'],
  [1, 'pp', 'mangiare', 0, 'Ieri (io) ___ una pizza con Luca.'],
  [1, 'pp', 'andare', 2, 'Sabato scorso Anna ___ al cinema.'],
  [1, 'pp', 'vedere', 3, '(Noi) ___ un film bellissimo.'],
  [1, 'pp', 'arrivare', 4, 'A che ora ___ (voi) a scuola?'],
  [1, 'pp', 'scrivere', 5, 'I ragazzi ___ una lettera alla nonna.'],
  [1, 'pp', 'leggere', 1, '___ (tu) il libro per domani?'],
  [1, 'pp', 'svegliarsi', 0, 'Stamattina (io) ___ tardi.'],
  [1, 'pp', 'partire', 5, 'I miei genitori ___ per Roma.'],
  [1, 'pp', 'fare', 1, 'Che cosa ___ (tu) ieri sera?'],
  [1, 'pp', 'tornare', 2, 'Luca ___ a casa a mezzanotte.'],
  [2, 'impf', 'giocare', 0, 'Da piccolo (io) ___ sempre in giardino.'],
  [2, 'impf', 'dormire', 3, 'In vacanza (noi) ___ fino a tardi.'],
  [2, 'impf', 'studiare', 1, 'Mentre (tu) ___, io cucinavo.'],
  [2, 'impf', 'essere', 2, 'Mia nonna ___ una donna molto paziente.'],
  [2, 'impf', 'scrivere', 5, 'Una volta le persone ___ lettere, non messaggi.'],
  [2, 'impf', 'fare', 4, 'Che cosa ___ (voi) da bambini?'],
  [2, 'fut', 'andare', 0, 'L’anno prossimo (io) ___ in Italia.'],
  [2, 'fut', 'fare', 2, 'Domani ___ bel tempo.'],
  [2, 'fut', 'venire', 4, 'Domani ___ (voi) alla festa?'],
  [2, 'fut', 'finire', 5, 'Fra due anni i miei amici ___ la scuola.'],
  [2, 'fut', 'essere', 1, 'Dopo il viaggio ___ (tu) stanco.'],
  [2, 'cond', 'volere', 0, '(Io) ___ un gelato al limone, per favore.'],
  [2, 'cond', 'dovere', 1, '___ (tu) dormire di più.'],
  [2, 'cond', 'parlare', 2, 'Al posto tuo, Marco ___ con la prof.'],
  [2, 'cond', 'potere', 3, 'Domenica (noi) ___ andare al mare.'],
  [2, 'cond', 'dare', 4, 'Mi ___ (voi) una mano?'],
  [2, 'imp', 'ascoltare', 0, 'Luca, ___ bene!'],
  [2, 'imp', 'prendere', 1, 'Signora, ___ pure una sedia!'],
  [2, 'imp', 'aprire', 3, 'Ragazzi, ___ il libro a pagina venti!'],
  [2, 'imp', 'venire', 0, 'Giulia, ___ qui, per favore!'],
  [2, 'imp', 'andare', 2, 'È una bella giornata: ___ al parco!'],
  [2, 'imp', 'fare', 0, 'Marco, ___ attenzione!'],
  [2, 'imp', 'alzarsi', 0, 'Sara, ___, è tardi!'],
  [2, 'ger', 'mangiare', 0, 'Non posso parlare, ___.'],
  [2, 'ger', 'fare', 1, 'Che cosa ___ (tu) in questo momento?'],
  [2, 'ger', 'giocare', 5, 'I bambini ___ in cortile.'],
  [2, 'ger', 'parlare', 2, 'Silenzio, la prof ___.'],
  [2, 'trap', 'partire', 2, 'Quando siamo arrivati alla stazione, il treno ___.'],
  [2, 'trap', 'mangiare', 0, 'Non avevo fame perché ___ (io) un panino.'],
  [2, 'trap', 'leggere', 2, 'Anna mi ha detto che ___ il libro.'],
  [2, 'cong', 'avere', 2, 'Penso che Luca ___ ragione.'],
  [2, 'cong', 'stare', 1, 'Spero che (tu) ___ meglio.'],
  [2, 'cong', 'arrivare', 3, 'È importante che (noi) ___ in orario.'],
  [2, 'cong', 'essere', 5, 'Credo che i miei genitori ___ a casa.'],
  [2, 'cong', 'essere', 0, 'Benché (io) ___ stanco, esco con gli amici.'],
  [2, 'cong', 'fare', 4, 'Voglio che (voi) ___ i compiti.'],
  [2, 'cong', 'partire', 1, 'Prima che (tu) ___, ti voglio salutare.'],
  [2, 'cong', 'sapere', 2, 'Non credo che Anna ___ la verità.'],
  [2, 'cong', 'capire', 5, 'Parlo piano affinché tutti ___.'],
  [3, 'cong', 'proteggere', 2, 'Spero che il comune ___ il centro storico.'],
  [3, 'cong', 'proporre', 4, 'È necessario che (voi) ___ una soluzione.'],
  [3, 'congi', 'essere', 1, 'Pensavo che (tu) ___ a casa.'],
  [3, 'congi', 'venire', 4, 'Volevo che (voi) ___ alla festa.'],
  [3, 'congi', 'avere', 0, 'Se (io) ___ più tempo, viaggerei di più.'],
  [3, 'congi', 'partire', 5, 'Temevo che i miei amici ___ senza di me.'],
  [3, 'congi', 'sapere', 3, 'Se (noi) ___ la risposta, te la diremmo.'],
  [3, 'congi', 'dormire', 2, 'Sembrava che Marco ___ ancora.'],
  [3, 'congi', 'fare', 1, 'Se (tu) ___ più sport, staresti meglio.'],
  [3, 'congi', 'sostenere', 5, 'Bisognava che tutti ___ il progetto.'],
  [3, 'congi', 'intervenire', 2, 'Se lo stato ___, la situazione migliorerebbe.'],
  [3, 'congp', 'partire', 2, 'Penso che Laura ___ ieri.'],
  [3, 'congp', 'finire', 1, 'Spero che (tu) ___ i compiti.'],
  [3, 'congp', 'capire', 5, 'È possibile che loro non ___ la domanda.'],
  [3, 'congt', 'sapere', 0, 'Se (io) l’___ prima, sarei venuto.'],
  [3, 'congt', 'studiare', 1, 'Se (tu) ___ di più, avresti passato l’esame.'],
  [3, 'congt', 'partire', 3, 'Se (noi) ___ prima, saremmo arrivati in tempo.'],
  [3, 'condp', 'accettare', 0, 'Al posto tuo (io) ___ l’invito.'],
  [3, 'condp', 'vedere', 3, 'Con più tempo (noi) ___ anche Napoli.'],
  [3, 'condp', 'arrivare', 2, 'Luca ha detto che ___ alle otto.'],
  [3, 'condp', 'dovere', 5, 'I miei amici ___ chiamare prima.'],
  [3, 'pp', 'risolvere', 3, 'Finalmente (noi) ___ il problema.'],
  [3, 'pp', 'travolgere', 2, 'La valanga ___ due sciatori.'],
  [3, 'pp', 'intervenire', 5, 'I pompieri ___ subito.'],
  [3, 'pres', 'produrre', 2, 'Questa azienda ___ biciclette.'],
  [3, 'cond', 'abolire', 0, '(Io) non ___ il Palio.'],
  [3, 'impf', 'stupirsi', 0, 'Ogni volta (io) ___ di quanto fosse bella Venezia.']
];
const VB_KEY = 'daje-verben-v1';
const VB_STATE = Object.assign({ band: 1, group: 'reg', tense: 'pres', verb: 'parlare', mode: 'table', quiz: null, checked: false, answers: [] }, (() => {
  try {
    const x = JSON.parse(localStorage.getItem(VB_KEY) || '{}');
    return { band: [1, 2, 3].includes(x.band) ? x.band : 1, mode: x.mode || 'table' };
  } catch (e) {
    return {};
  }
})());
const vbSave = () => {
  try {
    localStorage.setItem(VB_KEY, JSON.stringify({ band: VB_STATE.band, mode: VB_STATE.mode }));
  } catch (e) {}
};
const vbNorm = x => String(x).normalize('NFC').toLocaleLowerCase().replace(/[’‘`´]/g, "'").replace(/\s+/g, ' ').trim().replace(/[.!?,;]+$/, '');
const vbPlain = x => vbNorm(x).normalize('NFD').replace(/[̀-ͯ]/g, '');
function vbJudge(forms, raw) {
  const v = vbNorm(raw);
  if (!v) return 'empty';
  if (forms.some(f => vbNorm(f) === v)) return 'ok';
  if (forms.some(f => vbPlain(f) === vbPlain(v))) return 'accent';
  return 'wrong';
}
const vbTenseName = k => (VB_TENSES.find(t => t[0] === k) || [k, k])[1];
const vbTensesFor = band => VB_TENSES.filter(t => t[2] <= band);
const vbList = () => VB_VERBS.filter(v => v.band <= VB_STATE.band && (VB_STATE.group === 'all' || v.group === VB_STATE.group) && v.tenses[VB_STATE.tense]);
const vbCurrent = () => vbList().find(v => v.inf === VB_STATE.verb) || vbList()[0] || VB_VERBS[0];
const vbShuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
const vbVerb = inf => VB_VERBS.find(v => v.inf === inf);
/* Tipp: Anfang der Form zeigen (Hilfsverb ganz, vom Wort etwa ein Drittel). */
const vbHint = f => {
  const parts = f.split(' ');
  const last = parts.pop();
  return [...parts, last.slice(0, Math.max(2, Math.ceil(last.length / 3)))].join(' ') + '…';
};
const VB_ACCENTS = ['à', 'è', 'é', 'ì', 'ò', 'ù', "'"];
const vbKeys = () => `<div class="vb-keys" aria-label="Akzente einfügen">${VB_ACCENTS.map(a => `<button type="button" class="vb-key" data-vb-key="${a}" tabindex="-1">${a}</button>`).join('')}</div>`;
const vbFeedback = (st, forms) => (st === 'ok' ? 'Richtig' : st === 'accent' ? 'Fast: Prüfe den Akzent. ' + forms[0] : 'Lösung: ' + forms.join(' / '));

const VB_MODES = [
  ['table', 'Tabelle', 'Alle Formen einer Zeit'],
  ['quiz', 'Blitzrunde', 'Zehn Formen tippen'],
  ['sent', 'Im Satz', 'Form in den Satz schreiben'],
  ['choice', 'Welche Form?', 'Passende Form antippen'],
  ['aux', 'Hilfsverb', 'avere oder essere + Partizip']
];

function vbCtrl() {
  const m = VB_STATE.mode;
  const bands = `<div class="ws-seg vb-band" role="tablist" aria-label="Lehrwerk">${VB_BANDS.map(([b, l]) => `<button role="tab" aria-selected="${VB_STATE.band === b}" data-vb="band" data-v="${b}">${l}</button>`).join('')}</div>`;
  const modes = `<div class="vb-modes" role="tablist" aria-label="Übung">${VB_MODES.map(([k, l, d]) => `<button role="tab" class="vb-mode-btn ${m === k ? 'on' : ''}" aria-selected="${m === k}" data-vb="mode" data-v="${k}"><b>${l}</b><small>${d}</small></button>`).join('')}</div>`;
  const showGroup = ['table', 'quiz', 'aux'].includes(m);
  const showTense = ['table', 'quiz', 'sent', 'choice'].includes(m);
  const tenses = vbTensesFor(VB_STATE.band);
  const tAll = m === 'table' ? '' : `<button type="button" class="vb-chip ${VB_STATE.tense === 'mix' ? 'on' : ''}" data-vb="tense" data-v="mix">Gemischt</button>`;
  const g = VB_GROUPS.map(([k, l]) => `<button type="button" class="vb-chip ${VB_STATE.group === k ? 'on' : ''}" data-vb="group" data-v="${k}">${l}</button>`).join('');
  const t = tAll + tenses.map(([k, l, b]) => `<button type="button" class="vb-chip ${VB_STATE.tense === k ? 'on' : ''} ${b === VB_STATE.band && b > 1 ? 'new' : ''}" data-vb="tense" data-v="${k}">${l}</button>`).join('');
  const v = m === 'table' ? vbList().map(x => `<button type="button" class="vb-verb ${vbCurrent().inf === x.inf ? 'on' : ''} ${x.band === VB_STATE.band && x.band > 1 ? 'new' : ''}" data-vb="verb" data-v="${x.inf}">${x.inf}</button>`).join('') : '';
  return `${bands}${modes}<section class="vb-ctrl glass">${showGroup ? `<div class="vb-row"><span class="vb-label">Verben</span><div class="vb-chips">${g}</div></div>` : ''}${showTense ? `<div class="vb-row"><span class="vb-label">Zeit</span><div class="vb-chips">${t}</div></div>` : ''}${v ? `<div class="vb-row"><span class="vb-label">Verb</span><div class="vb-chips vb-verbs">${v}</div></div>` : ''}<p class="small muted vb-legend">${VB_STATE.band > 1 ? 'Markiert: neu in diesem Band. ' : ''}Die Auswahl enthält alles bis einschließlich ${VB_BANDS[VB_STATE.band - 1][1]}.</p></section>`;
}
function vbTable() {
  const v = vbCurrent(),
    forms = v.tenses[VB_STATE.tense],
    persons = vbPersons(VB_STATE.tense);
  const rows = persons.map((p, i) => {
    const st = VB_STATE.checked ? vbJudge(forms[i], VB_STATE.answers[i] || '') : '';
    const msg = !VB_STATE.checked ? '' : vbFeedback(st, forms[i]);
    return `<tr class="vb-r ${st}"><th scope="row">${p}</th><td><input class="vb-in" data-vb-in="${i}" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" lang="it" value="${esc(VB_STATE.answers[i] || '')}" ${VB_STATE.checked ? 'readonly' : ''} aria-label="${p}"></td><td class="vb-fb" role="status">${esc(msg)}</td></tr>`;
  }).join('');
  const ok = VB_STATE.checked ? persons.filter((_, i) => vbJudge(forms[i], VB_STATE.answers[i] || '') === 'ok').length : 0;
  const auxNote = ['pp', 'trap', 'congp', 'congt', 'condp'].includes(VB_STATE.tense) ? ` · mit ${v.aux}` : '';
  return `<section class="vb-card glass"><div class="vb-head"><div><div class="eyebrow">${vbTenseName(VB_STATE.tense)}</div><h2 lang="it">${v.inf}</h2><p class="muted">${esc(v.de)}${auxNote}</p></div><button type="button" class="speak-btn" data-vb="speak" aria-label="Aussprache anhören">🔊</button></div>
  <form id="vb-form" novalidate><table class="vb-table"><tbody>${rows}</tbody></table>${VB_STATE.checked ? '' : vbKeys()}
  <div class="vb-actions">${VB_STATE.checked ? `<div class="vb-score" role="status"><b>${ok} von ${persons.length}</b> richtig</div><button type="button" class="button primary" data-vb="next">Nächstes Verb</button><button type="button" class="button secondary" data-vb="again">Noch einmal</button>` : '<button class="button primary" type="submit">Formen prüfen</button><button type="button" class="button secondary" data-vb="reveal">Lösung zeigen</button>'}</div></form></section>`;
}
/* Runden: Blitzrunde (Verb + Person), Im Satz, Welche Form?, Hilfsverb */
function vbItems(mode) {
  const band = VB_STATE.band;
  const tenses = VB_STATE.tense === 'mix' ? vbTensesFor(band).map(t => t[0]) : [VB_STATE.tense];
  if (mode === 'sent' || mode === 'choice') {
    let pool = VB_SENT.filter(s => s[0] <= band && tenses.includes(s[1]) && vbVerb(s[2]) && vbVerb(s[2]).tenses[s[1]]);
    if (pool.length < 4) pool = VB_SENT.filter(s => s[0] <= band && vbVerb(s[2]).tenses[s[1]]);
    // neueste Inhalte bevorzugen: Sätze des gewählten Bands zuerst
    pool = [...vbShuffle(pool.filter(s => s[0] === band)), ...vbShuffle(pool.filter(s => s[0] !== band))].slice(0, 10);
    return vbShuffle(pool).map(([b, tense, inf, p, text]) => {
      const verb = vbVerb(inf);
      return { verb, tense, p, text, forms: verb.tenses[tense][p] };
    });
  }
  const verbs = VB_VERBS.filter(v => v.band <= band && (VB_STATE.group === 'all' || v.group === VB_STATE.group));
  const items = [];
  for (let i = 0; i < 10 && verbs.length; i++) {
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    if (mode === 'aux') {
      items.push({ verb, tense: 'pp', p: 0, forms: [verb.pp, ...(verb.aux === 'essere' ? [verb.pp.replace(/o$/, 'a')] : [])] });
      continue;
    }
    const ts = tenses.filter(t => verb.tenses[t]);
    if (!ts.length) { i--; continue; }
    const tense = ts[Math.floor(Math.random() * ts.length)];
    const p = Math.floor(Math.random() * vbPersons(tense).length);
    items.push({ verb, tense, p, forms: verb.tenses[tense][p] });
  }
  return items;
}
/* Antwortmöglichkeiten: richtige Form, dieselbe Person in anderen Zeiten, andere Personen derselben Zeit */
function vbOptions(c) {
  const right = c.forms[0];
  const pool = [];
  vbTensesFor(VB_STATE.band).forEach(([t]) => {
    if (t !== c.tense && c.verb.tenses[t] && c.verb.tenses[t][c.p] && t !== 'imp') pool.push(c.verb.tenses[t][c.p][0]);
  });
  c.verb.tenses[c.tense].forEach((f, i) => i !== c.p && pool.push(f[0]));
  const wrong = vbShuffle([...new Set(pool)].filter(f => !c.forms.some(r => vbNorm(r) === vbNorm(f)))).slice(0, 3);
  return vbShuffle([right, ...wrong]);
}
function vbRound() {
  const m = VB_STATE.mode;
  const q = VB_STATE.quiz;
  const intro = {
    quiz: ['Blitzrunde', 'Zehn Formen, ein Ziel.', 'Du bekommst Verb, Person und Zeit und tippst die passende Form.'],
    sent: ['Im Satz', 'Die Form im Zusammenhang.', 'Setze das Verb in der richtigen Form in den Satz. Die Zeit steht dabei.'],
    choice: ['Welche Form?', 'Antippen statt tippen.', 'Wähle die Form, die in den Satz passt. Gut für Congiuntivo und Zeitenwahl.'],
    aux: ['Hilfsverb und Partizip', 'avere oder essere?', 'Wähle zuerst das Hilfsverb, dann schreibst du das Partizip.']
  }[m];
  if (!q || q.done || q.mode !== m) {
    const r = q && q.done && q.mode === m ? `<p class="vb-final"><b>${q.good} von ${q.total}</b> richtig${q.good === q.total ? ' · perfekt!' : ''}</p>` : '';
    return `<section class="vb-card glass vb-quiz"><div class="eyebrow">${intro[0]}</div><h2>${intro[1]}</h2><p class="muted">${intro[2]}</p>${r}<button type="button" class="button primary large" data-vb="quiz-start">${r ? 'Neue Runde' : 'Runde starten'}</button></section>`;
  }
  const c = q.items[q.i];
  const st = q.checked ? q.res : '';
  const bar = `<div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${(100 * q.i) / q.total}%"></div></div>`;
  const label = `${vbTenseName(c.tense)} · ${q.i + 1} / ${q.total}`;
  const next = `<button type="button" class="button primary" data-vb="quiz-next">${q.i + 1 === q.total ? 'Ergebnis' : 'Weiter'}</button>`;
  const fb = q.checked ? `<div class="vb-fb ${st}" role="status">${esc(vbFeedback(st, c.forms))}</div>` : '';
  const hint = !q.checked && !q.hint ? '<button type="button" class="quiet" data-vb="hint">Tipp</button>' : q.hint && !q.checked ? `<span class="vb-hint" lang="it">${esc(vbHint(c.forms[0]))}</span>` : '';
  if (m === 'aux') {
    const auxPick = q.aux
      ? `<p class="vb-auxres ${q.aux === c.verb.aux ? 'ok' : 'wrong'}">${q.aux === c.verb.aux ? 'Richtig: ' : 'Nein, '}<b lang="it">${c.verb.aux}</b>${q.aux === c.verb.aux ? '' : ' ist richtig.'}</p>`
      : `<div class="vb-two"><button type="button" class="button secondary large" data-vb="aux-pick" data-v="avere">avere</button><button type="button" class="button secondary large" data-vb="aux-pick" data-v="essere">essere</button></div>`;
    return `<section class="vb-card glass vb-quiz">${bar}<div class="eyebrow">Passato prossimo · ${q.i + 1} / ${q.total}</div><h2 lang="it">${c.verb.inf}</h2><p class="muted">${esc(c.verb.de)}</p>${auxPick}${q.aux ? `<form id="vb-qform" novalidate><label class="vb-plabel">Partizip<input class="vb-in vb-big" id="vb-q" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" lang="it" value="${esc(q.answer || '')}" ${q.checked ? 'readonly' : ''}></label>${q.checked ? '' : vbKeys()}<div class="vb-actions">${q.checked ? fb + next : '<button class="button primary" type="submit">Prüfen</button>' + hint}</div></form>` : ''}</section>`;
  }
  if (m === 'choice') {
    const opts = q.opts || (q.opts = vbOptions(c));
    const parts = c.text.split('___');
    const shown = q.checked ? `<b class="vb-gapfill ${st}" lang="it">${esc(c.forms[0])}</b>` : '<span class="vb-gap">___</span>';
    return `<section class="vb-card glass vb-quiz">${bar}<div class="eyebrow">${label}</div><p class="vb-sentence" lang="it">${esc(parts[0])}${shown}${esc(parts[1] || '')}</p><p class="muted">(${c.verb.inf}${c.tense === 'imp' ? ', ' + VB_IMP_PERSONS[c.p] : ''})</p><div class="vb-opts">${opts.map(o => `<button type="button" class="vb-opt ${q.checked ? (c.forms.includes(o) ? 'ok' : o === q.answer ? 'wrong' : '') : ''}" data-vb="pick" data-v="${esc(o)}" ${q.checked ? 'disabled' : ''} lang="it">${esc(o)}</button>`).join('')}</div><div class="vb-actions">${q.checked ? fb + next : ''}</div></section>`;
  }
  if (m === 'sent') {
    const parts = c.text.split('___');
    return `<section class="vb-card glass vb-quiz">${bar}<div class="eyebrow">${label}</div><form id="vb-qform" novalidate><p class="vb-sentence" lang="it">${esc(parts[0])}<input class="vb-in vb-inline" id="vb-q" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" lang="it" value="${esc(q.answer || '')}" ${q.checked ? 'readonly' : ''} aria-label="Verbform" size="${Math.max(8, c.forms[0].length + 2)}">${esc(parts[1] || '')}</p><p class="muted">(<span lang="it">${c.verb.inf}</span>${c.tense === 'imp' ? ', ' + VB_IMP_PERSONS[c.p] : ''})</p>${q.checked ? '' : vbKeys()}<div class="vb-actions">${q.checked ? fb + next : '<button class="button primary" type="submit">Prüfen</button>' + hint}</div></form></section>`;
  }
  return `<section class="vb-card glass vb-quiz">${bar}<div class="eyebrow">${label}</div><h2 lang="it">${c.verb.inf}</h2><p class="muted">${esc(c.verb.de)}</p><div class="vb-person">${vbPersons(c.tense)[c.p]}</div><form id="vb-qform" novalidate><input class="vb-in vb-big" id="vb-q" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" lang="it" value="${esc(q.answer || '')}" ${q.checked ? 'readonly' : ''} aria-label="Form">${q.checked ? '' : vbKeys()}<div class="vb-actions">${q.checked ? fb + next : '<button class="button primary" type="submit">Prüfen</button>' + hint}</div></form></section>`;
}
function verbsPage() {
  VB_STATE.answers = VB_STATE.answers || [];
  if (VB_STATE.tense !== 'mix' && !vbTensesFor(VB_STATE.band).some(t => t[0] === VB_STATE.tense)) VB_STATE.tense = 'pres';
  if (VB_STATE.mode === 'table' && VB_STATE.tense === 'mix') VB_STATE.tense = 'pres';
  if (VB_STATE.mode === 'table' && !vbList().length) VB_STATE.group = 'all';
  $('main').innerHTML = `<div class="page vb-page"><header class="page-head"><div class="eyebrow">VERBEN</div><h1>Verbi.</h1><p>Wähle deinen Band. Zeiten und Verben kommen Schritt für Schritt dazu, unregelmäßige Formen inklusive.</p></header>
  ${vbCtrl()}
  ${VB_STATE.mode === 'table' ? vbTable() : vbRound()}</div>`;
  if (!VB_STATE.checked && VB_STATE.mode === 'table') document.querySelector('[data-vb-in="0"]')?.focus({ preventScroll: true });
  const q = VB_STATE.quiz;
  if (VB_STATE.mode !== 'table' && q && !q.done && !q.checked) document.getElementById('vb-q')?.focus({ preventScroll: true });
}
function vbQuizStart() {
  const items = vbItems(VB_STATE.mode);
  VB_STATE.quiz = { mode: VB_STATE.mode, items, i: 0, good: 0, total: items.length, checked: false, answer: '', done: !items.length };
}
let vbLastInput = null;
document.addEventListener('focusin', e => {
  if (e.target.matches?.('.vb-in')) vbLastInput = e.target;
});
document.addEventListener('click', e => {
  const k = e.target.closest('[data-vb-key]');
  if (k) {
    e.preventDefault();
    const inp = vbLastInput && document.contains(vbLastInput) ? vbLastInput : document.querySelector('.vb-in:not([readonly])');
    if (!inp || inp.readOnly) return;
    const a = inp.selectionStart ?? inp.value.length, b = inp.selectionEnd ?? inp.value.length;
    inp.value = inp.value.slice(0, a) + k.dataset.vbKey + inp.value.slice(b);
    inp.setSelectionRange(a + 1, a + 1);
    inp.focus();
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }
  const b = e.target.closest('[data-vb]');
  if (!b || !document.querySelector('.vb-page')) return;
  const a = b.dataset.vb,
    v = b.dataset.v;
  const redraw = () => {
    VB_STATE.answers = [];
    VB_STATE.checked = false;
    verbsPage();
  };
  if (a === 'band') { VB_STATE.band = Number(v); VB_STATE.quiz = null; vbSave(); return redraw(); }
  if (a === 'group') { VB_STATE.group = v; VB_STATE.quiz = null; return redraw(); }
  if (a === 'tense') { VB_STATE.tense = v; VB_STATE.quiz = null; return redraw(); }
  if (a === 'verb') { VB_STATE.verb = v; return redraw(); }
  if (a === 'mode') { VB_STATE.mode = v; VB_STATE.quiz = null; vbSave(); return redraw(); }
  if (a === 'speak') {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(vbCurrent().inf);
    u.lang = 'it-IT'; u.voice = pickVoice('it-IT'); u.rate = 0.9; speechSynthesis.speak(u);
    return;
  }
  if (a === 'again') return redraw();
  if (a === 'next') {
    const l = vbList(), i = l.findIndex(x => x.inf === vbCurrent().inf);
    VB_STATE.verb = l[(i + 1) % l.length].inf;
    return redraw();
  }
  if (a === 'reveal') {
    VB_STATE.verb = vbCurrent().inf;
    VB_STATE.answers = vbCurrent().tenses[VB_STATE.tense].map(f => f[0]);
    VB_STATE.checked = true;
    return verbsPage();
  }
  const q = VB_STATE.quiz;
  const toCard = () => document.querySelector('.vb-quiz')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  if (a === 'quiz-start') { vbQuizStart(); verbsPage(); return toCard(); }
  if (!q) return;
  if (a === 'hint') { q.hint = true; return verbsPage(); }
  if (a === 'aux-pick') { q.aux = v; return verbsPage(); }
  if (a === 'pick') {
    const c = q.items[q.i];
    q.answer = v;
    q.res = c.forms.includes(v) ? 'ok' : 'wrong';
    if (q.res === 'ok') q.good++;
    q.checked = true;
    return verbsPage();
  }
  if (a === 'quiz-next') {
    q.i++; q.checked = false; q.answer = ''; q.hint = false; q.aux = null; q.opts = null;
    if (q.i >= q.total) q.done = true;
    verbsPage();
    return toCard();
  }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.matches?.('[data-vb-in]')) VB_STATE.answers[Number(t.dataset.vbIn)] = t.value;
  if (t.id === 'vb-q' && VB_STATE.quiz) VB_STATE.quiz.answer = t.value;
});
document.addEventListener('submit', e => {
  if (e.target.id === 'vb-form') {
    e.preventDefault();
    document.querySelectorAll('[data-vb-in]').forEach(i => (VB_STATE.answers[Number(i.dataset.vbIn)] = i.value));
    VB_STATE.verb = vbCurrent().inf;
    VB_STATE.checked = true;
    verbsPage();
  }
  if (e.target.id === 'vb-qform') {
    e.preventDefault();
    const q = VB_STATE.quiz, c = q.items[q.i];
    q.answer = document.getElementById('vb-q').value;
    q.res = vbJudge(c.forms, q.answer);
    if (q.res === 'empty') return;
    // Hilfsverb-Übung: nur richtig, wenn auch das Hilfsverb stimmt
    if (q.mode === 'aux' && q.aux !== c.verb.aux && q.res === 'ok') q.res = 'wrong';
    if (q.res === 'ok') q.good++;
    q.checked = true;
    verbsPage();
  }
});
if (typeof module !== 'undefined') module.exports = { VB_VERBS, VB_SENT, vbJudge, vbOptions };
