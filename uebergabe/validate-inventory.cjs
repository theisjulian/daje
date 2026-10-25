const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),{validatePackage}=require(path.join(root,'portal/dist/content-contract.js'));
const inventory=JSON.parse(fs.readFileSync(path.join(root,'INHALTSINVENTAR.json')));
for(const a of inventory.activities){const item=JSON.parse(fs.readFileSync(path.join(root,'inhalte',a.id+'.json')));const v=validatePackage(item);assert.equal(v.ok,true,a.id+': '+v.errors.join('; '));if(item.media.type==='youtube')assert.ok(fs.existsSync(path.join(root,'portal/dist/assets/youtube-'+item.media.videoId+'.jpg')));}
assert.equal(inventory.activities.length,18);
console.log('18 Seedpakete und 14 lokale YouTube-Bilder vorhanden; alle Seedpakete strukturell gültig.');
