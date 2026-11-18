// Exporte les règles d'exemple du générateur vers regles/v1/*.json (source de vérité : generateur/index.html)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch(),p=await b.newPage();
await p.goto('file://'+process.cwd()+'/generateur/index.html');
const ex=await p.evaluate('examples()');
for(const r of ex)fs.writeFileSync(`regles/v1/${r.id}.json`,JSON.stringify(r,null,2)+'\n');
console.log(ex.length+' exemples exportés');await b.close()})();
