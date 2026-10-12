import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeEndpoint,recognizeWithGemini} from './gemini.js';
test('restrict connection endpoints to HTTPS Workers without credentials or query strings',()=>{
 assert.equal(normalizeEndpoint('https://bodre.example.workers.dev'),'https://bodre.example.workers.dev/ocr');
 for(const url of ['http://bodre.example.workers.dev','https://example.com','https://bodre.example.workers.dev.evil.com','https://secret@bodre.example.workers.dev','https://bodre.example.workers.dev?key=secret','https://bodre.example.workers.dev/other'])assert.throws(()=>normalizeEndpoint(url));
});
test('require a configured server before preparing or sending photo',async()=>{
 await assert.rejects(()=>recognizeWithGemini({toDataURL:()=>{throw Error('unexpected');}},'2026-10-12',{}),/연결을 먼저/);
});
