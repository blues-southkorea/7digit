// test/segment/js/lib/calc.js
(function (global) {
  // 퍼센트 해석: N% = N/100
  function boundsByPercent(base, percent) {
    const pct = Number(percent) / 100; // 10 → 0.10
    return { low: base * (1 - pct), high: base * (1 + pct) };
  }

  // 외부에 노출되는 API (이전 함수명 유지)
  function getLow(base, percent) {
    return Math.round(boundsByPercent(base, percent).low);
  }
  function getHigh(base, percent) {
    return Math.round(boundsByPercent(base, percent).high);
  }
  function getBase(baseInput) {
    return Math.round(Number(baseInput) || 0);
  }

  global.PriceCalc = {
    getLow,
    getHigh,
    getBase,
  };
})(window);
