/**
 * ============================================================
 *  샘플 데이터 (Google Sheets 를 흉내낸 로컬 목업)
 * ============================================================
 * 지금은 자동화(Apps Script + Merchant API) 없이 이 파일의
 * 값을 직접 채워서 대시보드를 테스트합니다.
 *
 * 나중에 자동화를 붙일 때는:
 *   - PERFORMANCE_DAILY      → product_performance_view 를
 *                              날짜별로 group by 한 결과
 *   - PERFORMANCE_BY_PRODUCT → product_performance_view 를
 *                              offer_id 별로 group by 한 결과
 *   - PRODUCT_ATTRIBUTES     → product_view 전체 스냅샷
 *
 * 세 배열의 "필드 이름과 형태"만 그대로 유지한 채, Apps Script가
 * Google Sheets에서 읽어온 실제 값으로 이 파일을 자동 생성/교체하면
 * index.html, app.js 쪽 코드는 전혀 수정할 필요가 없습니다.
 * ============================================================
 */

// ---------- 1) 일별 성과 (Performance_Log 시트 → 날짜별 합계) ----------
// date: YYYY-MM-DD, impressions/clicks: 해당 일자 전체 합계
window.PERFORMANCE_DAILY = [
  { date: "2026-06-03", impressions: 34210, clicks: 912 },
  { date: "2026-06-04", impressions: 35880, clicks: 951 },
  { date: "2026-06-05", impressions: 33790, clicks: 887 },
  { date: "2026-06-06", impressions: 36420, clicks: 998 },
  { date: "2026-06-07", impressions: 29850, clicks: 771 },
  { date: "2026-06-08", impressions: 27110, clicks: 705 },
  { date: "2026-06-09", impressions: 37210, clicks: 1042 },
  { date: "2026-06-10", impressions: 38900, clicks: 1098 },
  { date: "2026-06-11", impressions: 37650, clicks: 1055 },
  { date: "2026-06-12", impressions: 39200, clicks: 1122 },
  { date: "2026-06-13", impressions: 31020, clicks: 843 },
  { date: "2026-06-14", impressions: 28640, clicks: 762 },
  { date: "2026-06-15", impressions: 40100, clicks: 1189 },
  { date: "2026-06-16", impressions: 41320, clicks: 1231 },
  { date: "2026-06-17", impressions: 39880, clicks: 1176 },
  { date: "2026-06-18", impressions: 42010, clicks: 1268 },
  { date: "2026-06-19", impressions: 33450, clicks: 921 },
  { date: "2026-06-20", impressions: 30760, clicks: 834 },
  { date: "2026-06-21", impressions: 43220, clicks: 1312 },
  { date: "2026-06-22", impressions: 44510, clicks: 1355 },
  { date: "2026-06-23", impressions: 42870, clicks: 1298 },
  { date: "2026-06-24", impressions: 45680, clicks: 1401 },
  { date: "2026-06-25", impressions: 36110, clicks: 1002 },
  { date: "2026-06-26", impressions: 32980, clicks: 908 },
  { date: "2026-06-27", impressions: 46320, clicks: 1442 },
  { date: "2026-06-28", impressions: 47510, clicks: 1489 },
  { date: "2026-06-29", impressions: 45990, clicks: 1420 },
  { date: "2026-06-30", impressions: 48210, clicks: 1520 },
  { date: "2026-07-01", impressions: 38430, clicks: 1088 },
  { date: "2026-07-02", impressions: 35220, clicks: 972 }
];

// ---------- 2) 제품별 성과 (Performance_Log 시트 → offer_id별 합계) ----------
window.PERFORMANCE_BY_PRODUCT = [
  { offerId: "OF-10234", title: "세라믹 원형 화병 M",     brand: "Verdant",       label: "베스트",   impressions: 38210, clicks: 1240 },
  { offerId: "OF-10241", title: "리넨 쿠션커버 45x45",     brand: "Nordwell",      label: "신상품",   impressions: 35660, clicks: 1088 },
  { offerId: "OF-10238", title: "오크 사이드테이블",       brand: "Pinecrest",     label: "",         impressions: 31920, clicks: 902 },
  { offerId: "OF-10250", title: "패브릭 플로어 스탠드",     brand: "Studio Halden", label: "프리미엄", impressions: 29870, clicks: 861 },
  { offerId: "OF-10245", title: "무광 세라믹 머그 2P",     brand: "Kaira",         label: "베스트",   impressions: 27430, clicks: 795 },
  { offerId: "OF-10233", title: "라탄 바구니 대형",         brand: "Aroma&Co",      label: "",         impressions: 25110, clicks: 668 },
  { offerId: "OF-10259", title: "텀블러 보온병 500ml",     brand: "Verdant",       label: "신상품",   impressions: 23980, clicks: 704 },
  { offerId: "OF-10247", title: "미니 펜던트 조명",         brand: "Nordwell",      label: "",         impressions: 21540, clicks: 589 },
  { offerId: "OF-10236", title: "코튼 러그 120x180",       brand: "Pinecrest",     label: "시즌오프", impressions: 19870, clicks: 512 },
  { offerId: "OF-10252", title: "도자기 접시 세트",         brand: "Kaira",         label: "",         impressions: 18320, clicks: 471 }
];

