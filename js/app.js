/**
 * 렌더링 로직. data.sample.js / loadLiveData.js 가 채워주는
 * window.PERFORMANCE_DAILY / PERFORMANCE_BY_PRODUCT / PRODUCT_ATTRIBUTES 를 그립니다.
 *
 * PRODUCT_ATTRIBUTES의 각 항목은 Product_Attributes 시트 헤더와 동일한
 * snake_case 키(offer_id, title, brand, color, size, price, availability, ...)를 갖습니다.
 * (Products API 기반 — SyncAttributes.gs 참고)
 */

/** 속성 테이블에서 다룰 수 있는 전체 열 정의 (키는 시트 헤더와 동일해야 함) */
const ATTRIBUTE_COLUMNS = [
  { key: 'offer_id', label: 'Offer ID', numeric: false },
  { key: 'channel', label: '채널', numeric: false },
  { key: 'content_language', label: '언어', numeric: false },
  { key: 'feed_label', label: '피드 라벨(국가)', numeric: false },
  { key: 'title', label: '제품명', numeric: false },
  { key: 'description', label: '설명', numeric: false },
  { key: 'link', label: '제품 링크', numeric: false },
  { key: 'image_link', label: '이미지 URL', numeric: false },
  { key: 'brand', label: '브랜드', numeric: false },
  { key: 'gtin', label: 'GTIN', numeric: false },
  { key: 'mpn', label: 'MPN', numeric: false },
  { key: 'condition', label: '상태', numeric: false },
  { key: 'availability', label: '가용성', numeric: false },
  { key: 'price', label: '가격', numeric: true },
  { key: 'currency', label: '통화', numeric: false },
  { key: 'sale_price', label: '할인가', numeric: true },
  { key: 'sale_price_currency', label: '할인가 통화', numeric: false },
  { key: 'google_product_category', label: '구글 상품 카테고리', numeric: false },
  { key: 'product_types', label: '제품 유형(전체)', numeric: false },
  { key: 'color', label: '색상', numeric: false },
  { key: 'size', label: '사이즈', numeric: false },
  { key: 'size_system', label: '사이즈 체계', numeric: false },
  { key: 'gender', label: '성별', numeric: false },
  { key: 'age_group', label: '연령대', numeric: false },
  { key: 'material', label: '소재', numeric: false },
  { key: 'pattern', label: '패턴', numeric: false },
  { key: 'item_group_id', label: '아이템 그룹 ID', numeric: false },
  { key: 'shipping_weight_value', label: '배송 무게', numeric: true },
  { key: 'shipping_weight_unit', label: '무게 단위', numeric: false },
  { key: 'multipack', label: '멀티팩 수량', numeric: true },
  { key: 'is_bundle', label: '번들 여부', numeric: false },
  { key: 'adult', label: '성인용품 여부', numeric: false },
  { key: 'custom_label0', label: '커스텀 라벨 0', numeric: false },
  { key: 'custom_label1', label: '커스텀 라벨 1', numeric: false },
  { key: 'custom_label2', label: '커스텀 라벨 2', numeric: false },
  { key: 'custom_label3', label: '커스텀 라벨 3', numeric: false },
  { key: 'custom_label4', label: '커스텀 라벨 4', numeric: false },
  { key: 'custom_attributes', label: '커스텀 속성', numeric: false },
  { key: 'issue_count', label: '이슈 개수', numeric: true },
  { key: 'expiration_date', label: '만료일', numeric: false }
];

/** 처음 열었을 때 기본으로 체크되어 보이는 열 */
const DEFAULT_VISIBLE_COLUMNS = ['offer_id', 'title', 'brand', 'color', 'size', 'price', 'availability', 'google_product_category'];

const availLabel = {
  "in stock": ["판매중", "available"],
  "limited availability": ["재고 부족", "limited"],
  "out of stock": ["품절", "oos"],
  in_stock: ["판매중", "available"],
  limited: ["재고 부족", "limited"],
  out_of_stock: ["품절", "oos"],
  preorder: ["예약주문", "limited"],
  backorder: ["입고 예정", "limited"]
};
function getAvailLabel_(value) {
  return availLabel[value] || [value || "-", "limited"];
}

const fmt = n => Number(n || 0).toLocaleString("ko-KR");

