import {readFileSync,writeFileSync,rmSync} from 'node:fs';
const file=new URL('../dist/index.html',import.meta.url);
let html=readFileSync(file,'utf8');
const policy="default-src 'self'; script-src 'self' 'wasm-unsafe-eval' blob:; worker-src 'self' blob:; connect-src 'self' https://*.workers.dev; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; form-action 'none'";
html=html.replace('<head>',`<head><meta http-equiv="Content-Security-Policy" content="${policy}">`);
writeFileSync(file,html);
writeFileSync(new URL('../dist/.nojekyll',import.meta.url),'');
console.log('Browser-only build prepared with a same-origin content security policy.');

// The Gemini browser build does not use the old local OCR assets.
rmSync(new URL('../dist/ocr/',import.meta.url),{recursive:true,force:true});
