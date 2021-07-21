export default function decorateImages(blockEl) {
    // places pictures in figures
    const parentEl = blockEl.firstChild.firstChild;    
    const figEl = document.createElement('figure');
    // TODO: support multi-column images blocks
    blockEl.querySelectorAll('p').forEach((pEl) => {
      if (pEl.innerHTML.startsWith('<picture>')) {
        const pictureEl = pEl.querySelector('picture');
        figEl.append(pictureEl);
        pEl.remove();
      } else if (pEl.innerHTML.startsWith('<em>')) {
        // TODO: remove caption from this block for use in other blocks
        // create caption
        const figCaptionEl = document.createElement('figcaption');
        figCaptionEl.classList.add('caption');  
        pEl.classList.add('legend');
        // add text to caption
        figCaptionEl.append(pEl);
        figEl.append(figCaptionEl);
      } else if (pEl.innerHTML.startsWith('<a')) {
        // wrap picture in anchor
        const aEl = pEl.querySelector('a');
        const figPicEl = figEl.querySelector('picture');
        aEl.innerHTML = '';
        aEl.append(figPicEl);
        figEl.prepend(aEl);
        pEl.remove();
      }
    });
    parentEl.prepend(figEl);
  }
  