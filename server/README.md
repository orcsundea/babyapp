# 보드레 Gemini 사진 인식 서버

[Cloudflare에 배포하기](https://deploy.workers.cloudflare.com/?url=https://github.com/orcsundea/babyapp/tree/main/server)

## 계정에서 설정할 내용

1. 위 링크에서 Cloudflare 계정으로 로그인하고 배포를 진행합니다. 하위 디렉터리를 자동 인식하지 않으면 Git 저장소 `orcsundea/babyapp`의 **Root directory를 `server`**, Deploy command를 **`npx wrangler deploy`**로 지정합니다. 프런트엔드용 Pages가 아니라 **Worker**입니다.
2. 다음 두 값을 Worker의 **Settings → Variables and Secrets**에 **Secret** 유형으로 등록합니다. 배포 마법사에서 입력을 요구하면 그곳에 입력해도 됩니다.

   | 이름 | 값 |
   |---|---|
   | `GEMINI_API_KEY` | Google AI Studio에서 발급받은 Gemini API 키 |
   | `OCR_ACCESS_TOKEN` | 직접 정한 무작위 연결 암호. 32자 이상. Gemini 키와 다른 값 |

   실제 값은 Git 저장소·채팅·브라우저 소스에 넣지 않습니다. 보드레 앱의 연결 설정에서 **무작위 연결 암호 만들기**를 누르면 암호를 생성·복사할 수 있습니다. 그 값을 Cloudflare Secret에도 똑같이 넣습니다.
3. **Save and Deploy**로 적용하고 Worker 주소 `https://babyapp.<계정>.workers.dev`를 확인합니다. 제공 모델의 가용성은 Google 계정에서 확인합니다. 기본값은 `gemini-2.5-flash`이며, 지원이 종료되었다면 `GEMINI_MODEL`을 현재 사용 가능한 사진 입력 모델로 명시적으로 변경합니다. 코드가 다른 유료 모델로 자동 전환하지 않습니다.
4. [보드레](https://orcsundea.github.io/babyapp/)의 **아기 정보 · 설정 → 사진 인식 연결**에 Worker 주소와 `OCR_ACCESS_TOKEN`을 입력합니다. Gemini API 키를 입력하는 칸은 없습니다. 보호자·시터의 기기도 같은 서버 주소·연결 암호로 연결합니다.
5. 실제 손글씨 사진을 골라 인식한 활동·시간·양을 원본과 비교합니다. Google의 실제 응답과 정확도는 서버 계정과 Gemini 키를 등록한 뒤에 검증할 수 있습니다.

## 비용과 개인정보

- 무료로만 쓰려면 Google AI Studio에서 이 API 키의 프로젝트가 **무료 구간**인지 확인합니다. 결제가 연결된 프로젝트는 소량 사용에도 과금될 수 있습니다. 코드만으로 프로젝트의 결제 상태를 확인하거나 무료 사용을 보장하지 않습니다.
- 기본 제한은 **한국 시간 하루 10회, 월 100회**입니다. 서버의 `DAILY_LIMIT`, `MONTHLY_LIMIT`으로 낮출 수 있습니다. 공용 Durable Object에서 요청 전에 사용 횟수를 예약하므로 여러 기기가 동시에 써도 한도를 공유합니다. 실패한 인식·다시 읽기도 횟수에 포함합니다. 이는 비용 부담을 제한하는 장치이며 Google의 금액 상한 설정은 아닙니다.
- Google의 429 응답은 앱에 표시하고 재시도나 유료 모델 전환을 자동으로 하지 않습니다. Cloudflare 요금은 Google API 요금과 별개입니다. Workers와 SQLite Durable Objects 사용 가능 여부·무료 한도는 계정의 현재 요금 화면에서 확인합니다. 무료 한도를 넘기면 중단되는 요금제를 사용하고 불필요한 유료 업그레이드는 하지 마세요.
- 사진은 Cloudflare Worker를 거쳐 Google로 전달됩니다. 서버 코드는 사진·읽은 내용·API 키를 저장하거나 로그에 출력하지 않습니다. Durable Object에는 날짜와 요청 횟수만 저장합니다. 플랫폼 자체의 처리·보관 정책은 각 서비스 정책을 따릅니다. Gemini 무료 구간에서는 입력과 출력이 서비스 개선에 사용될 수 있으므로 식별 정보는 가립니다.
- 웹 앱의 Origin만 허용하고 별도 연결 암호를 확인합니다. CORS 자체가 인증을 대신하지 않습니다. API 키와 연결 암호는 Cloudflare Secrets에 보관합니다.

## 로컬 개발 및 CLI 배포

Node.js 22.17 이상 또는 24를 사용합니다.

```sh
cd /workspace/babyapp/server
npm ci --cache /workspace/.npm-cache
npm test
npm run check:runtime
XDG_CONFIG_HOME=/workspace/.config WRANGLER_LOG_PATH=/workspace/scratch/wrangler npx wrangler deploy --dry-run
```

로컬 테스트에 필요한 값은 Git에서 제외된 `server/.dev.vars`에 넣습니다. 실제 키로 테스트하려면 `ALLOWED_ORIGIN`을 사용하는 개발 페이지의 Origin으로 설정합니다. 실제 사진의 외부 전송은 사용자 승인 범위에서 수행합니다.

```sh
npm run dev
```

CLI로 배포하려면 소유자 계정으로 인증한 머신에서 아래 명령을 실행합니다. 키는 대화형 비밀 입력으로 넣고 명령 인자에 넣지 않습니다.

```sh
npx wrangler login
npx wrangler deploy
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put OCR_ACCESS_TOKEN
```

GitHub Pages 정적 배포에는 이 서버 코드와 비밀값을 포함하지 않습니다. Cloudflare 계정 가입만으로 Codex의 배포 권한이 생기지는 않습니다.

## 모델 확인

앱 설정의 **사용 가능한 모델 확인** 버튼은 서버를 통해 Google의 `/v1beta/models`를 조회합니다. 사진을 전송하거나 사진 인식 사용 횟수를 차감하지 않으며, 조회는 분당 3회로 제한합니다. 목록에 나타난 모델의 사진 입력 지원과 무료 제공 여부는 Google에서 확인한 뒤 서버의 `GEMINI_MODEL`을 변경합니다. 사진 인식 오류에는 비밀값을 제거한 Google 오류를 표시합니다. 모델 목록 확인 자체에는 자동 모델 전환이나 결제 변경이 없습니다.

`GEMINI_MODEL`은 실행용 변수로 관리하며 Wrangler 설정에 고정하지 않습니다. `keep_vars`로 운영자가 선택한 모델을 다음 코드 배포에서도 유지합니다.
