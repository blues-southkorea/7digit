// test/segment/js/pages/segment-base-only.js
(function () {
  const { parseNumberInput } = window.SevenSegCore;

  function main() {
    const baselineInput = document.getElementById('baselineInput');
    // 기준값 전용 타겟을 HTML에 두세요: <div id="box-base-only"></div>
    const seg = window.SegBox({
      mountEl: '#box-base-only',
      title: '기준 (Baseline)',
    });

    function renderBaseOnly() {
      const base = parseNumberInput(baselineInput.value);
      seg.render(Math.round(base), { separators: 'none' });
    }

    baselineInput.addEventListener('input', renderBaseOnly);
    document
      .getElementById('renderBtn')
      ?.addEventListener('click', renderBaseOnly);

    renderBaseOnly();
  }

  window.addEventListener('DOMContentLoaded', main);
})();
