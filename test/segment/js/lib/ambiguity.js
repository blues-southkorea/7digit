// test/segment/js/lib/ambiguity.js
(function (global) {
  const { getActiveSegments } = global.SevenSegCore;

  // 유틸: 배열 섞기
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 대상 자릿수(앞에서 2번째 = 0-based 1)
  const TARGET_DIGIT_INDEX = 1;
  // [ADD] 0~9에서 각 세그먼트가 켜지는 빈도 계산
  const SEG_ORDER = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const SEG_ON_COUNT = (() => {
    const counts = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0 };
    for (let d = 0; d <= 9; d++) {
      const on = getActiveSegments(String(d)) || [];
      for (const s of on) counts[s]++;
    }
    // 예시: a:8, b:8, c:9, d:7, e:4, f:6, g:7 (환경에 맞춰 자동 계산)
    return counts;
  })();

  // [ADD] (도움 함수) active 리스트에서 "희소한 순(=빈도 낮은 순)"으로 K개 뽑기
  function pickKFromTopRare(activeList, k) {
    // 희소→흔함 정렬
    const ranked = activeList
      .slice()
      .sort((s1, s2) => SEG_ON_COUNT[s1] - SEG_ON_COUNT[s2]);

    // 너무 반복적으로 같은 조합이 되지 않도록, 희소 상위 1~3개 중에서 섞어서 우선 선택
    const pool = ranked.slice(0, Math.min(3, ranked.length));
    const shuffled = shuffle(pool);
    const picked = shuffled.slice(0, Math.min(k, shuffled.length));

    // 부족하면 계속 희소 순으로 채움
    if (picked.length < k) {
      for (const s of ranked) {
        if (picked.length >= k) break;
        if (!picked.includes(s)) picked.push(s);
      }
    }
    return picked;
  }

  // 숫자 문자열에서 콤마/공백 등 제거
  function onlyDigits(str) {
    return String(str).replace(/[^\d]/g, '');
  }

  // 대상 자릿수(숫자 기준 인덱스)의 문자 추출
  function getTargetDigitChar(value) {
    // 숫자만 카운트(하이픈, 콤마 등 제외) — seven-seg-core의 digitIdx 기준과 동일
    const s = String(value);
    let digitIdx = 0;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (/[0-9]/.test(ch)) {
        if (digitIdx === TARGET_DIGIT_INDEX) return ch;
        digitIdx++;
      }
    }
    return null; // 대상 자릿수가 없음
  }

  // [REPLACE] 대상 자릿수용 제거 세그먼트 선택: "희소 ON"을 우선 가림
  function chooseHiddenSegmentsForDigitChar(digitChar) {
    const active = getActiveSegments(digitChar) || [];
    if (active.length === 0) return new Set();

    // 숨길 개수: 2 또는 3 (단, active 전부 가리는 일은 절대 금지)
    const Kraw = 2 + Math.round(Math.random()); // 2 or 3
    const K = Math.min(Kraw, Math.max(1, active.length - 1));

    // 핵심: 빈도가 낮은(=결정적) 활성 세그먼트를 우선 가린다 → 모호성↑, 직관(공통 스트로크)은 남김
    const picks = pickKFromTopRare(active, K);

    // 보안망: K 제한으로 이미 보장되지만, 의미적으로 "하나는 반드시 보이도록" 유지
    return new Set(picks);
  }

  // 공개 API: 기존 시그니처 유지
  // makeMode1OptionsForValue(value, { highlightColor? })
  function makeMode1OptionsForValue(value, opts = {}) {
    const { highlightColor } = opts;

    // 대상 자릿수의 실제 숫자 문자 확인(없으면 모호화 없음)
    const targetChar = getTargetDigitChar(value);
    const hiddenForTarget =
      targetChar && /[0-9]/.test(targetChar)
        ? chooseHiddenSegmentsForDigitChar(targetChar)
        : new Set();

    function getHiddenSegments(idx, ch) {
      // 숫자만 카운트하는 digitIdx 기준: 오직 TARGET_DIGIT_INDEX에서만 제거
      if (/[0-9]/.test(ch) && idx === TARGET_DIGIT_INDEX) {
        // 항상 2~3개 제거(0개 제거 금지)
        return hiddenForTarget;
      }
      return new Set(); // 다른 자릿수는 제거하지 않음
    }

    function getDigitOptions(idx, ch) {
      if (highlightColor && /[0-9]/.test(ch) && idx === TARGET_DIGIT_INDEX) {
        return { segmentOn: highlightColor };
      }
      return {};
    }

    return { getHiddenSegments, getDigitOptions };
  }

  global.Ambiguity = {
    makeMode1OptionsForValue,
  };
})(window);
