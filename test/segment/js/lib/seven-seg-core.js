// test/segment/js/lib/seven-seg-core.js
(function (global) {
  // ---------- Utilities ----------
  function parseNumberInput(str) {
    const num = Number(String(str).replace(/[^\d.-]/g, ''));
    return isFinite(num) ? num : 0;
  }
  function formatWithComma(n) {
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(Math.round(n));
    return sign + abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // ---------- Segment maps ----------
  const SEG_MAP = {
    0: ['a', 'b', 'c', 'd', 'e', 'f'],
    1: ['b', 'c'],
    2: ['a', 'b', 'g', 'e', 'd'],
    3: ['a', 'b', 'g', 'c', 'd'],
    4: ['f', 'g', 'b', 'c'],
    5: ['a', 'f', 'g', 'c', 'd'],
    6: ['a', 'f', 'g', 'c', 'd', 'e'],
    7: ['a', 'b', 'c'],
    8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    9: ['a', 'b', 'c', 'd', 'f', 'g'],
    '-': ['g'],
  };

  // 코어가 사용하는 정확한 세그먼트 좌표/크기 반환
  function getSegmentLayout() {
    const W = 80,
      H = 140,
      T = 12,
      G = 6;
    const rx = 6,
      ry = 6;
    return {
      viewBox: { W, H },
      rects: {
        a: { x: G + T, y: G, w: W - G * 2 - T * 2, h: T, rx, ry },
        b: { x: W - G - T, y: G + T, w: T, h: H / 2 - G * 2 - T, rx, ry },
        c: { x: W - G - T, y: H / 2 + G, w: T, h: H / 2 - G * 2 - T, rx, ry },
        d: { x: G + T, y: H - G - T, w: W - G * 2 - T * 2, h: T, rx, ry },
        e: { x: G, y: H / 2 + G, w: T, h: H / 2 - G * 2 - T, rx, ry },
        f: { x: G, y: G + T, w: T, h: H / 2 - G * 2 - T, rx, ry },
        g: { x: G + T, y: H / 2 - T / 2, w: W - G * 2 - T * 2, h: T, rx, ry },
      },
    };
  }

  function getActiveSegments(ch) {
    return SEG_MAP[ch] ? [...SEG_MAP[ch]] : [];
  }

  // ---------- Core drawing ----------
  function createDigitSVG(char, options = {}, hiddenSet = new Set()) {
    const {
      segmentOn = '#16a34a',
      segmentOff = '#e5e7eb',
      width = 56,
      height = 98,
    } = options;

    const { viewBox, rects } = getSegmentLayout();
    const { W, H } = viewBox;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const active = new Set(SEG_MAP[char] || []);
    Object.entries(rects).forEach(([key, rDef]) => {
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('x', rDef.x);
      r.setAttribute('y', rDef.y);
      r.setAttribute('width', rDef.w);
      r.setAttribute('height', rDef.h);
      r.setAttribute('rx', String(rDef.rx ?? 6));
      r.setAttribute('ry', String(rDef.ry ?? 6));
      const on = active.has(key) && !hiddenSet.has(key);
      r.setAttribute('fill', on ? segmentOn : segmentOff);
      svg.appendChild(r);
    });
    return svg;
  }

  // 콤마는 완전 무시(점 렌더 금지).
  // opts:
  // - segmentOn / segmentOff / width / height
  // - getHiddenSegments?(digitIdx, char) -> string[]|Set
  // - getDigitOptions?(digitIdx, char) -> {segmentOn?, segmentOff?}
  function renderSevenSegmentString(str, wrapper, opts = {}) {
    const { getHiddenSegments, getDigitOptions } = opts;

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '8px';

    let digitIdx = 0; // 숫자 자릿수 인덱싱(콤마/기호 제외)

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];

      if (/[0-9-]/.test(ch)) {
        let perDigit = {};
        if (typeof getDigitOptions === 'function') {
          perDigit = getDigitOptions(digitIdx, ch) || {};
        }
        let hiddenSet = new Set();
        if (typeof getHiddenSegments === 'function') {
          const hs = getHiddenSegments(digitIdx, ch);
          if (Array.isArray(hs)) hiddenSet = new Set(hs);
          else if (hs instanceof Set) hiddenSet = hs;
        }

        row.appendChild(
          createDigitSVG(ch, { ...opts, ...perDigit }, hiddenSet)
        );
        if (/[0-9]/.test(ch)) digitIdx++;
      } else if (ch === ',') {
        // 완전 무시
        continue;
      } else {
        // 그 외 문자 → 공백 폭 0으로 처리(시각 영향 최소화)
        const spacer = document.createElement('div');
        spacer.style.width = '0px';
        row.appendChild(spacer);
      }
    }
    wrapper.appendChild(row);
  }

  global.SevenSegCore = {
    parseNumberInput,
    formatWithComma,
    renderSevenSegmentString,
    getActiveSegments,
    getSegmentLayout,
  };
})(window);
