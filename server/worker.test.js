import test from 'node:test';
import assert from 'node:assert/strict';
import {handleRequest,formatResult,OcrQuota} from './worker.js';
const origin='https://orcsundea.github.io',token='test-only-access-token-32-characters';
const env=()=>({ALLOWED_ORIGIN:origin,OCR_ACCESS_TOKEN:token,GEMINI_API_KEY:'test-only-google-key',OCR_QUOTA:{idFromName:n=>n,get:()=>({fetch:async()=>Response.json({allowed:true})})}});
const request=(body={day:'2026-10-12',mimeType:'image/jpeg',image:'/9j/AA=='},headers={})=>new Request('https://test.workers.dev/ocr',{method:'POST',headers:{Origin:origin,Authorization:`Bearer ${token}`,'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const result={rawText:'분유 08:00 08:20 105ml\n수면 23:00 01:00',warnings:[],records:[{type:'formula',date:null,start:'08:00',end:'08:20',amount:105},{type:'sleep',date:'2026-10-12',start:'23:00',end:'01:00',amount:null}]};
test('reject unauthorized, wrong origin, missing server secrets and malformed image before Google call',async()=>{
 let calls=0;const google=()=>{calls++;throw Error('unexpected');};
 for(const [req,e,status] of [[request(undefined,{Origin:'https://other.example'}),env(),403],[request(undefined,{Authorization:'Bearer incorrect'}),env(),401],[request(),{...env(),GEMINI_API_KEY:''},503],[request({day:'2026-13-40',mimeType:'image/jpeg',image:'/9j/AA=='}),env(),400],[request({day:'2026-10-12',mimeType:'image/jpeg',image:'AAAA'}),env(),400]])assert.equal((await handleRequest(req,e,google)).status,status);
 assert.equal(calls,0);
});
test('send image to Google with server-only key and return structured text without storing image',async()=>{
 const response=await handleRequest(request(),env(),async(url,init)=>{
  assert.match(url,/^https:\/\/generativelanguage.googleapis.com\/v1beta\/models\/gemini-2.5-flash:generateContent$/);
  assert.equal(init.headers['x-goog-api-key'],'test-only-google-key');assert(!url.includes('test-only-google-key'));
  const body=JSON.parse(init.body);assert.equal(body.contents[0].parts[1].inlineData.mimeType,'image/jpeg');assert.equal(body.generationConfig.responseMimeType,'application/json');
  return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(result)}]}}]});
 });
 assert.equal(response.status,200);assert.equal(response.headers.get('Access-Control-Allow-Origin'),origin);assert.equal(response.headers.get('Cache-Control'),'no-store');
 const parsed=await response.json();assert.equal(parsed.text,'2026-10-12\n분유 08:00 08:20 105ml\n2026-10-12\n수면 23:00 01:00');assert(!JSON.stringify(parsed).includes('test-only-google-key'));
});
test('missing or illegible amounts and invalid dates are excluded rather than filled with defaults',()=>{
 const parsed=formatResult({...result,records:[{type:'formula',date:null,start:'08:00',end:null,amount:null},{type:'formula',date:'2026-02-30',start:'08:00',end:null,amount:100},{type:'sleep',date:null,start:'25:00',end:'01:00',amount:null}]},'2026-10-12');
 assert.equal(parsed.text,'');assert.equal(parsed.warnings.length,3);assert.equal(parsed.rawText,result.rawText);
});
test('app limit blocks Google call, and Google free limit is surfaced without paid fallback',async()=>{
 let calls=0;const e=env();e.OCR_QUOTA.get=()=>({fetch:async()=>Response.json({allowed:false},{status:429})});
 const response=await handleRequest(request(),e,async()=>{calls++;return Response.json({},{status:429});});assert.equal(response.status,429);assert.equal((await response.json()).error,'usage_limit');assert.equal(calls,0);
 const limited=await handleRequest(request(),env(),async()=>{calls++;return Response.json({},{status:429});});assert.equal((await limited.json()).error,'gemini_limit');assert.equal(calls,1);
});
test('blocked or truncated model results cannot be imported',async()=>{
 for(const finishReason of ['SAFETY','MAX_TOKENS']){const response=await handleRequest(request(),env(),async()=>Response.json({candidates:[{finishReason,content:{parts:[{text:JSON.stringify(result)}]}}]}));assert.equal(response.status,502);assert.equal((await response.json()).error,'incomplete_result');}
});
test('durable quota counts concurrent attempts and survives a new instance',async()=>{
 const values=new Map();let queue=Promise.resolve();
 const storage={get:async k=>values.get(k),put:async(k,v)=>values.set(k,v),transaction:cb=>{const next=queue.then(()=>cb(storage));queue=next.catch(()=>{});return next;}};
 const state={storage},e={DAILY_LIMIT:'2',MONTHLY_LIMIT:'3'},quota=new OcrQuota(state,e),req=()=>new Request('https://quota/reserve',{method:'POST'});
 const responses=await Promise.all(Array.from({length:10},()=>quota.fetch(req())));assert.equal(responses.filter(r=>r.status===200).length,2);
 assert.equal((await new OcrQuota(state,e).fetch(req())).status,429);
 const usage=values.get('usage');values.set('usage',{...usage,date:'2000-01-01'});
 assert.equal((await quota.fetch(req())).status,200);assert.equal((await quota.fetch(req())).status,429);
});
