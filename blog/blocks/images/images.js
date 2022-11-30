import { buildFigure } from '../../scripts/scripts.js';

function buildColumns(rowEl, count) {
  const columnEls = Array.from(rowEl.children);
  columnEls.forEach((columnEl) => {
    const figEl = buildFigure(columnEl);
    columnEl.remove();
    rowEl.append(figEl);
  });
  rowEl.classList.add('images-list', `images-list-${count}`);
}

export default function decorateImages(blockEl) {
  const blockCount = blockEl.firstElementChild.childElementCount;
  if (blockCount > 1) {
    buildColumns(blockEl.firstElementChild, blockCount);
  } else {
    const figEl = buildFigure(blockEl.firstElementChild.firstElementChild);
    blockEl.innerHTML = '';
    blockEl.append(figEl);
  }
}
