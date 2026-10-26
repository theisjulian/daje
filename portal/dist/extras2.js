'use strict';
/*
 * Ergänzungen (Schritt 3): Lerntipps-Bereich, Merkliste mit Verlauf,
 * automatisches Titelbild beim Import, Bearbeiten des kompletten Pakets.
 */

/* ---------- Lerntipps ---------- */
Object.assign(TIP_SOURCES, {
  dunlosky: {
    label: 'Dunlosky et al., 2013',
    citation:
      'Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students’ learning with effective learning techniques: Promising directions from cognitive and educational psychology. Psychological Science in the Public Interest, 14(1), 4–58.',
    url: 'https://doi.org/10.1177/1529100612453266',
    note: 'Große Übersichtsarbeit zu zehn Lerntechniken. Selbsttests (Abrufen) und über Tage verteiltes Üben wurden als besonders nützlich eingestuft; Markieren und bloßes Wiederlesen schnitten schwächer ab. Die Studien stammen überwiegend aus anderen Fächern und von Studierenden.'
  },
  hoerzyklus: {
    label: 'Vandergrift & Tafaghodtari, 2010',
    citation:
      'Vandergrift, L., & Tafaghodtari, M. H. (2010). Teaching L2 learners how to listen does make a difference: An empirical study. Language Learning, 60(2), 470–497.',
    url: 'https://doi.org/10.1111/j.1467-9922.2009.00559.x',
    note: 'Studie mit Studierenden einer Fremdsprache: Eine Gruppe übte einen festen Hörablauf aus Vorhersagen, Hören, Überprüfen und Nachdenken. Sie verbesserte ihr Hörverstehen stärker als die Vergleichsgruppe, schwächere Hörende profitierten besonders. Andere Sprachen und Altersgruppen wurden nicht getestet.'
  },
  untertitel: {
    label: 'Montero Perez et al., 2013',
    citation:
      'Montero Perez, M., Van Den Noortgate, W., & Desmet, P. (2013). Captioned video for L2 listening and vocabulary learning: A meta-analysis. System, 41(3), 720–739.',
    url: 'https://doi.org/10.1016/j.system.2013.07.013',
    note: 'Meta-Analyse mehrerer Studien: Untertitel in der Zielsprache unterstützten im Schnitt das Verstehen und den Wortschatz. Die Reihenfolge „erst ohne, dann mit Text“ wurde hier nicht geprüft; sie ist eine Praxisregel aus dem Hörablauf.'
  }
});

