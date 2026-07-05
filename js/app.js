/**
 * 렌더링 로직 — 이 파일은 나중에 자동화를 붙여도 수정할 필요가 없습니다.
 * data.sample.js 의 세 배열(PERFORMANCE_DAILY / PERFORMANCE_BY_PRODUCT /
 * PRODUCT_ATTRIBUTES)의 "형태"만 유지된 채 실데이터로 교체되면 그대로 동작합니다.
 */

const availLabel = {
  in_stock: ["판매중", "available"],
  limited: ["재고 부족", "limited"],
  out_of_stock: ["품절", "oos"],
  // 실제 Merchant API 값 (언더바 없이 띄어쓰기로 내려옴) 도 함께 매핑
  "in stock": ["판매중", "available"],
  "limited availability": ["재고 부족", "limited"],
  "out of stock": ["품절", "oos"],
  preorder: ["예약주문", "limited"],
  backorder: ["입고 예정", "limited"]
};

/** 알 수 없는 availability 값이 와도 에러 안 나게 안전하게 조회 */
function getAvailLabel_(value) {
  return availLabel[value] || [value || "알 수 없음", "limited"];
}

const fmt = n => n.toLocaleString("ko-KR");

/* ============ 순수 SVG 라인 차트 (외부 라이브러리 없음) ============ */
function drawChart(slice) {
  const svg = document.getElementById("perfChart");
  const W = 760, H = 220, padL = 40, padR = 40, padT = 14, padB = 22;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  const imprMax = Math.max(...slice.map(d => d.impressions)) * 1.1;
  const clickMax = Math.max(...slice.map(d => d.clicks)) * 1.1;
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

/* ============ 날짜 범위 필터링 + KPI/차트/테이블 렌더 ============ */
let currentSlice = [];

function renderPerf(days) {
  const all = window.PERFORMANCE_DAILY;
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

  const top10 = [...window.PERFORMANCE_BY_PRODUCT]
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10);

  document.getElementById("perfTableBody").innerHTML = top10.map((p, i) => {
    const labelChip = p.label ? `<span class="chip available">${p.label}</span>` : "—";
    const ctrVal = p.impressions > 0 ? (p.clicks / p.impressions * 100).toFixed(2) : "0.00";
    return `<tr>
      <td class="rowidx">${i + 1}</td>
      <td>${p.offerId}<br><span style="color:var(--muted); font-size:11px;">${p.title || ''}</span></td>
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
    renderPerf(Math.min(days, window.PERFORMANCE_DAILY.length));
  });
}

/* ============ 속성 뷰: 검색 + 필터 + CSV 다운로드 ============ */
function setupAttributeControls() {
  const products = window.PRODUCT_ATTRIBUTES;
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

  const brandSel = document.getElementById("filterBrand");
  const catSel = document.getElementById("filterCategory");
  brandSel.innerHTML = '<option value="">브랜드 전체</option>';
  catSel.innerHTML = '<option value="">카테고리 전체</option>';
  brands.forEach(b => brandSel.insertAdjacentHTML("beforeend", `<option value="${b}">${b}</option>`));
  categories.forEach(c => catSel.insertAdjacentHTML("beforeend", `<option value="${c}">${c}</option>`));

  function currentFiltered() {
    const q = document.getElementById("searchInput").value.trim().toLowerCase();
    const b = brandSel.value, c = catSel.value, a = document.getElementById("filterAvail").value;
    return products.filter(p => {
      const title = (p.title || "").toLowerCase();
      const offerId = (p.offerId || "").toLowerCase();
      if (q && !(title.includes(q) || offerId.includes(q))) return false;
      if (b && p.brand !== b) return false;
      if (c && p.category !== c) return false;
      if (a && p.availability !== a) return false;
      return true;
    });
  }

  function renderAttr() {
    const rows = currentFiltered();
    document.getElementById("resultCount").textContent =
      `전체 ${products.length}개 중 ${rows.length}개 표시`;

    document.getElementById("attrTableBody").innerHTML = rows.map((p, i) => {
      const av = getAvailLabel_(p.availability);
      const labelText = p.label ? p.label : '<span style="color:var(--muted);">—</span>';
      return `<tr>
        <td class="rowidx">${i + 1}</td>
        <td>${p.offerId || ''}</td>
        <td>${p.title || ''}</td>
        <td>${p.brand || ''}</td>
        <td>${p.category || ''}</td>
        <td class="cell-num">₩${fmt(p.price || 0)}</td>
        <td><span class="chip ${av[1]}">${av[0]}</span></td>
        <td>${labelText}</td>
      </tr>`;
    }).join("");
  }

  [document.getElementById("searchInput"), brandSel, catSel, document.getElementById("filterAvail")]
    .forEach(el => el.addEventListener("input", renderAttr));

  document.getElementById("downloadXlsx").addEventListener("click", () => {
    const rows = currentFiltered();
    const header = ["offer_id", "제품명", "브랜드", "카테고리", "가격", "가용성", "커스텀라벨"];
    const lines = [header.join(",")];

    const toCsvValue = v => {
      const s = String(v == null ? "" : v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };

    rows.forEach(p => {
      const av = getAvailLabel_(p.availability);
      lines.push([
        p.offerId, p.title, p.brand, p.category, p.price, av[0], p.label
      ].map(toCsvValue).join(","));
    });

    const csvContent = "\uFEFF" + lines.join("\r\n"); // BOM 포함 → 엑셀에서 한글 깨짐 방지
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merchant_product_attributes.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  renderAttr();
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
// 주의: 여기서 바로 실행하지 않습니다. 실데이터 로드가 끝난 뒤(loadLiveData.js)
// initDashboard()가 호출되어 실행됩니다 (샘플 데이터만 쓸 때도 동일하게 호출됨).
function initDashboard() {
  setupDateRangeControls();
  setupAttributeControls();
  setupNav();
  const days = Math.min(30, window.PERFORMANCE_DAILY.length);
  renderPerf(days);
}