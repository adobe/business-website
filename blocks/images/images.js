export default function decorateImages(blockEl) {
  const blockCount = blockEl.firstChild.childElementCount;
  if (blockCount > 1) {
    buildColumns(blockEl.firstChild, blockCount);
  } else {
    const figEl = buildFigure(blockEl.firstChild.firstChild);
    blockEl.innerHTML = '';
    blockEl.append(figEl);
  }
}

function buildColumns(rowEl, count) {
  const columnEls = Array.from(rowEl.children);
  columnEls.forEach((columnEl) => {
    const figEl = buildFigure(columnEl);
    columnEl.remove();
    rowEl.append(figEl);
  })
  rowEl.classList.add("images-list", `images-list-${count}`);
}

/**
 * This is a helper function that could be reusable for other blocks.
 * @param {Element} blockEl The original element to be placed in figure.
 * @returns figEl Generated figure
 */
export function buildFigure(blockEl) {
  let figEl = document.createElement('figure');
  figEl.classList.add("figure");
  // content is picture only, no caption or link
  if (blockEl.firstChild.nodeName === "PICTURE") {
    figEl.append(blockEl.firstChild);
  } else if (blockEl.firstChild.nodeName === "P") {
    const pEls = Array.from(blockEl.children);
    pEls.forEach((pEl) => {
      if (pEl.firstChild.nodeName === "PICTURE") {
        figEl.append(pEl.firstChild);
      } else if (pEl.firstChild.nodeName === "EM") {
        const figCapEl = buildCaption(pEl);
        figEl.append(figCapEl);
      } else if (pEl.firstChild.nodeName === "A") {
        figEl = wrapPicInAnchor(figEl, pEl.firstChild);
      }
    })
  }
  return figEl;
}

// TODO: move out for use throughout
function buildCaption(pEl) {
  const figCaptionEl = document.createElement('figcaption');
  figCaptionEl.classList.add('caption');
  pEl.classList.add('legend');
  figCaptionEl.append(pEl);
  return figCaptionEl;  
}

function wrapPicInAnchor(figEl, aEl) {
  const picEl = figEl.querySelector('picture');
  if (picEl) {
    aEl.textContent = '';
    aEl.append(picEl);
    figEl.prepend(aEl);
  }
  return figEl;
}