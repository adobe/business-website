import { buildFigure } from '../../scripts/scripts.js';

export default function decorateAnimation(blockEl) {
  const a = blockEl.querySelector('a');
  const parentEl = a.parentNode;
  const href = a.getAttribute('href');
  const url = new URL(href);
  const helixId = url.pathname.split('/')[2];
  if (href.endsWith('.gif')) {
    const picEl = `<picture>
            <img src="./media_${helixId}.gif" />
        </picture>`;
    parentEl.innerHTML = picEl;
  } else if (href.endsWith('.mp4')) {
    const vidEl = `<video playsinline autoplay loop muted>
            <source src="./media_${helixId}.mp4" type="video/mp4" />
        </video>`;
    parentEl.innerHTML = vidEl;
  }
  const figEl = buildFigure(blockEl.firstChild.firstChild);
  blockEl.prepend(figEl);
  blockEl.lastChild.remove();
}
