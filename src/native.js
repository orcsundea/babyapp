import {Capacitor} from '@capacitor/core';
import {Camera,CameraResultType,CameraSource} from '@capacitor/camera';
import {Filesystem,Directory,Encoding} from '@capacitor/filesystem';
import {Share} from '@capacitor/share';
import {App} from '@capacitor/app';
export const isNative=Capacitor.isNativePlatform();
export async function takePaperPhoto(){
 const image=await Camera.getPhoto({quality:90,width:2000,height:2000,allowEditing:false,resultType:CameraResultType.Uri,source:CameraSource.Prompt,promptLabelHeader:'기록지 가져오기',promptLabelPhoto:'갤러리에서 선택',promptLabelPicture:'사진 찍기',promptLabelCancel:'취소'});
 if(!image.webPath)throw new Error('사진을 불러오지 못했어요.');
 const response=await fetch(image.webPath);
 if(!response.ok)throw new Error('사진을 불러오지 못했어요.');
 return response.blob();
}
export async function shareFile(filename,text){
 const result=await Filesystem.writeFile({path:filename,data:text,directory:Directory.Cache,encoding:Encoding.UTF8});
 await Share.share({title:'보드레 기록 파일',files:[result.uri],dialogTitle:'파일을 저장하거나 공유할 앱 선택'});
}
export function onNativeBack(callback){if(isNative)App.addListener('backButton',callback);}
export function exitNative(){return App.exitApp();}