/* ============ 순수 SVG 라인 차트 ============ */
function drawChart(slice) {
  const svg = document.getElementById("perfChart");
  const W = 760, H = 220, padL = 40, padR = 40, padT = 14, padB = 22;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  const imprMax = Math.max(...slice.map(d => d.impressions)) * 1.1 || 1;
  const clickMax = Math.max(...slice.map(d => d.clicks)) * 1.1 || 1;
  const n = slice.length;
  const x = i => padL + (n === 1 ? 0 : (i / (n - 1)) * plotW);
  const yA = v => padT + plotH - (v / imprMax) * plotH;
  const yB = v => padT + plotH - (v / clickMax) * plotH;

  const lineA = slice.map((d, i) => `${x(i).toFixed(1)},${yA(d.impressions).toFixed(1)}`).join(" ");
  const lineB = slice.map((d, i) => `${x(i).toFixed(1)},${yB(d.clicks).toFixed(1)}`).join(" ");
  const areaA = `${padL},${padT + plotH} ${lineA} ${x(n - 1).toFixed(1)},${padT + plotH}`;

  let gridLines = "";
  for (let g = 0; g <= 3; g++) {
    const gy = padT + (plotH / 3) * g;
    gridLines += `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${W - padR}" y2="${gy.toFixed(1)}" stroke="#EEF0EA" stroke-width="1"/>`;
  }

  const step = Math.max(1, Math.round(n / 8));
  let xLabels = "";
  slice.forEach((d, i) => {
    if (i % step === 0 || i === n - 1) {
      xLabels += `<text x="${x(i).toFixed(1)}" y="${H - 6}" font-size="9.5" fill="#6B736C" font-family="ui-monospace,monospace" text-anchor="middle">${d.date.slice(5)}</text>`;
    }
  });

  svg.innerHTML = `
    ${gridLines}
    <polygon points="${areaA}" fill="#0F6657" opacity="0.08"/>
    <polyline points="${lineA}" fill="none" stroke="#0F6657" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    <polyline points="${lineB}" fill="none" stroke="#B8792E" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    ${xLabels}
  `;
}

let currentSlice = [];

function renderPerf(days) {
  const all = window.PERFORMANCE_DAILY || [];
  if (all.length === 0) return;
  const slice = all.slice(-days);
  currentSlice = slice;

  const totalImpr = slice.reduce((a, b) => a + b.impressions, 0);
  const totalClicks = slice.reduce((a, b) => a + b.clicks, 0);
  const ctr = totalImpr > 0 ? (totalClicks / totalImpr * 100).toFixed(2) : "0.00";

  document.getElementById("kpiImpr").textContent = fmt(totalImpr);
  document.getElementById("kpiClicks").textContent = fmt(totalClicks);
  document.getElementById("kpiCtr").textContent = ctr + "%";
  document.getElementById("kpiConv").textContent = fmt(Math.round(totalClicks * 0.039));
  document.getElementById("chartRangeLabel").textContent =
    slice[0].date + " ~ " + slice[slice.length - 1].date + ` (${days}일)`;
  document.getElementById("dateFrom").value = slice[0].date;
  document.getElementById("dateTo").value = slice[slice.length - 1].date;

  drawChart(slice);

  const top10 = [...(window.PERFORMANCE_BY_PRODUCT || [])]
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10);

  document.getElementById("perfTableBody").innerHTML = top10.map((p, i) => {
    const labelChip = p.label ? `<span class="chip available">${p.label}</span>` : "—";
    const ctrVal = p.impressions > 0 ? (p.clicks / p.impressions * 100).toFixed(2) : "0.00";
    return `<tr>
      <td class="rowidx">${i + 1}</td>
      <td>${p.offerId || ''}<br><span style="color:var(--muted); font-size:11px;">${p.title || ''}</span></td>
      <td>${p.brand || ''}</td>
      <td>${labelChip}</td>
      <td class="cell-num">${fmt(p.impressions)}</td>
      <td class="cell-num">${fmt(p.clicks)}</td>
      <td class="cell-num">${ctrVal}%</td>
    </tr>`;
  }).join("");
}

function setupDateRangeControls() {
  document.querySelectorAll(".range-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".range-preset").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderPerf(parseInt(btn.dataset.range, 10));
    });
  });

  document.getElementById("applyRange").addEventListener("click", () => {
    const from = new Date(document.getElementById("dateFrom").value);
    const to = new Date(document.getElementById("dateTo").value);
    const days = Math.max(1, Math.round((to - from) / 86400000) + 1);
    document.querySelectorAll(".range-preset").forEach(b => b.classList.remove("active"));
    renderPerf(Math.min(days, (window.PERFORMANCE_DAILY || []).length));
  });
}

/* ============ 속성 뷰: 검색 + 가용성 필터 + 열 선택 + CSV 다운로드 ============ */
let visibleColumns = new Set(DEFAULT_VISIBLE_COLUMNS);

function setupAttributeControls() {
  buildColumnPicker_();
  renderAttrHead_();

  document.getElementById("searchInput").addEventListener("input", renderAttr);
  document.getElementById("filterAvail").addEventListener("input", renderAttr);

  document.getElementById("downloadXlsx").addEventListener("click", downloadFilteredCsv_);

  renderAttr();
}

