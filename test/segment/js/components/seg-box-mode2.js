// seg-box-mode2.js
// Mode2: 앞에서 2번째 자릿수(0-based 1)만 대상으로,
// 동일 좌표의 "가림막" 7개를 처음부터 모두 표시하고,
// 사용자가 2~3개까지만 제거(해제)할 수 있게 한다.

(function (global) {
  const { formatWithComma, renderSevenSegmentString, getSegmentLayout } =
    global.SevenSegCore;

  function SegBoxMode2({
    mountEl,
    title,
    onColor = '#16a34a',
    offColor = '#e5e7eb',
    highlightColor = '#f97316',
    defaultRemovals = 3, // 2 또는 3
    targetDigitIndex = 1, // 앞에서 2번째 자릿수
  }) {
    const root =
      typeof mountEl === 'string' ? document.querySelector(mountEl) : mountEl;
    if (!root)
      throw new Error('SegBoxMode2 mount target not found: ' + mountEl);

    // --- 프레임 ---
    root.style.border = '1px solid #e5e7eb';
    root.style.borderRadius = '14px';
    root.style.padding = '12px 14px';
    root.style.background = '#fff';
    root.style.minWidth = '320px';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.gap = '10px';

    const head = document.createElement('div');
    head.style.display = 'flex';
    head.style.justifyContent = 'space-between';
    head.style.alignItems = 'center';
    root.appendChild(head);

    const titleEl = document.createElement('div');
    titleEl.textContent = title;
    titleEl.style.fontSize = '13px';
    titleEl.style.color = '#6b7280';
    titleEl.style.fontWeight = '600';
    head.appendChild(titleEl);

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '8px';
    head.appendChild(controls);

    const btn2 = document.createElement('button');
    btn2.textContent = '2개';
    btn2.style.cssText =
      'padding:4px 8px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer';

    const btn3 = document.createElement('button');
    btn3.textContent = '3개';
    btn3.style.cssText =
      'padding:4px 8px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer';

    const remainEl = document.createElement('span');
    remainEl.style.fontSize = '12px';
    remainEl.style.color = '#334155';

    controls.appendChild(btn2);
    controls.appendChild(btn3);
    controls.appendChild(remainEl);

    const body = document.createElement('div');
    body.style.position = 'relative';
    root.appendChild(body);

    // --- 상태 ---
    let maxRemovals = defaultRemovals === 2 ? 2 : 3;
    let removed = 0; // 해제된(보이게 된) 개수
    let currentValue = 0;

    function paintModeButtons() {
      const on = 'background:#111;color:#fff;border-color:#111';
      const off = 'background:#fff;color:#000;border-color:#ccc';
      if (maxRemovals === 2) {
        btn2.style.cssText = `padding:4px 8px;border:1px solid;border-radius:8px;cursor:pointer;${on}`;
        btn3.style.cssText = `padding:4px 8px;border:1px solid;border-radius:8px;cursor:pointer;${off}`;
      } else {
        btn3.style.cssText = `padding:4px 8px;border:1px solid;border-radius:8px;cursor:pointer;${on}`;
        btn2.style.cssText = `padding:4px 8px;border:1px solid;border-radius:8px;cursor:pointer;${off}`;
      }
    }
    function updateRemainLabel() {
      remainEl.textContent = `잔여 제거: ${
        maxRemovals - removed
      }/${maxRemovals}`;
    }

    btn2.addEventListener('click', () => {
      maxRemovals = 2;
      render(currentValue); // 모드 바꾸면 초기화
    });
    btn3.addEventListener('click', () => {
      maxRemovals = 3;
      render(currentValue);
    });

    // --- 마스크 미세 조정 상수 ---
    //  - Y_OFFSET: 가림막이 약간 아래로 내려가 보였다는 제보 → 위로 2px 올림
    //  - W_SCALE : 좌우 폭을 1% 넓힘(중앙 기준으로 양쪽으로 0.5%씩 확장)
    //  - COLOR   : 완전 검은색
    const Y_OFFSET = -2.8; // px, 음수면 위로
    const W_SCALE = 1.02; // 1% 확장
    const MASK_COLOR = '#000'; // 완전 검은색
    const MASK_OPACITY = 1; // 완전 불투명(해제 전)

    // --- 핵심: 렌더 ---
    function render(value) {
      currentValue = Math.round(value);
      body.innerHTML = '';
      removed = 0;
      paintModeButtons();
      updateRemainLabel();

      const str = formatWithComma(currentValue);

      // (1) 기본 7세그 렌더(모든 자릿수 표시). 목표 자릿수에는 강조색 적용.
      renderSevenSegmentString(str, body, {
        segmentOn: onColor,
        segmentOff: offColor,
        width: 56,
        height: 98,
        getDigitOptions: (i, ch) =>
          i === targetDigitIndex && /[0-9]/.test(ch)
            ? { segmentOn: highlightColor }
            : {},
      });

      // (2) 타깃 자릿수 SVG 찾기
      const row = body.firstElementChild; // renderSevenSegmentString이 만든 flex row
      if (!row) return;

      const digitSvgs = [];
      for (const el of row.children) {
        if (el.tagName?.toLowerCase?.() === 'svg') {
          const w = Number(el.getAttribute('width') || '0');
          if (w >= 40) digitSvgs.push(el); // 숫자만
        }
      }
      const targetSvg = digitSvgs[targetDigitIndex];
      if (!targetSvg) return; // 대상 자릿수가 없으면 종료

      // (3) 타깃 자릿수 위에 동일 viewBox의 overlay SVG를 절대좌표로 덮기
      const wrap = document.createElement('div');
      wrap.style.position = 'relative';
      wrap.style.display = 'inline-block';
      wrap.style.width = targetSvg.getAttribute('width') || '56px';
      wrap.style.height = targetSvg.getAttribute('height') || '98px';

      targetSvg.parentNode.insertBefore(wrap, targetSvg);
      wrap.appendChild(targetSvg);

      const overlay = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      overlay.setAttribute('width', wrap.style.width);
      overlay.setAttribute('height', wrap.style.height);
      overlay.setAttribute(
        'viewBox',
        targetSvg.getAttribute('viewBox') || '0 0 80 140'
      );
      overlay.style.position = 'absolute';
      overlay.style.left = '0';
      overlay.style.top = '0';
      overlay.style.pointerEvents = 'auto';
      wrap.appendChild(overlay);

      // (4) 레이아웃 좌표로 가림막 7개 생성 (미세 보정 적용)
      const layout = getSegmentLayout();
      const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

      keys.forEach((key) => {
        const rdef = layout.rects[key];

        // 1) 폭 1% 확장 (중앙 기준 양쪽으로)
        const w = rdef.w * W_SCALE;
        const x = rdef.x - (w - rdef.w) / 2;

        // 2) 세로 위치 미세 보정 (위로 2px)
        const y = rdef.y + Y_OFFSET;

        const r = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'rect'
        );
        r.setAttribute('x', x);
        r.setAttribute('y', y);
        r.setAttribute('width', w);
        r.setAttribute('height', rdef.h);
        r.setAttribute('rx', rdef.rx ?? 6);
        r.setAttribute('ry', rdef.ry ?? 6);

        // 완전 검은색(해제 전), 클릭 시 0으로 만들어 숫자가 드러남
        r.setAttribute('fill', MASK_COLOR);
        r.setAttribute('fill-opacity', String(MASK_OPACITY));
        r.style.cursor = 'pointer';

        // 클릭 시 "가림 해제" (한 번 해제하면 다시 가릴 수 없음)
        let revealed = false;
        r.addEventListener('click', () => {
          if (revealed) return;
          if (removed >= maxRemovals) return;
          revealed = true;
          removed++;
          r.setAttribute('fill-opacity', '0');
          updateRemainLabel();
        });

        overlay.appendChild(r);
      });

      // 초기 라벨
      updateRemainLabel();
    }

    paintModeButtons();
    updateRemainLabel();

    return { render };
  }

  global.SegBoxMode2 = SegBoxMode2;
})(window);
