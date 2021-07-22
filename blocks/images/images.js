export default function decorateImages(blockEl) {
  if (blockEl.firstChild.childElementCount > 1) {
    const rowEl = buildColumns(blockEl.firstChild);
  } else {
    const figEl = buildFigure(blockEl.firstChild.firstChild);
    blockEl.innerHTML = '';
    blockEl.append(figEl);
  }
}

function buildColumns(rowEl) {
  const columnEls = Array.from(rowEl.children);
  columnEls.forEach((columnEl) => {
    const figEl = buildFigure(columnEl);
    columnEl.remove();
    rowEl.append(figEl);
  })
  // prep for flex
  rowEl.classList.add("images-list");
  return rowEl;
}

function buildFigure(blockEl) {
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