import { buildFigure } from '../../scripts/scripts.js';

export default function decorateInfographic(blockEl) {
  const figEl = buildFigure(blockEl.firstChild.firstChild);
  blockEl.prepend(figEl);
  blockEl.lastChild.remove();
}
