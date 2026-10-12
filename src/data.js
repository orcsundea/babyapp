export const TYPES = {
 formula: {label:'분유', icon:'milk', color:'orange'},
 poop: {label:'대변', icon:'baby', color:'gold'},
 pee: {label:'소변', icon:'droplets', color:'blue'},
 sleep: {label:'수면', icon:'moon', color:'purple'},
 vitamin: {label:'비타민 D', icon:'sun', color:'green'},
 probiotic: {label:'유산균', icon:'pill', color:'pink'},
};
export function dateKey(value=new Date()) {
 const d=new Date(value); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function dayBounds(day) {const start=new Date(day+'T00:00:00');const end=new Date(start);end.setDate(end.getDate()+1);return [+start,+end];}
export function sleepMinutes(record, day, now=Date.now()) {
 if(record.type!=='sleep') return 0;
 const [a,b]=dayBounds(day); const start=Math.max(+new Date(record.start),a);const end=Math.min(record.end?+new Date(record.end):now,b);
 return Math.max(0,(end-start)/60000);
}
export function dayRecords(records,day) {const [a,b]=dayBounds(day);return records.filter(r=>r.type==='sleep' ? +new Date(r.start)<b && (!r.end || +new Date(r.end)>a) : dateKey(r.start)===day).sort((a,b)=>new Date(b.start)-new Date(a.start));}
export function summary(records,day,now=Date.now()) {
 const list=dayRecords(records,day); return {formula:list.filter(r=>r.type==='formula').reduce((a,r)=>a+Number(r.amount||0),0),feeds:list.filter(r=>r.type==='formula').length,poop:list.filter(r=>r.type==='poop').length,pee:list.filter(r=>r.type==='pee').length,sleep:Math.floor(list.reduce((a,r)=>a+sleepMinutes(r,day,now),0))};
}
export function duration(minutes) {const n=Math.floor(minutes);return `${Math.floor(n/60)}시간 ${n%60}분`;}
// Supported paper format: one record per line, date above, HH:MM times.
export function parsePaper(text,day) {
 let activeDay=day;
 return text.split('\n').flatMap(line=>{
 const date=line.match(/(20\d{2})[.\-/년 ]+(\d{1,2})[.\-/월 ]+(\d{1,2})/);
 if(date) activeDay=`${date[1]}-${date[2].padStart(2,'0')}-${date[3].padStart(2,'0')}`;
 const type=/분유/.test(line)?'formula':/대변/.test(line)?'poop':/소변/.test(line)?'pee':/수면/.test(line)?'sleep':/비타민/.test(line)?'vitamin':/유산균/.test(line)?'probiotic':null;
 const times=[...line.matchAll(/(\d{1,2})\s*:\s*(\d{2})/g)].map(m=>`${m[1].padStart(2,'0')}:${m[2]}`);
 if(!type||!times.length||times.some(t=>Number(t.slice(0,2))>23||Number(t.slice(3))>59))return [];
 const start=new Date(`${activeDay}T${times[0]}:00`);if(Number.isNaN(+start))return [];
 let end=times[1]?new Date(`${activeDay}T${times[1]}:00`):null;
 if(end && end<start)end.setDate(end.getDate()+1);
 const amount=line.match(/(\d+)\s*(?:ml|mL|㎖|밀리)/i);
 if(type==='formula' && !amount)return [];
 if(type==='sleep' && !end)return [];
 return [{type,start:start.toISOString(),end:end?.toISOString()||null,amount:type==='formula'?Number(amount[1]):null,note:'종이 기록에서 가져옴'}];
 });
}
