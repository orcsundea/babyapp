import {mkdirSync,copyFileSync,readdirSync,existsSync,renameSync,readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const out=new URL('public/ocr/',root);
mkdirSync(out,{recursive:true});
copyFileSync(new URL('node_modules/tesseract.js/dist/worker.min.js',root),new URL('worker.min.js',out));
const core=new URL('node_modules/tesseract.js-core/',root);
for(const file of readdirSync(core))if(file.endsWith('.wasm.js')||file.endsWith('.wasm'))copyFileSync(new URL(file,core),new URL(file,out));
const revision='e12c65a915945e4c28e237a9b52bc4a8f39a0cec';
const languages=new URL('best-v1/',out);
mkdirSync(languages,{recursive:true});
const checksums={kor:'f888d4038348a0c3d25151e7f452bda0d74ca275b18cab146798bcbb94084fff',eng:'8280aed0782fe27257a68ea10fe7ef324ca0f8d85bd2fd145d1c2b560bcb66ba'};
for(const lang of ['kor','eng']){
 const file=new URL(`${lang}.traineddata`,languages);
 if(!existsSync(file)){const temp=new URL(`${lang}.download`,languages);execFileSync('curl',['--fail','--location','--retry','2','--max-time','120',`https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/${revision}/${lang}.traineddata`,'-o',temp.pathname],{stdio:'inherit'});renameSync(temp,file);}
 const actual=createHash('sha256').update(readFileSync(file)).digest('hex');
 if(actual!==checksums[lang])throw new Error(`${lang}: language data checksum mismatch`);
 console.log(`${lang}: checksum verified`);
}
writeFileSync(new URL('NOTICE.txt',out),'OCR: Tesseract.js, tesseract.js-core, and tesseract-ocr/tessdata_best (Apache-2.0).\nLanguage data revision: '+revision+'\n');
console.log('Local OCR assets prepared.');
