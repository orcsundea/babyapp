const errors={diagnostic_limit:'모델 확인 요청이 많아요. 1분 후 다시 확인해 주세요.',unauthorized:'연결 암호가 맞지 않아요. 설정에서 확인해 주세요.',usage_limit:'사진 인식 사용 한도에 도달했어요. 기록을 직접 입력하거나 다음 기간에 다시 시도해 주세요.',gemini_limit:'Gemini 무료 한도에 도달했거나 요청이 많아요. 잠시 후 다시 시도해 주세요.',server_not_configured:'사진 인식 서버의 설정이 아직 완료되지 않았어요.',gemini_key_error:'서버의 Gemini API 키 또는 접근 권한을 확인해 주세요.',gemini_model_error:'현재 Gemini 모델을 사용할 수 없어요. 서버의 모델 설정을 확인해 주세요.',image_too_large:'사진이 너무 커요. 기록 부분만 찍어서 다시 시도해 주세요.',timeout:'사진 읽기에 시간이 오래 걸려 중단했어요. 잠시 후 다시 시도해 주세요.',incomplete_result:'사진 인식 결과가 완성되지 않았어요. 기록 부분만 찍어서 다시 시도해 주세요.'};
export function normalizeEndpoint(value){
 let url;try{url=new URL(value);}catch{throw new Error('사진 인식 서버 주소를 확인해 주세요.');}
 if(url.protocol!=='https:'||!url.hostname.endsWith('.workers.dev')||url.username||url.password||url.search||url.hash)throw new Error('Cloudflare에서 발급한 https://…workers.dev 주소를 입력해 주세요.');
 if(!['/','/ocr'].includes(url.pathname))throw new Error('사진 인식 서버 주소를 확인해 주세요.');
 return `${url.origin}/ocr`;
}
export async function recognizeWithGemini(canvas,day,connection){
 if(!connection?.endpoint||!connection?.accessToken)throw new Error('설정에서 사진 인식 연결을 먼저 완료해 주세요.');
 const endpoint=normalizeEndpoint(connection.endpoint);
 const data=canvas.toDataURL('image/jpeg',.88).split(',')[1];
 if(data.length>4_800_000)throw new Error('사진이 너무 커요. 기록 부분만 찍어서 다시 시도해 주세요.');
 let response;
 try{response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${connection.accessToken}`},body:JSON.stringify({image:data,mimeType:'image/jpeg',day}),signal:AbortSignal.timeout(65000),credentials:'omit',redirect:'error'});}catch(e){throw new Error(e.name==='TimeoutError'?errors.timeout:'사진 인식 서버에 연결하지 못했어요. 인터넷과 서버 주소를 확인해 주세요.');}
 let result;try{result=await response.json();}catch{throw new Error('사진 인식 서버의 응답을 읽지 못했어요.');}
 if(!response.ok)throw new Error(errorMessage(result));
 if(typeof result?.text!=='string'||result.text.length>30000||typeof result.rawText!=='string'||result.rawText.length>24000||!Array.isArray(result.warnings)||result.warnings.length>40||result.warnings.some(w=>typeof w!=='string'||w.length>300))throw new Error('사진 인식 결과의 형식이 올바르지 않아요.');
 return result;
}

function errorMessage(result){
 const message=errors[result?.error]||'Gemini가 요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.';
 const detail=typeof result?.detail==='string'?result.detail.slice(0,700):'';
 return message+(detail?' Google 응답: '+detail:'');
}
export async function checkGeminiModels(connection){
 if(!connection?.endpoint||!connection?.accessToken)throw new Error('사진 인식 연결 정보를 먼저 저장해 주세요.');
 let response;try{response=await fetch(normalizeEndpoint(connection.endpoint).replace(/\/ocr$/,'/models'),{method:'POST',headers:{Authorization:`Bearer ${connection.accessToken}`},signal:AbortSignal.timeout(55000),credentials:'omit',redirect:'error'});}catch{throw new Error('모델 목록을 확인하지 못했어요. 서버 배포와 인터넷 연결을 확인해 주세요.');}
 let result;try{result=await response.json();}catch{throw new Error('서버 응답을 읽지 못했어요.');}
 if(!response.ok)throw new Error(errorMessage(result));
 if(typeof result.currentModel!=='string'||!Array.isArray(result.models)||result.models.length>300||result.models.some(m=>typeof m!=='string'||!/^gemini-[a-z0-9.-]+$/.test(m)))throw new Error('모델 목록 형식이 올바르지 않아요.');
 return result;
}
