import test from 'node:test';
import assert from 'node:assert/strict';
import {summary,sleepMinutes,parsePaper,dayRecords} from './data.js';
test('sleep is allocated across midnight and ongoing sleep stops at now',()=>{
 const r={type:'sleep',start:new Date('2026-10-10T23:00:00').toISOString(),end:new Date('2026-10-11T02:00:00').toISOString()};
 assert.equal(sleepMinutes(r,'2026-10-10'),60);assert.equal(sleepMinutes(r,'2026-10-11'),120);
 assert.equal(sleepMinutes({...r,end:null},'2026-10-11',+new Date('2026-10-11T01:00:00')),60);
 assert.equal(dayRecords([r],'2026-10-11').length,1);
});
test('daily totals include only the chosen day and separate diaper types',()=>{
 const start=new Date('2026-10-11T09:00:00').toISOString();
 const list=[{type:'formula',start,amount:100},{type:'formula',start,amount:105},{type:'pee',start},{type:'poop',start},{type:'vitamin',start},{type:'formula',start:new Date('2026-10-10T10:00:00').toISOString(),amount:200}];
 assert.deepEqual(summary(list,'2026-10-11'),{formula:205,feeds:2,poop:1,pee:1,sleep:0});
});
test('paper format reads all activities and overnight sleep',()=>{
 const list=parsePaper('2026-10-10\n분유 08:00 08:20 100ml\n소변 09:00\n대변 10:30\n수면 23:00 01:00\n비타민D 13:00\n유산균 13:05','2026-10-11');
 assert.equal(list.length,6);assert.equal(list[0].amount,100);assert.equal((new Date(list[3].end)-new Date(list[3].start))/60000,120);
 assert.equal(parsePaper('분유 25:00 100ml\n분유 08:00\n수면 11:00','2026-10-10').length,0);
});
