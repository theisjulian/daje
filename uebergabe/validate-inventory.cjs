const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),{validatePackage}=require(path.join(root,'portal/dist/content-contract.js'));
const inventory=JSON.parse(fs.readFileSync(path.join(root,'INHALTSINVENTAR.json')));
let youtube=0;
for(const a of inventory.activities){const item=JSON.parse(fs.readFileSync(path.join(root,'inhalte',a.id+'.json')));const v=validatePackage(item);assert.equal(v.ok,true,a.id+': '+v.errors.join('; '));if(item.media.type==='youtube'){youtube++;assert.ok(fs.existsSync(path.join(root,'portal/dist/assets/youtube-'+item.media.videoId+'.jpg')),a.id+': YouTube-Bild fehlt');}}
// Inventar und Ordner inhalte/ müssen dieselben Pakete enthalten (keine verwaisten Einträge, keine fehlenden).
const files=fs.readdirSync(path.join(root,'inhalte')).filter(f=>f.endsWith('.json')).map(f=>f.slice(0,-5)).sort();
assert.deepEqual(inventory.activities.map(a=>a.id).sort(),files,'INHALTSINVENTAR.json und inhalte/ stimmen nicht überein');
console.log(inventory.activities.length+' Seedpakete und '+youtube+' lokale YouTube-Bilder vorhanden; alle Seedpakete strukturell gültig.');
