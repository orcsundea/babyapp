import {mkdirSync,copyFileSync,readdirSync,existsSync,renameSync,readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const out=new URL('public/ocr/',root);
mkdirSync(out,{recursive:true});
copyFileSync(new URL('node_modules/tesseract.js/dist/worker.min.js',root),new URL('worker.min.js',out));
const core=new URL('node_modules/tesseract.js-core/',root);
for(const file of readdirSync(core))if(file.endsWith('.wasm.js')||file.endsWith('.wasm'))copyFileSync(new URL(file,core),new URL(file,out));
const revision='87416418657359cb625c412a48b6e1d6d41c29bd';
const checksums={kor:'6b85e11d9bbf07863b97b3523b1b112844c43e713df8b66418a081fd1060b3b2',eng:'7d4322bd2a7749724879683fc3912cb542f19906c83bcc1a52132556427170b2'};
for(const lang of ['kor','eng']){
 const file=new URL(`${lang}.traineddata`,out);
 if(!existsSync(file)){const temp=new URL(`${lang}.download`,out);execFileSync('curl',['--fail','--location','--retry','2','--max-time','120',`https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/${revision}/${lang}.traineddata`,'-o',temp.pathname],{stdio:'inherit'});renameSync(temp,file);}
 const actual=createHash('sha256').update(readFileSync(file)).digest('hex');
 if(actual!==checksums[lang])throw new Error(`${lang}: language data checksum mismatch`);
 console.log(`${lang}: checksum verified`);
}
writeFileSync(new URL('NOTICE.txt',out),'OCR: Tesseract.js, tesseract.js-core, and tesseract-ocr/tessdata_fast (Apache-2.0).\nLanguage data revision: '+revision+'\n');
console.log('Local OCR assets prepared.');
