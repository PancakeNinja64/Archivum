(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,72922,e=>{"use strict";var t=e.i(43476),r=e.i(71645);e.s(["IntegrateTabs",0,function({slug:e,version:o}){let a={Python:`from archivum import Client

client = Client()
ds = client.pull("${e}", version="${o}")

print(ds.trust.score)        # 0-100
print(ds.license.spdx)       # verified license
ds.export("llamaindex")      # provenance travels with the data`,TypeScript:`import { Archivum } from "@archivum/sdk";

const client = new Archivum();
const ds = await client.pull("${e}", { version: "${o}" });

console.log(ds.trust.score);
await ds.export("langchain");`,CLI:`archivum pull ${e}@${o}
archivum trace ${e}          # full lineage in the terminal
archivum export ${e} --to llamaindex`,REST:`GET https://api.archivum.example/v1/datasets/${e}
GET https://api.archivum.example/v1/datasets/${e}/lineage
GET https://api.archivum.example/v1/datasets/${e}/versions`},i=Object.keys(a),[n,s]=(0,r.useState)("Python"),[l,c]=(0,r.useState)(!1);return(0,t.jsxs)("div",{className:"overflow-hidden rounded-[10px] border border-border bg-surface",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between border-b border-border pr-2",children:[(0,t.jsx)("div",{role:"tablist","aria-label":"Integration examples",className:"flex",children:i.map(e=>(0,t.jsx)("button",{role:"tab","aria-selected":n===e,onClick:()=>s(e),className:`px-4 py-2.5 font-mono text-[12px] ${n===e?"border-b-2 border-accent text-foreground":"text-muted-foreground hover:text-foreground"}`,children:e},e))}),(0,t.jsx)("button",{type:"button",onClick:()=>{navigator.clipboard?.writeText(a[n]).then(()=>{c(!0),setTimeout(()=>c(!1),1500)})},className:"rounded px-2.5 py-1 font-mono text-[11px] text-muted-foreground hover:text-foreground",children:l?"copied":"copy"})]}),(0,t.jsx)("pre",{className:"overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-foreground",children:a[n]})]})}])}]);