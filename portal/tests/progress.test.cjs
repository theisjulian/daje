const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');
const storage = new Map();
const oldRecord = {
  step: 1,
  difficult: false,
  due: '2026-10-25',
  lastDay: '2026-10-24',
  method: 'self',
  attempts: 1
};
const context = {
  crypto: webcrypto,
  Date,
  records: { 'e1-1a-1': { ...oldRecord } },
  read: (k, f) => (storage.has(k) ? JSON.parse(storage.get(k)) : f),
  save: (k, v) => {
    storage.set(k, JSON.stringify(v));
    return true;
  },
  nowDate: () => '2026-10-24'
};
vm.createContext(context);
const assetDir = fs.existsSync('dist/features.js') ? 'dist' : 'docs';
vm.runInContext(fs.readFileSync(assetDir + '/features.js', 'utf8'), context);
context.initProfiles();
assert.equal(
  Object.keys(context.records).length,
  1,
  'Migration preserves existing vocabulary progress'
);
const originalId = context.activeProfile().id;
const backup = {
  app: 'sprachtrainer',
  schemaVersion: 2,
  profile: {
    name: 'Testprofil',
    createdAt: '2026-10-24T10:00:00.000Z',
    goal: 10,
    records: { 'e1-1a-1': { ...oldRecord } },
    history: { '2026-10-24': { attempts: 1, correct: 1, self: 1, checked: 0, ids: ['e1-1a-1'] } }
  }
};
const imported = context.validateProgressBackup(backup);
assert.notEqual(imported.id, originalId, 'Import creates separate profile identity');
assert.equal(imported.records['e1-1a-1'].step, 1);
assert.equal(
  context.activeProfile().id,
  originalId,
  'Validation alone does not change active profile'
);
for (const mutate of [
  x => (x.app = 'another-app'),
  x => (x.schemaVersion = 999),
  x => (x.profile.records['e1-1a-1'].step = 5),
  x => (x.profile.records['e1-1a-1'].due = '2026-02-30'),
  x => (x.profile.records['e1-1a-1'].attempts = -1),
  x => (x.profile.history['2026-10-24'].ids = ['unknown-id']),
  x => (x.profile.history['2026-10-24'].correct = 2),
  x => (x.profile.history['2026-10-24'].checked = 1),
  x =>
    Object.defineProperty(x.profile.records, '__proto__', {
      value: { ...oldRecord },
      enumerable: true
    })
]) {
  const bad = structuredClone(backup);
  mutate(bad);
  assert.throws(() => context.validateProgressBackup(bad), 'Invalid backups are rejected');
  assert.equal(
    context.activeProfile().id,
    originalId,
    'Invalid backup leaves active data unchanged'
  );
}
context.addActivity({ id: 'e1-1a-1' }, true, 'self');
context.addActivity({ id: 'e1-1a-1' }, false, 'checked');
const day = context.activeProfile().history['2026-10-24'];
assert.equal(day.attempts, 2);
assert.equal(day.correct, 1);
assert.equal(day.self, 1);
assert.equal(day.checked, 1);
assert.equal(day.ids.length, 1, 'Repeating the same word does not inflate distinct-word goal');
context.records = {};
context.initProfiles();
assert.equal(Object.keys(context.records).length, 1, 'Reload preserves current profile');
console.log('Progress migration, validated imports, isolation, reload and daily counts passed.');
const portal = {
  favorites: ['listening:it-torino-demo'],
  history: [{ id: 'it-torino-demo', at: '2026-10-25T10:00:00Z' }],
  listening: {
    'it-torino-demo': {
      answers: { q1: 'b' },
      checked: true,
      transcriptOpened: false,
      attempts: 1,
      lastResult: { correct: 1, total: 4, at: '2026-10-25T10:00:00Z', assisted: false }
    }
  },
  notes: { 'it-torino-demo': 'Noch einmal hören.' },
  recordHistory: true
};
const withPortal = structuredClone(backup);
withPortal.profile.portal = portal;
const pp = context.validateProgressBackup(withPortal);
assert.equal(pp.portal.favorites.length, 1);
assert.equal(pp.portal.listening['it-torino-demo'].answers.q1, 'b');
pp.portal.notes['it-torino-demo'] = 'changed';
assert.equal(
  portal.notes['it-torino-demo'],
  'Noch einmal hören.',
  'Imported portal data is isolated'
);
for (const change of [
  x => (x.favorites = ['invalid']),
  x => (x.listening['it-torino-demo'].lastResult.correct = 10),
  x => (x.history[0].at = 'nonsense'),
  x => (x.notes['it-torino-demo'] = 'a'.repeat(2001)),
  x =>
    Object.defineProperty(x.listening, 'constructor', { value: { answers: {} }, enumerable: true })
]) {
  const x = structuredClone(portal);
  change(x);
  assert.throws(() => context.validatePortalBackup(x));
}
console.log(
  'Portal backups preserve favourites, notes and answers while rejecting invalid records.'
);