const TIP_LEVELS = {
  strong: ['●●●', 'Gut belegt'],
  good: ['●●○', 'Belegt'],
  plausible: ['●○○', 'Plausible Übertragung']
};
const LISTEN_TIPS = [
  {
    id: 'vorhersagen',
    num: '01',
    title: 'Erst raten. Dann hören.',
    lead: 'Wer vorher weiß, worum es geht, versteht mehr.',
    steps: [
      'Titel und Bild ansehen',
      'Drei Wörter notieren, die vorkommen könnten',
      'Beim Hören abhaken, was stimmt'
    ],
    teach: 'Lassen Sie die Klasse vor dem ersten Hören Erwartungen sammeln und danach abgleichen.',
    visual: '<div class="tv-chips"><span>il mercato</span><span>comprare</span><span>la frutta</span></div>',
    level: 'good',
    sources: ['hoerzyklus'],
    action: 'Hörübung wählen',
    nav: 'hoeren'
  },
  {
    id: 'zweimal',
    num: '02',
    title: 'Erst das Ganze. Dann die Details.',
    lead: 'Jedes Hören bekommt eine eigene Aufgabe.',
    steps: [
      'Erstes Hören: Worum geht es, wer spricht?',
      'Zweites Hören: Zahlen, Namen, Gründe',
      'Drittes Hören: Antworten prüfen'
    ],
    teach: 'Teilen Sie die Aufgaben in Globalverstehen und Detailverstehen und lassen Sie sie getrennt bearbeiten.',
    visual: '<div class="tv-steps"><b>1×</b><i></i><b>2×</b><i></i><b>3×</b></div>',
    level: 'good',
    sources: ['hoerzyklus'],
    action: 'Hörübung wählen',
    nav: 'hoeren'
  },
  {
    id: 'transkript',
    num: '03',
    title: 'Transkript erst nach dem Versuch.',
    lead: 'Mitlesen hilft, wenn du vorher selbst gehört hast.',
    steps: [
      'Zuerst ohne Text hören und antworten',
      'Dann Text öffnen und die Stellen suchen, die du verpasst hast',
      'Noch einmal ohne Text hören'
    ],
    teach: 'Transkript als Kontrollmittel nach der Aufgabe freigeben, nicht davor.',
    visual: '<div class="tv-steps"><b>Hören</b><i></i><b>Lesen</b><i></i><b>Hören</b></div>',
    level: 'plausible',
    sources: ['untertitel', 'hoerzyklus'],
    action: 'Hörübung wählen',
    nav: 'hoeren'
  },
  {
    id: 'kurz-oft',
    num: '04',
    title: 'Lieber oft und kurz.',
    lead: 'Fünf Minuten an vier Tagen schlagen eine Stunde am Stück.',
    steps: ['Eine kurze Übung pro Tag', 'Nach ein paar Tagen dieselbe noch einmal', 'Merken, was jetzt leichter ist'],
    teach: 'Kurze Höraufgaben als regelmäßige Hausaufgabe statt einer langen vor der Klassenarbeit.',
    visual: '<div class="tv-days"><i class="on"></i><i></i><i class="on"></i><i></i><i class="on"></i><i></i><i class="on"></i></div>',
    level: 'strong',
    sources: ['dunlosky', 'spacing'],
    action: 'Merkliste öffnen',
    nav: 'sammlung'
  }
];
const WORD_TIPS = [
  {
    id: 'abruf',
    num: '01',
    title: 'Erst denken. Dann aufdecken.',
    lead: 'Selbst erinnern lehrt mehr als Wiedererkennen.',
    steps: ['Karte ansehen, Antwort im Kopf formulieren', 'Erst dann umdrehen', 'Ehrlich wählen: gewusst oder nochmal'],
    teach: 'Karten bewusst mit Antwort-vor-Aufdecken einführen.',
    visual: 'recall',
    level: 'strong',
    sources: ['dunlosky', 'retrieval'],
    action: 'Karten üben',
    mode: 'cards'
  },
  {
    id: 'abstand',
    num: '02',
    title: 'Morgen wieder. Nicht alles heute.',
    lead: 'Verteilte Runden halten länger als eine lange.',
    steps: ['Heute lernen', 'Morgen und in ein paar Tagen wiederholen', 'Gekonnte Wörter seltener, schwere früher'],
    teach: 'Vokabeltests auf mehrere kurze Termine statt einen Termin legen.',
    visual: 'spacing',
    level: 'strong',
    sources: ['dunlosky', 'spacing'],
    action: 'Meinen Fortschritt ansehen',
    nav: 'fortschritt'
  },
  {
    id: 'fehler',
    num: '03',
    title: 'Fehler zeigen den nächsten Schritt.',
    lead: 'Vergleiche deine Antwort mit der Lösung.',
    steps: ['Unterschied genau ansehen', 'Wort später ohne Vorlage noch einmal', 'Akzent und Artikel mitprüfen'],
    teach: 'Korrekturen kurz halten: Lösung zeigen, dann erneut abfragen.',
    visual: 'error',
    level: 'good',
    sources: ['feedback'],
    action: 'Schreiben üben',
    mode: 'write'
  },
  {
    id: 'handschrift',
    num: '04',
    title: 'Abdecken. Aufschreiben. Prüfen.',
    lead: 'Aus dem Gedächtnis schreiben, nicht abschreiben.',
    steps: ['Lösung abdecken', 'Wort aus dem Kopf aufschreiben', 'Mit der Lösung vergleichen'],
    teach: 'Als Stillarbeit mit Zettel und Selbstkontrolle.',
    visual: 'paper',
    level: 'plausible',
    sources: ['writing', 'retrieval'],
    action: 'Karten für Papier öffnen',
    mode: 'cards'
  },
  {
    id: 'bilder',
    num: '05',
    title: 'Bild und Wort verbinden.',
    lead: 'Bilder helfen, wenn du das Wort trotzdem selbst abrufst.',
    steps: ['Bild ansehen', 'Wort selbst finden', 'Dann prüfen'],
    teach: 'Bildkarten als Abfrage nutzen, nicht als Vorlage zum Abschreiben.',
    visual: 'picture',
    level: 'plausible',
    sources: ['pictures', 'drawing'],
    action: 'Bildkarten ausprobieren',
    special: 'pictures'
  },
  {
    id: 'laut',
    num: '06',
    title: 'Sag ein paar Wörter laut.',
    lead: 'Gesprochene Wörter bleiben oft besser hängen.',
    steps: ['Wort bewusst aussprechen', 'Danach selbst abrufen', 'Nur ergänzend nutzen'],
    teach: 'Chorisches Sprechen kurz einbauen, danach Abfrage ohne Vorlage.',
    visual: 'aloud',
    level: 'plausible',
    sources: ['aloud'],
    action: 'Karten laut üben',
    mode: 'cards'
  }
];
let tipView = 'hoeren';

