// Browser-only entry: no Capacitor or Android native plugin code is imported.
export const isNative=false;
export function onNativeBack(){}
export function exitNative(){throw new Error('브라우저 전용 기능이 아닙니다.');}
export function takePaperPhoto(){throw new Error('브라우저의 사진 선택을 사용해 주세요.');}
export function shareFile(){throw new Error('브라우저의 백업 다운로드를 사용해 주세요.');}
