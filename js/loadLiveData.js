/**
 * ============================================================
 *  실데이터 로더 (JSONP 방식 — CORS 우회)
 * ============================================================
 */
document.addEventListener('DOMContentLoaded', () => {
  const url = (window.CONFIG_LIVE || {}).WEB_APP_URL;
  const token = (window.CONFIG_LIVE || {}).TOKEN;

  if (!url || url.indexOf('YOUR_') === 0) {
    console.info('[Merchant Ledger] config.live.js에 WEB_APP_URL이 없어 샘플 데이터로 표시합니다.');
    initDashboard();
    return;
  }

  const callbackName = 'merchantLedgerCallback_' + Date.now();
  let finished = false;

  window[callbackName] = function (data) {
    finished = true;
    if (data && data.error) {
      console.warn('[Merchant Ledger] 서버가 요청을 거부했습니다:', data.error, '(토큰 확인 필요)');
      cleanup();
      initDashboard();
      return;
    }
    applyLiveData_(data);
    console.info('[Merchant Ledger] 실데이터 로드 완료 (' + (data.generatedAt || '') + ')');
    cleanup();
    initDashboard();
  };

  let src = url + '?resource=all&callback=' + callbackName;
  if (token) src += '&token=' + encodeURIComponent(token);

  const script = document.createElement('script');
  script.src = src;
  script.onerror = () => {
    if (finished) return;
    console.warn('[Merchant Ledger] 실데이터 로드 실패(스크립트 오류), 샘플 데이터로 표시합니다.');
    cleanup();
    initDashboard();
  };
  document.body.appendChild(script);

  // 8초 안에 응답 없으면 타임아웃 처리
  setTimeout(() => {
    if (!finished) {
      console.warn('[Merchant Ledger] 실데이터 로드 타임아웃, 샘플 데이터로 표시합니다.');
      cleanup();
      initDashboard();
    }
  }, 8000);

  function cleanup() {
    delete window[callbackName];
    script.remove();
  }
});

function applyLiveData_(data) {
  const perfRows = (data.performanceLog || []).map(r => ({
    date: r.date,
    offerId: r.offer_id,
    title: r.title,
    brand: r.brand,
    label: r.custom_label0,
    impressions: Number(r.impressions) || 0,
    clicks: Number(r.clicks) || 0
  }));

  const byDate = {};
  perfRows.forEach(r => {
    if (!r.date) return;
    if (!byDate[r.date]) byDate[r.date] = { date: r.date, impressions: 0, clicks: 0 };
    byDate[r.date].impressions += r.impressions;
    byDate[r.date].clicks += r.clicks;
  });
  const dailyArr = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  if (dailyArr.length > 0) window.PERFORMANCE_DAILY = dailyArr;

  const byProduct = {};
  perfRows.forEach(r => {
    if (!r.offerId) return;
    if (!byProduct[r.offerId]) {
      byProduct[r.offerId] = { offerId: r.offerId, title: r.title, brand: r.brand, label: r.label, impressions: 0, clicks: 0 };
    }
    byProduct[r.offerId].impressions += r.impressions;
    byProduct[r.offerId].clicks += r.clicks;
  });
  const byProductArr = Object.values(byProduct);
  if (byProductArr.length > 0) window.PERFORMANCE_BY_PRODUCT = byProductArr;

  // 속성은 가공 없이 시트 헤더(snake_case) 그대로 전달
  // app.js의 ATTRIBUTE_COLUMNS가 이 키(offer_id, title, brand, color, size, ...)를 그대로 사용합니다.
  const attrArr = data.productAttributes || [];
  if (attrArr.length > 0) window.PRODUCT_ATTRIBUTES = attrArr;
}
