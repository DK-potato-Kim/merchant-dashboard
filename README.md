# Merchant Ledger — 로컬 샘플

Google Merchant Center 대시보드 목업을 VS Code에서 바로 열어볼 수 있게 만든 순수 HTML/CSS/JS 프로젝트입니다.
아직 Merchant API 자동 연동은 없고, `js/data.sample.js` 안의 값으로만 동작합니다.

## 폴더 구조

```
merchant-dashboard/
├─ index.html          ← 대시보드 화면
├─ css/
│  └─ styles.css        ← 스타일
├─ js/
│  ├─ data.sample.js    ← 샘플 데이터 (나중에 실데이터로 교체될 부분)
│  └─ app.js            ← 렌더링 로직 (차트, 테이블, 필터, CSV 다운로드) — 수정 불필요
└─ README.md
```

## VS Code에서 실행하기

외부 CDN이나 fetch 요청이 전혀 없고, `<script src>` 태그만 쓰기 때문에 **파일을 더블클릭해서 브라우저로 열어도 그대로 동작**합니다.

그래도 실제 서비스처럼 로컬 서버로 띄우고 싶다면:

1. VS Code에서 이 폴더(`merchant-dashboard`)를 엽니다.
2. 확장 프로그램에서 **Live Server** (ritwickdey.LiveServer)를 설치합니다.
3. `index.html`을 우클릭 → **Open with Live Server**.
4. 브라우저가 자동으로 열리고 `http://127.0.0.1:5500` 같은 주소로 접속됩니다.

Live Server 없이 터미널로 실행하고 싶다면:

```bash
cd merchant-dashboard
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

## 샘플 데이터 수정해보기

`js/data.sample.js`를 열어 숫자나 제품 목록을 직접 바꿔보면 대시보드가 바로 반영됩니다.
세 배열의 필드 이름만 그대로 유지하면 됩니다.

| 배열 | 의미 | 나중에 연결될 Merchant API 소스 |
|---|---|---|
| `PERFORMANCE_DAILY` | 날짜별 노출수/클릭수 합계 | `product_performance_view` (date로 group by) |
| `PERFORMANCE_BY_PRODUCT` | 제품(offer_id)별 노출수/클릭수 합계 | `product_performance_view` (offer_id로 group by) |
| `PRODUCT_ATTRIBUTES` | 제품 속성 현재 스냅샷 (이력 없음) | `product_view` 전체 조회 결과 |

## 지금 동작하는 기능

- 좌측 네비게이션: 성과 리포트 ↔ 제품 속성 전환
- 성과 리포트: 7일/30일/90일 프리셋 또는 직접 날짜 지정 → KPI, 추이 차트, 상위 제품 테이블 갱신
- 제품 속성: 검색어 + 브랜드/카테고리/가용성 필터 → 결과에 맞춰 **엑셀(CSV) 다운로드** 버튼 동작

## 실데이터 연동 (merchant-appsscript 프로젝트와 연결)

이 프로젝트는 이미 실데이터 연결 구조가 들어가 있습니다.

- `js/config.live.js` : Apps Script를 웹 앱으로 배포한 URL을 넣는 곳 (기본은 빈 값 → 샘플 데이터 사용)
- `js/loadLiveData.js` : 그 URL로 fetch해서 실데이터를 화면에 반영 (실패 시 자동으로 샘플 데이터 유지)

연결 순서:
1. `merchant-appsscript/` 프로젝트에서 몇 번 수동 실행(`testSyncPerformanceOnce`, `testSyncAttributesOnce`)으로
   Google Sheets에 데이터를 채웁니다.
2. Apps Script를 "웹 앱"으로 배포하고 URL을 받습니다. (`merchant-appsscript/README.md` 9번 항목)
3. 그 URL을 이 프로젝트의 `js/config.live.js`의 `WEB_APP_URL`에 붙여넣습니다.
4. `index.html`을 다시 열면(Live Server 새로고침) 샘플 데이터 대신 실제 값이 표시됩니다.

`js/app.js`와 `index.html`은 수정할 필요가 없고, 위 3단계만 하면 됩니다.
