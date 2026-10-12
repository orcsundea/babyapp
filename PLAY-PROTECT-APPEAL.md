# Google Play 프로텍트 검토 신청 준비

## 현재 상태

사용자가 Google Play 프로텍트에서 기기 보호를 위해 보드레 앱을 차단하며 차단이 반복된다고 확인했습니다. 최초 경고에는 ‘잠재적으로 유해한 앱 감지됨’과 ‘피싱 시도 후에 설치되었습니다’라는 문구가 있었습니다. 원인은 확인되지 않았습니다.

APK 사용·현재 배포는 중단한 상태입니다. 보안 기능을 끄거나 앱 ID·서명 키를 변경하여 판정을 우회하지 않습니다.

## 앱 정보

- 앱 이름: 보드레 (Bodre)
- 패키지: `com.bodre.babyapp`
- 버전: `1.0.0`, versionCode `1`
- APK SHA-256: `475ff7d4437251d73e9dc124b6153fe00ded1becbac49aabe509ab051ef57ae8`
- 서명 인증서 SHA-256: `5f934aabff7713fc46dff0d855657a3633b04a3ac1447a80cff82a095c302114`
- 빌드: Capacitor 7, 최소 Android SDK 23 / target SDK 35
- 선언 권한: INTERNET 및 앱 전용 DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION

서명 키·암호는 제출하지 않습니다. APK에는 서명 키·암호와 아기의 실제 활동 기록이 포함되지 않습니다. 사용자 기기에 설치된 파일과 보관한 APK의 동일성은 직접 확인하지 못했습니다.

## 공식 검토 경로

Google Play 프로텍트 개발자 이의제기 양식:
https://support.google.com/googleplay/android-developer/contact/protectappeals

이 환경에서 `support.google.com` 연결은 네트워크 프록시의 403 거부로 열리지 않았습니다. 양식의 현재 필드와 제출 조건은 확인하지 못했고, 신청도 제출하지 않았습니다. 사용자의 브라우저에서 공식 Google 도메인인지 확인한 뒤 Google 계정과 연락처로 진행해야 합니다. 요청되는 APK 파일·다운로드 URL과 공유 범위는 양식에서 먼저 확인하세요. 보관한 APK는 분석용이며 재설치하지 않습니다. APK를 별도 검사 서비스에 자동 업로드하지 않았습니다.

## 제출 설명 초안 (영문)

Subject: Request for review of Google Play Protect block for com.bodre.babyapp

We request a review and clarification of the Google Play Protect block affecting our Android app, Bodre (package com.bodre.babyapp, version 1.0.0, versionCode 1). A user reports that Play Protect repeatedly blocks the app to protect the device. The warning states that the app is potentially harmful and was installed following a phishing attempt. Additional Samsung screenshots show a separate unverified-source installation warning and Bodre listed under unsafe apps, with detection dated 2026-10-13 on the user’s device. We do not interpret the unverified-source prompt as proof that the harmful-app verdict can be ignored.

Bodre is an infant activity logging app built with Capacitor 7. Its intended functions are recording feeding, diapers, supplements and sleep, plus on-device OCR of a paper log. Records are stored in the app's local browser storage. The app does not implement account sign-in, banking or payment forms. The release manifest declares INTERNET and an app-specific DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION; it does not declare SMS-reading, accessibility-service, overlay or APK-installation permissions. Its Capacitor configuration contains no external server URL.

We have suspended current APK distribution and advised the user not to disable Play Protect or reinstall the blocked APK. The preserved release APK matches its original checksum and passes APK v1/v2/v3 signature verification. A production npm dependency audit reported zero known vulnerabilities. These limited checks do not establish that the app is safe or that the warning is a false positive. We have not directly verified the APK installed on the user's device. Android runtime/camera testing also remains incomplete due failures of the software emulator's system processes.

Please provide the specific detection reason and review this release through the official Play Protect process. We can supply the preserved APK through the submission channel you require.

Package: com.bodre.babyapp
Version: 1.0.0 (1)
APK SHA-256: 475ff7d4437251d73e9dc124b6153fe00ded1becbac49aabe509ab051ef57ae8
Signing certificate SHA-256: 5f934aabff7713fc46dff0d855657a3633b04a3ac1447a80cff82a095c302114

## 추가로 필요한 정보

실제 Google 양식이 요구하는 연락처, 앱 개발자 정보, 파일 또는 다운로드 위치를 확인해야 합니다. Google 계정 비밀번호·인증 코드와 서명용 비밀 키는 채팅이나 신청문에 기재하지 않습니다.
