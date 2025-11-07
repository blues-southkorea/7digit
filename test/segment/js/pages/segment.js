// test/segment/js/pages/segment.js
(function () {
  const { parseNumberInput, formatWithComma } = window.SevenSegCore;

  // 퍼밀 해석: ±N‰ = ±(N/10)%
  function calcBoundsByPermille(base, permille) {
    const pct = permille / 1000; // 5‰ → 0.005
    return { low: base * (1 - pct), high: base * (1 + pct) };
  }

  function renderTextCards(container, base, low, high) {
    container.innerHTML = '';
    const items = [
      { label: '하한', value: Math.round(low) },
      { label: '기준', value: base },
      { label: '상한', value: Math.round(high) },
    ];
    for (const it of items) {
      const card = document.createElement('div');
      card.style.minWidth = '180px';
      card.style.border = '1px solid #e5e7eb';
      card.style.borderRadius = '10px';
      card.style.padding = '10px 12px';
      card.style.background = '#fafafa';
      card.innerHTML = `<div style="font-size:12px;color:#555;">${
        it.label
      }</div>
                        <div style="font-weight:700;font-size:20px;">${formatWithComma(
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

    // 세 개의 “각자 담당” 박스
    const boxLow = window.SegBox({ mountEl: '#box-low', title: '하한 (Low)' });
    const boxBase = window.SegBox({
      mountEl: '#box-base',
      title: '기준 (Baseline)',
    });
    const boxHigh = window.SegBox({
      mountEl: '#box-high',
      title: '상한 (High)',
    });

    function renderAll() {
      const base = parseNumberInput(baselineInput.value);
      const permille = Number(slider.value);
      rangeLabel.textContent = `현재 범위: ±${permille}‰ (±${permille / 10}%)`;

      const { low, high } = calcBoundsByPermille(base, permille);
      const baseI = Math.round(base);
      const lowI = Math.round(low);
      const highI = Math.round(high);

      renderTextCards(textResults, baseI, lowI, highI);

      boxLow.render(lowI, { separators: 'none' });
      boxBase.render(base, { separators: 'none' });
      boxHigh.render(highI, { separators: 'none' });
    }

    baselineInput.addEventListener('input', renderAll);
    slider.addEventListener('input', renderAll);
    document.getElementById('renderBtn')?.addEventListener('click', renderAll);

    renderAll();
  }

  window.addEventListener('DOMContentLoaded', main);
})();
