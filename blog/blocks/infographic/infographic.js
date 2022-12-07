import { buildFigure } from '../../scripts/scripts.js';

export default function decorateInfographic(blockEl) {
  const figEl = buildFigure(blockEl.firstElementChild.firstElementChild);
  blockEl.prepend(figEl);
  blockEl.lastElementChild.remove();
}
