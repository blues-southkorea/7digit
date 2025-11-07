// test/segment/js/components/seg-box.js
(function (global) {
  const { formatWithComma, renderSevenSegmentString } = global.SevenSegCore;

  function SegBox({
    mountEl,
    title,
    onColor = '#16a34a',
    offColor = '#e5e7eb',
    separators = 'dot',
  }) {
    const root =
      typeof mountEl === 'string' ? document.querySelector(mountEl) : mountEl;
    if (!root) throw new Error('SegBox mount target not found: ' + mountEl);

    root.style.border = '1px solid #e5e7eb';
    root.style.borderRadius = '14px';
    root.style.padding = '12px 14px';
    root.style.background = '#fff';
    root.style.minWidth = '320px';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.gap = '10px';

    const h = document.createElement('div');
    h.textContent = title;
    h.style.fontSize = '13px';
    h.style.color = '#6b7280';
    h.style.fontWeight = '600';
    root.appendChild(h);

    const body = document.createElement('div');
    root.appendChild(body);

    function render(value, options = {}) {
      body.innerHTML = '';
      const str = formatWithComma(value);
      renderSevenSegmentString(str, body, {
        segmentOn: onColor,
        segmentOff: offColor,
        width: 56,
        height: 98,
        separators,
        ...options,
      });
    }

    return { render };
  }

  global.SegBox = SegBox;
})(window);