function tipCard(t) {
  const lv = TIP_LEVELS[t.level];
  const visual = t.visual.startsWith('<') ? t.visual : tipVisual({ visual: t.visual });
  return `<article class="tcard" data-level="${t.level}">
    <header><span class="tnum">${t.num}</span><span class="tlevel" title="Stärke der Belege"><i aria-hidden="true">${lv[0]}</i>${lv[1]}</span></header>
    <h2>${t.title}</h2><p class="tlead">${t.lead}</p>
    <div class="tvisual">${visual}</div>
    <ol class="tsteps">${t.steps.map(s => `<li>${s}</li>`).join('')}</ol>
    ${portalAudience === 'teach' ? `<p class="tteach"><b>Im Unterricht</b>${t.teach}</p>` : ''}
    <button class="button secondary tip-action" data-tip-action="${t.id}">${t.action}</button>
    <details class="tip-evidence"><summary>Belege ansehen</summary>${t.sources
      .map(id => {
        const s = TIP_SOURCES[id];
        return `<div><b>${s.label}</b><p>${s.note}</p><p class="citation">${s.citation}</p><a href="${s.url}" target="_blank" rel="noopener">Studie öffnen</a></div>`;
      })
      .join('')}</details></article>`;
}
function helpV2() {
  const list = tipView === 'hoeren' ? LISTEN_TIPS : WORD_TIPS;
  $('main').innerHTML = `<div class="page-title"><div class="eyebrow">LERNTIPPS · AUS DER FORSCHUNG</div><h1>${portalAudience === 'teach' ? 'Was im Unterricht wirkt.' : 'Besser lernen in kleinen Schritten.'}</h1><p>Kurz und praktisch. Zu jedem Tipp gibt es die Studie und ihre Grenzen.</p></div>
  <div class="tseg" role="group" aria-label="Bereich wählen"><button data-tip-view="hoeren" aria-pressed="${tipView === 'hoeren'}">Hören</button><button data-tip-view="wortschatz" aria-pressed="${tipView === 'wortschatz'}">Wortschatz</button></div>
  <section class="troutine" aria-label="Kurzroutine"><b>3-Minuten-Routine</b><ol>${(tipView === 'hoeren'
    ? ['Vorhersagen', 'Hören und antworten', 'Prüfen und nochmal hören']
    : ['Selbst erinnern', 'Aufdecken und prüfen', 'Morgen wiederholen']
  )
    .map((s, i) => `<li><i>${i + 1}</i>${s}</li>`)
    .join('')}</ol></section>
  <div class="tgrid">${list.map(tipCard).join('')}</div>
  <aside class="tmyth"><b>Mythos: der Lerntyp</b><p>Es gibt keine ausreichenden Belege dafür, dass Lernen besser klappt, wenn man es an den „Lerntyp“ anpasst. Wähle die Methode nach dem Ziel, nicht nach dem Typ.</p><details class="tip-evidence"><summary>Beleg ansehen</summary><div><b>${TIP_SOURCES.styles.label}</b><p>${TIP_SOURCES.styles.note}</p><p class="citation">${TIP_SOURCES.styles.citation}</p><a href="${TIP_SOURCES.styles.url}" target="_blank" rel="noopener">Studie öffnen</a></div></details></aside>
  <p class="small muted tfoot">Studien untersuchen bestimmte Gruppen und Aufgaben. Die Tipps sind begründete Anregungen, keine Garantie.</p>`;
}
document.addEventListener('click', e => {
  const v = e.target.closest('[data-tip-view]');
  if (v) {
    tipView = v.dataset.tipView;
    helpV2();
    return;
  }
  const a = e.target.closest('[data-tip-action]');
  if (a && !LEARNING_TIPS.some(t => t.id === a.dataset.tipAction)) {
    const t = [...LISTEN_TIPS, ...WORD_TIPS].find(t => t.id === a.dataset.tipAction);
    if (t?.nav) nav(t.nav);
  }
});