function buildColumnPicker_() {
  const btn = document.getElementById("colPickerBtn");
  const panel = document.getElementById("colPickerPanel");

  panel.innerHTML = ATTRIBUTE_COLUMNS.map(col => `
    <label>
      <input type="checkbox" data-col="${col.key}" ${visibleColumns.has(col.key) ? "checked" : ""}>
      ${col.label} <span style="color:var(--muted); font-size:10.5px;">(${col.key})</span>
    </label>
  `).join("") + `
    <div class="col-picker-actions">
      <button type="button" id="colPickAll">전체 선택</button>
      <button type="button" id="colPickNone">전체 해제</button>
      <button type="button" id="colPickDefault">기본값</button>
    </div>
  `;

  panel.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener("change", () => {
      if (cb.checked) visibleColumns.add(cb.dataset.col);
      else visibleColumns.delete(cb.dataset.col);
      renderAttrHead_();
      renderAttr();
    });
  });

  panel.querySelector("#colPickAll").addEventListener("click", () => {
    visibleColumns = new Set(ATTRIBUTE_COLUMNS.map(c => c.key));
    buildColumnPicker_(); renderAttrHead_(); renderAttr();
  });
  panel.querySelector("#colPickNone").addEventListener("click", () => {
    visibleColumns = new Set();
    buildColumnPicker_(); renderAttrHead_(); renderAttr();
  });
  panel.querySelector("#colPickDefault").addEventListener("click", () => {
    visibleColumns = new Set(DEFAULT_VISIBLE_COLUMNS);
    buildColumnPicker_(); renderAttrHead_(); renderAttr();
  });

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== btn) panel.classList.remove("open");
  });
}

function activeColumns_() {
  return ATTRIBUTE_COLUMNS.filter(c => visibleColumns.has(c.key));
}

function renderAttrHead_() {
  const cols = activeColumns_();
  const colref = ['<td></td>'].concat(cols.map((_, i) => `<td>${String.fromCharCode(65 + i)}</td>`)).join("");
  const headerRow = ['<th class="rowidx">#</th>'].concat(
    cols.map(c => `<th${c.numeric ? ' style="text-align:right;"' : ''}>${c.label}</th>`)
  ).join("");

  document.getElementById("attrTableHead").innerHTML = `
    <tr class="colref">${colref}</tr>
    <tr>${headerRow}</tr>
  `;
}

function currentFilteredAttrs_() {
  const products = window.PRODUCT_ATTRIBUTES || [];
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  const a = document.getElementById("filterAvail").value;

  return products.filter(p => {
    if (a && p.availability !== a) return false;
    if (!q) return true;
    return Object.values(p).some(v => String(v == null ? "" : v).toLowerCase().includes(q));
  });
}

function renderAttr() {
  const rows = currentFilteredAttrs_();
  const cols = activeColumns_();
  const products = window.PRODUCT_ATTRIBUTES || [];

  document.getElementById("resultCount").textContent =
    `전체 ${products.length}개 중 ${rows.length}개 표시 · ${cols.length}개 열 표시 중`;

  document.getElementById("attrTableBody").innerHTML = rows.map((p, i) => {
    const cells = cols.map(c => {
      let v = p[c.key];
      if (c.key === 'availability') {
        const av = getAvailLabel_(v);
        return `<td><span class="chip ${av[1]}">${av[0]}</span></td>`;
      }
      if (c.key === 'price' || c.key === 'sale_price') return `<td class="cell-num">${v === '' || v == null ? '' : '₩' + fmt(v)}</td>`;
      if (c.numeric) return `<td class="cell-num">${v == null ? '' : v}</td>`;
      return `<td>${v == null || v === '' ? '<span style="color:var(--muted);">—</span>' : v}</td>`;
    }).join("");
    return `<tr><td class="rowidx">${i + 1}</td>${cells}</tr>`;
  }).join("");
}

function downloadFilteredCsv_() {
  const rows = currentFilteredAttrs_();
  const cols = activeColumns_();
  const header = cols.map(c => c.label);
  const lines = [header.join(",")];

  const toCsvValue = v => {
    const s = String(v == null ? "" : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };

  rows.forEach(p => {
    const line = cols.map(c => {
      if (c.key === 'availability') return getAvailLabel_(p.availability)[0];
      return p[c.key];
    }).map(toCsvValue).join(",");
    lines.push(line);
  });

  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "merchant_product_attributes.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ============ 좌측 네비게이션 전환 ============ */
function setupNav() {
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      document.getElementById("view-" + btn.dataset.view).classList.add("active");
      if (btn.dataset.view === "perf" && currentSlice.length) drawChart(currentSlice);
    });
  });
}

/* ============ 초기화 ============ */
function initDashboard() {
  setupDateRangeControls();
  setupAttributeControls();
  setupNav();
  const days = Math.min(30, (window.PERFORMANCE_DAILY || []).length);
  if (days > 0) renderPerf(days);
}