// ---------- 3) 제품 속성 스냅샷 (Product_Attributes 시트, 이력 없이 매일 덮어쓰기) ----------
window.PRODUCT_ATTRIBUTES = [
  { offerId: "OF-10230", title: "세라믹 원형 화병 M",   brand: "Verdant",       category: "홈데코",   price: 28000, availability: "in_stock", label: "베스트" },
  { offerId: "OF-10231", title: "리넨 쿠션커버 45x45",   brand: "Nordwell",      category: "텍스타일", price: 15000, availability: "in_stock", label: "신상품" },
  { offerId: "OF-10232", title: "오크 사이드테이블",     brand: "Pinecrest",     category: "가구",     price: 89000, availability: "limited",  label: "" },
  { offerId: "OF-10233", title: "우드 트레이 세트",       brand: "Aroma&Co",      category: "주방용품", price: 22000, availability: "in_stock", label: "" },
  { offerId: "OF-10234", title: "패브릭 플로어 스탠드",   brand: "Studio Halden", category: "조명",     price: 76000, availability: "in_stock", label: "프리미엄" },
  { offerId: "OF-10235", title: "무광 세라믹 머그 2P",   brand: "Kaira",         category: "주방용품", price: 18000, availability: "in_stock", label: "베스트" },
  { offerId: "OF-10236", title: "라탄 바구니 대형",       brand: "Aroma&Co",      category: "홈데코",   price: 32000, availability: "out_of_stock", label: "" },
  { offerId: "OF-10237", title: "텀블러 보온병 500ml",   brand: "Verdant",       category: "주방용품", price: 21000, availability: "in_stock", label: "신상품" },
  { offerId: "OF-10238", title: "미니 펜던트 조명",       brand: "Nordwell",      category: "조명",     price: 54000, availability: "limited",  label: "" },
  { offerId: "OF-10239", title: "코튼 러그 120x180",     brand: "Pinecrest",     category: "텍스타일", price: 68000, availability: "in_stock", label: "시즌오프" },
  { offerId: "OF-10240", title: "도자기 접시 세트",       brand: "Kaira",         category: "주방용품", price: 26000, availability: "in_stock", label: "" },
  { offerId: "OF-10241", title: "알루미늄 후크 6P",       brand: "Studio Halden", category: "홈데코",   price: 9000,  availability: "in_stock", label: "" },
  { offerId: "OF-10242", title: "월넛 코스터 4P",         brand: "Aroma&Co",      category: "주방용품", price: 12000, availability: "in_stock", label: "" },
  { offerId: "OF-10243", title: "리클라이닝 체어",         brand: "Pinecrest",     category: "가구",     price: 210000,availability: "out_of_stock", label: "프리미엄" },
  { offerId: "OF-10244", title: "글라스 캔들홀더",         brand: "Verdant",       category: "홈데코",   price: 14000, availability: "in_stock", label: "" },
  { offerId: "OF-10245", title: "패브릭 소파 커버",       brand: "Nordwell",      category: "텍스타일", price: 47000, availability: "limited",  label: "시즌오프" },
  { offerId: "OF-10246", title: "스테인리스 냄비 세트",   brand: "Kaira",         category: "주방용품", price: 98000, availability: "in_stock", label: "베스트" },
  { offerId: "OF-10247", title: "우드 행거 스탠드",       brand: "Studio Halden", category: "가구",     price: 43000, availability: "in_stock", label: "" },
  { offerId: "OF-10248", title: "세라믹 디퓨저",           brand: "Aroma&Co",      category: "홈데코",   price: 19000, availability: "in_stock", label: "신상품" },
  { offerId: "OF-10249", title: "패턴 테이블러너",         brand: "Verdant",       category: "텍스타일", price: 11000, availability: "in_stock", label: "" }
];