/* ---------- Merkliste mit Verlauf ---------- */
function savedSwitch(active) {
  return `<div class="tseg saved-switch" role="group" aria-label="Ansicht"><button data-saved="sammlung" aria-pressed="${active === 'sammlung'}">Gemerkt</button><button data-saved="verlauf" aria-pressed="${active === 'verlauf'}">Zuletzt geöffnet</button></div>`;
}
{
  const favBase = favoritePage,
    histBase = historyPage;
  favoritePage = function () {
    favBase();
    $('main').querySelector('.page-title')?.insertAdjacentHTML('afterend', savedSwitch('sammlung'));
  };
  historyPage = function () {
    histBase();
    $('main').querySelector('.page-title')?.insertAdjacentHTML('afterend', savedSwitch('verlauf'));
  };
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-saved]');
  if (b) nav(b.dataset.saved);
});

/* ---------- Titelbild automatisch beim Import ---------- */
const COVER_MAX_W = 960;
async function findCover(query, fetchFn = fetch) {
  const q = encodeURIComponent(query);
  const res = await fetchFn(
    `https://api.openverse.org/v1/images/?q=${q}&license_type=commercial,modification&category=photograph&aspect_ratio=wide&page_size=8&mature=false`
  );
  if (!res.ok) throw new Error('Suche nicht erreichbar');
  const data = await res.json();
  for (const hit of data.results || []) {
    try {
      const img = await fetchFn(hit.thumbnail || hit.url);
      if (!img.ok) continue;
      const dataUrl = await shrinkToDataUrl(await img.blob());
      if (!dataUrl) continue;
      const lic = `${String(hit.license || '').toUpperCase()}${hit.license_version ? ' ' + hit.license_version : ''}`;
      return {
        dataUrl,
        credit: `Titelbild: „${hit.title || 'Foto'}“ von ${hit.creator || 'unbekannt'}, Lizenz CC ${lic} (über Openverse)`.slice(
          0,
          900
        ),
        url: hit.foreign_landing_url || hit.url
      };
    } catch {
      /* nächstes Bild */
    }
  }
  throw new Error('Kein passendes freies Bild gefunden');
}
async function shrinkToDataUrl(blob) {
  const bmp = await createImageBitmap(blob);
  const w = Math.min(COVER_MAX_W, bmp.width),
    h = Math.round((bmp.height * w) / bmp.width);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d').drawImage(bmp, 0, 0, w, h);
  const out = c.toDataURL('image/jpeg', 0.78);
  return out.length < 380000 ? out : null;
}
async function attachCover(payload) {
  const query = payload.coverQuery || payload.title;
  const found = await findCover(query);
  payload.coverImage = found.dataUrl;
  payload.coverCredit = found.credit;
  payload.sources = payload.sources.filter(s => !s.citation.startsWith('Titelbild:'));
  payload.sources.push({ kind: 'external', citation: found.credit, url: found.url, rights: 'cleared' });
  return payload;
}
{
  const importBase = acceptEditorImport;
  acceptEditorImport = async function () {
    const r = lastValidation?.result;
    if (r?.ok && r.value.kind === 'listening' && !r.value.coverImage && r.value.media.type !== 'youtube') {
      try {
        toast('Titelbild wird gesucht …');
        const next = TheisContent.validatePackage(await attachCover(structuredClone(r.value)));
        if (next.ok) lastValidation.result = next;
      } catch {
        toast('Kein freies Titelbild gefunden. Es wird das Standardbild verwendet.');
      }
    }
    importBase();
  };
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-portal="cover-find"]');
  if (!b) return;
  const item = editorState.items.find(x => x.payload?.id === studioSelection);
  if (!item) return;
  b.disabled = true;
  try {
    const q = $('edit-cover-query')?.value.trim();
    if (!edCommit().ok) throw new Error('Bitte zuerst die offenen Punkte ergänzen.');
    const p = structuredClone(item.payload);
    if (q) p.coverQuery = q;
    const v = TheisContent.validatePackage(await attachCover(p));
    if (!v.ok) throw new Error(v.errors.join(' · '));
    item.payload = v.value;
    item.draft = v.value;
    edWork = null;
    item.status = 'draft';
    saveEditorState();
    editorMessage = 'Neues Titelbild gespeichert.';
  } catch (err) {
    editorMessage = 'Titelbild nicht gefunden: ' + err.message;
  }
  renderStudio();
});

