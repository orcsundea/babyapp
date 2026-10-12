import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import assert from 'node:assert/strict';
const mf=new Miniflare(convertV4MiniflareOptions({modules:true,scriptPath:new URL('../worker.js',import.meta.url).pathname,compatibilityDate:'2025-04-01',durableObjects:{OCR_QUOTA:{className:'OcrQuota',useSQLite:true}},bindings:{ALLOWED_ORIGIN:'https://orcsundea.github.io',DAILY_LIMIT:'2',MONTHLY_LIMIT:'3'}}));
try{
 const preflight=await mf.dispatchFetch('https://worker/ocr',{method:'OPTIONS',headers:{Origin:'https://orcsundea.github.io'}});assert.equal(preflight.status,204);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),'https://orcsundea.github.io');
 const missing=await mf.dispatchFetch('https://worker/ocr',{method:'POST',headers:{Origin:'https://orcsundea.github.io'}});assert.equal(missing.status,503);assert.equal((await missing.json()).error,'server_not_configured');
 const namespace=await mf.getDurableObjectNamespace('OCR_QUOTA');const stub=namespace.get(namespace.idFromName('shared'));
 const responses=await Promise.all(Array.from({length:10},()=>stub.fetch('https://quota/reserve',{method:'POST'})));
 assert.equal(responses.filter(r=>r.status===200).length,2);assert.equal(responses.filter(r=>r.status===429).length,8);
 console.log('PASS: actual Cloudflare local runtime, CORS preflight, missing secrets fail closed, SQLite Durable Object concurrent quota (2 accepted / 8 blocked). No Google API called.');
}finally{await mf.dispose();}
