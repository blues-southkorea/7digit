// ./js/pages/product-form.js
(function () {
  function $(sel) {
    return document.querySelector(sel);
  }

  function setupPhotoPreview() {
    const input = $('#photoInput');
    const grid = $('#photoPreview');
    if (!input || !grid) return;

    function clearGrid() {
      grid.innerHTML = '';
    }

    input.addEventListener('change', () => {
      clearGrid();
      const files = Array.from(input.files || []);
      files.forEach((file, idx) => {
        if (!file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        const wrap = document.createElement('div');
        wrap.style.position = 'relative';
        wrap.style.border = '1px solid #e5e7eb';
        wrap.style.borderRadius = '10px';
        wrap.style.overflow = 'hidden';
        wrap.style.aspectRatio = '1 / 1';

        const img = document.createElement('img');
        img.src = url;
        img.alt = `photo-${idx + 1}`;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';

        // 클릭하면 해당 썸네일만 제거(미리보기 전용이므로 원본 파일 리스트는 유지)
        img.addEventListener('click', () => {
          URL.revokeObjectURL(url);
          wrap.remove();
        });

        wrap.appendChild(img);
        grid.appendChild(wrap);
      });
    });
  }

  function main() {
    setupPhotoPreview();
    // 향후: #productName / #productBrand / #productSize 값은
    // 폼 제출/검증/저장 로직과 연동하세요.
  }

  window.addEventListener('DOMContentLoaded', main);
})();