/* ---------- Alles bearbeiten (JSON) ---------- */
{
  const formBase = editorFormHTML;
  editorFormHTML = function (item) {
    const x = edWork || item.draft || item.payload,
      cover =
        x.kind === 'listening'
          ? `<details class="editor-cover ed-box"><summary>Titelbild (optional)</summary><p class="small muted">Ohne Foto erhält die Übung ein gestaltetes Titelbild in der Farbe der Sprache.</p>${x.coverImage ? `<img src="${esc(x.coverImage)}" alt="" loading="lazy">` : '<p class="small muted">Noch kein eigenes Titelbild.</p>'}<label class="field">Suchbegriff (Englisch, konkretes Motiv)<input id="edit-cover-query" maxlength="120" value="${esc(x.coverQuery || '')}" placeholder="z. B. italian fruit market"></label><button type="button" class="button secondary" data-portal="cover-find">Freies Foto suchen</button>${x.coverCredit ? `<p class="small muted">${esc(x.coverCredit)}</p>` : ''}</details>`
          : '';
    const raw = `<details class="editor-media editor-raw ed-box"><summary>Alles bearbeiten (JSON, für Fortgeschrittene)</summary><p class="small muted">Hier lässt sich jedes Feld ändern, auch Aufgabentypen und Bilder. Gespeichert wird erst nach erfolgreicher Prüfung.</p><textarea id="edit-raw" rows="16" spellcheck="false">${esc(JSON.stringify(x, null, 2))}</textarea><button type="button" class="button secondary" data-portal="raw-save">JSON prüfen und speichern</button></details>`;
    return formBase(item) + cover + raw;
  };
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-portal="raw-save"]');
  if (!b) return;
  const item = editorState.items.find(x => x.payload?.id === studioSelection);
  try {
    const v = TheisContent.validatePackage(JSON.parse($('edit-raw').value));
    if (!v.ok) throw new Error(v.errors.slice(0, 5).join(' · '));
    if (v.value.id !== studioSelection) throw new Error('Die ID lässt sich hier nicht ändern.');
    item.payload = v.value;
    item.draft = v.value;
    edWork = null;
    item.status = 'draft';
    item.updatedAt = new Date().toISOString();
    if (!saveEditorState()) return;
    editorMessage = 'JSON gespeichert. Freigabe erneut prüfen.';
  } catch (err) {
    editorMessage = 'Nicht gespeichert: ' + err.message;
  }
  renderStudio();
});

/* ---------- Belegstellen als Sprunglinks ---------- */
function timeLinks(html) {
  const m = currentLesson?.()?.media;
  if (m?.type !== 'youtube') return html;
  return html.replace(/\[(\d{1,2}):(\d{2})\]/g, (all, mm, ss) => {
    const t = Number(mm) * 60 + Number(ss);
    return `<a class="time-link" href="https://www.youtube.com/watch?v=${m.videoId}&t=${t}s" target="_blank" rel="noopener" title="Stelle im Video öffnen">▶ ${mm}:${ss}</a>`;
  });
}
