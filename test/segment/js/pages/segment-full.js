// segment-full.js (필요 부분만 교체/추가)

(function () {
  const { parseNumberInput, formatWithComma } = window.SevenSegCore;
  const { getLow, getHigh, getBase } = window.PriceCalc;
  const { makeMode1OptionsForValue } = window.Ambiguity;

  function renderTextCards(container, base, low, high) {
    container.innerHTML = '';
    const items = [
      { label: '하한', value: low },
      { label: '기준', value: base },
      { label: '상한', value: high },
    ];
    for (const it of items) {
      const card = document.createElement('div');
      card.style.minWidth = '180px';
      card.style.border = '1px solid #e5e7eb';
      card.style.borderRadius = '10px';
      card.style.padding = '10px 12px';
      card.style.background = '#fafafa';
      card.innerHTML =
        `<div style="font-size:12px;color:#555;">${it.label}</div>` +
        `<div style="font-weight:700;font-size:20px;">${formatWithComma(
          it.value
        )}</div>`;
      container.appendChild(card);
    }
  }

  function main() {
    const baselineInput = document.getElementById('baselineInput');
    const slider = document.getElementById('rangeSlider');
    const rangeLabel = document.getElementById('rangeLabel');
    const textResults = document.getElementById('textResults');

    const mountLow = document.querySelector('#box-low');
    const mountBase = document.querySelector('#box-base');
    const mountHigh = document.querySelector('#box-high');

    // 버튼 참조(없어도 에러 안 나게)
    const btnNormal = document.getElementById('modeNormal') || null;
    const btnMode1 = document.getElementById('mode1') || null;
    const btnMode2 = document.getElementById('mode2') || null;
    const btnToggleBase = document.getElementById('toggleBasePanel') || null;
    const btnOpenPreview = document.getElementById('openPreview') || null;
    const btnClosePreview = document.getElementById('closePreview') || null;
    const previewModal = document.getElementById('previewModal') || null;
    const previewMask = document.getElementById('previewMask') || null;

    let mode = 'mode1'; // 기본 모드

    // 박스 인스턴스
    let boxLow = null,
      boxBase = null,
      boxHigh = null;

    function createBoxesForMode() {
      mountLow.innerHTML = '';
      mountBase.innerHTML = '';
      mountHigh.innerHTML = '';

      if (mode === 'mode2') {
        boxLow = window.SegBoxMode2({ mountEl: mountLow, title: '하한 (Low)' });
        boxBase = window.SegBoxMode2({
          mountEl: mountBase,
          title: '기준 (Baseline)',
        });
        boxHigh = window.SegBoxMode2({
          mountEl: mountHigh,
          title: '상한 (High)',
        });
      } else {
        boxLow = window.SegBox({ mountEl: mountLow, title: '하한 (Low)' });
        boxBase = window.SegBox({
          mountEl: mountBase,
          title: '기준 (Baseline)',
        });
        boxHigh = window.SegBox({ mountEl: mountHigh, title: '상한 (High)' });
      }
    }
    // 기준 패널(가운데 박스) 토글
    function bindBaseToggle() {
      if (!btnToggleBase || !mountBase) return;

      let hidden = false;
      btnToggleBase.addEventListener('click', () => {
        hidden = !hidden;
        mountBase.style.display = hidden ? 'none' : '';
        btnToggleBase.textContent = hidden
          ? '기준 패널 보이기'
          : '기준 패널 숨기기';
      });
    }

    function setModeButtons() {
      const sOn = 'background:#111;color:#fff;border-color:#111';
      const sOff = 'background:#fff;color:#000;border-color:#ccc';
      const apply = (btn, isOn) => {
        if (!btn) return;
        btn.style.cssText = `padding:6px 10px;border:1px solid;border-radius:8px;cursor:pointer;${
          isOn ? sOn : sOff
        }`;
      };
      apply(btnNormal, mode === 'normal');
      apply(btnMode1, mode === 'mode1');
      apply(btnMode2, mode === 'mode2');
    }

    function setMode(next) {
      mode = next;
      setModeButtons();
      createBoxesForMode();
      renderAll();
    }
    // --- Preview Modal ---
    function showPreviewMask(show) {
      if (!previewMask || !previewModal) return;
      previewMask.style.display = show ? 'block' : 'none';
      previewModal.style.display = show ? 'flex' : 'none';
    }

    function clonePhotoGridTo(target) {
      const src = document.getElementById('photoPreview');
      if (!src || !target) return;
      target.innerHTML = src.innerHTML; // 썸네일 DOM 그대로 복제
    }

    function fillInfoGrid(target) {
      if (!target) return;
      const name = (document.getElementById('productName') || {}).value || '';
      const brand = (document.getElementById('productBrand') || {}).value || '';
      const size = (document.getElementById('productSize') || {}).value || '';
      target.innerHTML = `
    <div style="padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px"><div style="font-size:12px;color:#555">상품명</div><div style="font-weight:700">${
      name || '-'
    }</div></div>
    <div style="padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px"><div style="font-size:12px;color:#555">브랜드</div><div style="font-weight:700">${
      brand || '-'
    }</div></div>
    <div style="padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px"><div style="font-size:12px;color:#555">사이즈</div><div style="font-weight:700">${
      size || '-'
    }</div></div>
  `;
    }

    // 모달용 박스 생성(현재 mode/기준패널 숨김여부 반영)
    function createPreviewBoxes(modeNow) {
      const pmLow = document.getElementById('p-low');
      const pmBase = document.getElementById('p-base');
      const pmHigh = document.getElementById('p-high');
      if (!pmLow || !pmBase || !pmHigh)
        return { pLow: null, pBase: null, pHigh: null };

      pmLow.innerHTML = pmBase.innerHTML = pmHigh.innerHTML = '';

      let pLow, pBase, pHigh;
      if (modeNow === 'mode2') {
        pLow = window.SegBoxMode2({ mountEl: pmLow, title: '하한 (Low)' });
        pBase = window.SegBoxMode2({
          mountEl: pmBase,
          title: '기준 (Baseline)',
        });
        pHigh = window.SegBoxMode2({ mountEl: pmHigh, title: '상한 (High)' });
      } else if (modeNow === 'mode1' || modeNow === 'normal') {
        pLow = window.SegBox({ mountEl: pmLow, title: '하한 (Low)' });
        pBase = window.SegBox({ mountEl: pmBase, title: '기준 (Baseline)' });
        pHigh = window.SegBox({ mountEl: pmHigh, title: '상한 (High)' });
      }
      // 기준 패널 숨김 반영: 본문 기준 DOM의 display를 그대로 따름
      const baseHidden =
        document.getElementById('box-base')?.style.display === 'none';
      document.getElementById('p-base').style.display = baseHidden
        ? 'none'
        : '';

      return { pLow, pBase, pHigh };
    }

    function renderPreviewPanels(modeNow) {
      const base = parseNumberInput(baselineInput?.value ?? 0);
      const percent = Number(slider?.value ?? 0);
      const baseI = getBase(base);
      const low = getLow(base, percent);
      const high = getHigh(base, percent);

      const { pLow, pBase, pHigh } = createPreviewBoxes(modeNow);
      if (!pLow || !pHigh) return;

      if (modeNow === 'normal') {
        pLow.render(low);
        pBase && pBase.render(baseI);
        pHigh.render(high);
      } else if (modeNow === 'mode1') {
        const optLow = makeMode1OptionsForValue(low, {
          highlightColor: '#f97316',
        });
        const optBase = makeMode1OptionsForValue(baseI, {
          highlightColor: '#f97316',
        });
        const optHigh = makeMode1OptionsForValue(high, {
          highlightColor: '#f97316',
        });
        pLow.render(low, optLow);
        pBase && pBase.render(baseI, optBase);
        pHigh.render(high, optHigh);
      } else {
        // mode2
        pLow.render(low);
        pBase && pBase.render(baseI);
        pHigh.render(high);
      }
    }

    function openPreview() {
      // 상단 정보/사진 복제
      fillInfoGrid(document.getElementById('previewInfo'));
      clonePhotoGridTo(document.getElementById('previewPhotos'));

      // 현재 모드/상태 그대로 반영
      renderPreviewPanels(mode);
      showPreviewMask(true);
    }

    function renderAll() {
      const base = parseNumberInput(baselineInput?.value ?? 0);
      const percent = Number(slider?.value ?? 0);
      if (rangeLabel) rangeLabel.textContent = `현재 범위: ±${percent}%`;

      const baseI = getBase(base);
      const low = getLow(base, percent);
      const high = getHigh(base, percent);

      if (textResults) renderTextCards(textResults, baseI, low, high);

      if (!boxLow || !boxBase || !boxHigh) createBoxesForMode();

      if (mode === 'normal') {
        boxLow.render(low);
        boxBase.render(baseI);
        boxHigh.render(high);
      } else if (mode === 'mode1') {
        const optLow = makeMode1OptionsForValue(low, {
          highlightColor: '#f97316',
        });
        const optBase = makeMode1OptionsForValue(baseI, {
          highlightColor: '#f97316',
        });
        const optHigh = makeMode1OptionsForValue(high, {
          highlightColor: '#f97316',
        });
        boxLow.render(low, optLow);
        boxBase.render(baseI, optBase);
        boxHigh.render(high, optHigh);
      } else {
        // mode2
        boxLow.render(low);
        boxBase.render(baseI);
        boxHigh.render(high);
      }
    }

    // 이벤트 (버튼이 있을 때만 안전하게 바인딩)
    btnNormal && btnNormal.addEventListener('click', () => setMode('normal'));
    btnMode1 && btnMode1.addEventListener('click', () => setMode('mode1'));
    btnMode2 && btnMode2.addEventListener('click', () => setMode('mode2'));

    baselineInput && baselineInput.addEventListener('input', renderAll);
    slider && slider.addEventListener('input', renderAll);
    document.getElementById('renderBtn')?.addEventListener('click', renderAll);

    // 초기 1회 설정
    createBoxesForMode();
    setModeButtons();
    renderAll();
    bindBaseToggle();
    btnOpenPreview && btnOpenPreview.addEventListener('click', openPreview);
    btnClosePreview &&
      btnClosePreview.addEventListener('click', () => showPreviewMask(false));
    previewMask &&
      previewMask.addEventListener('click', () => showPreviewMask(false)); // 마스크 클릭 닫기
  }

  window.addEventListener('DOMContentLoaded', main);
})();
