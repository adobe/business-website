/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global sessionStorage Image */

/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 */
export function loadCSS(href) {
  if (!document.querySelector(`head > link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    link.onload = () => {
    };
    link.onerror = () => {
    };
    document.head.appendChild(link);
  }
}

/**
 * Retrieves the content of a metadata tag.
 * @param {string} name The metadata name (or property)
 * @returns {string} The metadata value
 */
export function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const $meta = document.head.querySelector(`meta[${attr}="${name}"]`);
  return $meta && $meta.content;
}

/**
 * Adds one or more URLs to the dependencies for publishing.
 * @param {string|[string]} url The URL(s) to add as dependencies
 */
export function addPublishDependencies(url) {
  const urls = Array.isArray(url) ? url : [url];
  window.hlx = window.hlx || {};
  if (window.hlx.dependencies && Array.isArray(window.hlx.dependencies)) {
    window.hlx.dependencies.concat(urls);
  } else {
    window.hlx.dependencies = urls;
  }
}

/**
 * Returns an image URL with optimization parameters
 * @param {string} url The image URL
 */
export function getOptimizedImageURL(src) {
  const url = new URL(src, window.location.href);
  let result = src;
  const { pathname, search } = url;
  if (pathname.includes('media_')) {
    const usp = new URLSearchParams(search);
    usp.delete('auto');
    if (!window.webpSupport) {
      if (pathname.endsWith('.png')) {
        usp.set('format', 'png');
      } else if (pathname.endsWith('.gif')) {
        usp.set('format', 'gif');
      } else {
        usp.set('format', 'pjpg');
      }
    } else {
      usp.set('format', 'webply');
    }
    result = `${src.split('?')[0]}?${usp.toString()}`;
  }
  return (result);
}

/**
 * Resets an element's attribute to the optimized image URL.
 * @see getOptimizedImageURL
 * @param {Element} $elem The element
 * @param {string} attrib The attribute
 */
function resetOptimizedImageURL($elem, attrib) {
  const src = $elem.getAttribute(attrib);
  if (src) {
    const oSrc = getOptimizedImageURL(src);
    if (oSrc !== src) {
      $elem.setAttribute(attrib, oSrc);
    }
  }
}

/**
 * Sanitizes a name for use as class name.
 * @param {*} name The unsanitized name
 * @returns {string} The class name
 */
export function toClassName(name) {
  return name && typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-')
    : '';
}

/**
 * Wraps each section in an additional {@code div}.
 * @param {[Element]} $sections The sections
 */
function wrapSections($sections) {
  $sections.forEach(($div) => {
    if (!$div.id) {
      const $wrapper = document.createElement('div');
      $wrapper.className = 'section-wrapper';
      $div.parentNode.appendChild($wrapper);
      $wrapper.appendChild($div);
    }
  });
}

/**
 * Decorates a block.
 * @param {Element} $block The block element
 */
export function decorateBlock($block) {
  const classes = Array.from($block.classList.values());
  const blockName = classes[0];
  if (!blockName) return;
  const $section = $block.closest('.section-wrapper');
  if ($section) {
    $section.classList.add(`${blockName}-container`.replace(/--/g, '-'));
  }
  $block.classList.add('block');
  $block.setAttribute('data-block-name', blockName);
}

/**
 * Builds a block DOM Element from a two dimensional array
 * @param {string} blockName name of the block
 * @param {any} content two dimensional array or string or object of content
 */
function buildBlock(blockName, content) {
  const table = Array.isArray(content) ? content : [[content]];
  const blockEl = document.createElement('div');
  // build image block nested div structure
  blockEl.classList.add(blockName);
  table.forEach((row) => {
    const rowEl = document.createElement('div');
    row.forEach((col) => {
      const colEl = document.createElement('div');
      const vals = col.elems ? col.elems : [col];
      vals.forEach((val) => {
        if (val) {
          if (typeof val === 'string') {
            colEl.innerHTML += val;
          } else {
            colEl.appendChild(val);
          }
        }
      });
      rowEl.appendChild(colEl);
    });
    blockEl.appendChild(rowEl);
  });
  return (blockEl);
}

/**
 * removes formatting from images.
 * @param {Element} mainEl The container element
 */
function removeStylingFromImages(mainEl) {
  // remove styling from images, if any
  const styledImgEls = [...mainEl.querySelectorAll('strong picture'), ...mainEl.querySelectorAll('em picture')];
  styledImgEls.forEach((imgEl) => {
    const parentEl = imgEl.closest('p');
    parentEl.prepend(imgEl);
    parentEl.lastChild.remove();
  });
}

/**
 * returns an image caption of a picture elements
 * @param {Element} picture picture element
 */
function getImageCaption(picture) {
  const parentEl = picture.parentNode;
  const parentSiblingEl = parentEl.nextElementSibling;
  return (parentSiblingEl && parentSiblingEl.firstChild.nodeName === 'EM' ? parentSiblingEl : undefined);
}

/**
 * builds images blocks from default content.
 * @param {Element} mainEl The container element
 */
function buildImageBlocks(mainEl) {
  // select all non-featured, default (non-images block) images
  const imgEls = [...mainEl.querySelectorAll(':scope > div > p > picture')];
  imgEls.forEach((imgEl) => {
    const parentEl = imgEl.parentNode;
    const imagesBlockEl = buildBlock('images', {
      elems: [parentEl.cloneNode(true), getImageCaption(imgEl)],
    });
    parentEl.parentNode.insertBefore(imagesBlockEl, parentEl);
    parentEl.remove();
  });
}

/**
 * builds article header block from meta and default content.
 * @param {Element} mainEl The container element
 */
function buildArticleHeader(mainEl) {
  const h1 = mainEl.querySelector('h1');
  const picture = mainEl.querySelector('picture');
  const category = getMetadata('category');
  const author = getMetadata('author');
  const publicationDate = getMetadata('publication-date');

  const articleHeaderBlockEl = buildBlock('article-header', [
    [`<p>${category}</p>`],
    [h1],
    [`<p><a href="/blog/authors/${toClassName(author)}">${author}</a></p>
      <p>${publicationDate}</p>`],
    [{ elems: [picture.closest('p'), getImageCaption(picture)] }],
  ]);
  mainEl.firstChild.prepend(articleHeaderBlockEl);
}

/**
 * Decorates all blocks in a container element.
 * @param {Element} $main The container element
 */
function decorateBlocks($main) {
  $main
    .querySelectorAll('div.section-wrapper > div > div')
    .forEach(($block) => decorateBlock($block));
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} $main The container element
 */
function buildAutoBlocks(mainEl) {
  removeStylingFromImages(mainEl);
  try {
    if (getMetadata('author') && getMetadata('publication-date') && !mainEl.querySelector('.article-header')) {
      buildArticleHeader(mainEl);
    }
    buildImageBlocks(mainEl);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Build figcaption element
 * @param {Element} pEl The original element to be placed in figcaption.
 * @returns figCaptionEl Generated figcaption
 */
export function buildCaption(pEl) {
  const figCaptionEl = document.createElement('figcaption');
  pEl.classList.add('caption');
  figCaptionEl.append(pEl);
  return figCaptionEl;
}

/**
 * Build figure element
 * @param {Element} blockEl The original element to be placed in figure.
 * @returns figEl Generated figure
 */
export function buildFigure(blockEl) {
  const figEl = document.createElement('figure');
  figEl.classList.add('figure');
  // content is picture only, no caption or link
  if (blockEl.firstChild.nodeName === 'PICTURE' || blockEl.firstChild.nodeName === 'VIDEO') {
    figEl.append(blockEl.firstChild);
  } else if (blockEl.firstChild.nodeName === 'P') {
    const pEls = Array.from(blockEl.children);
    pEls.forEach((pEl) => {
      if (pEl.firstChild.nodeName === 'PICTURE' || pEl.firstChild.nodeName === 'VIDEO') {
        figEl.append(pEl.firstChild);
      } else if (pEl.firstChild.nodeName === 'EM') {
        const figCapEl = buildCaption(pEl);
        figEl.append(figCapEl);
      } else if (pEl.firstChild.nodeName === 'A') {
        const picEl = figEl.querySelector('picture');
        if (picEl) {
          pEl.firstChild.textContent = '';
          pEl.firstChild.append(picEl);
          figEl.prepend(pEl.firstChild);
        }
      }
    });
  }
  return figEl;
}

/**
 * Loads JS and CSS for a block.
 * @param {Element} $block The block element
 */
export async function loadBlock($block) {
  const blockName = $block.getAttribute('data-block-name');
  try {
    const mod = await import(`/blocks/${blockName}/${blockName}.js`);
    if (mod.default) {
      await mod.default($block, blockName, document);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(`failed to load module for ${blockName}`, err);
  }

  loadCSS(`/blocks/${blockName}/${blockName}.css`);
}

/**
 * Loads JS and CSS for all blocks in a container element.
 * @param {Element} $main The container element
 */
async function loadBlocks($main) {
  $main
    .querySelectorAll('div.section-wrapper > div > .block')
    .forEach(async ($block) => loadBlock($block));
}

/**
 * Extracts the config from a block.
 * @param {Element} $block The block element
 * @returns {object} The block config
 */
export function readBlockConfig($block) {
  const config = {};
  $block.querySelectorAll(':scope>div').forEach(($row) => {
    if ($row.children) {
      const $cols = [...$row.children];
      if ($cols[1]) {
        const $value = $cols[1];
        const name = toClassName($cols[0].textContent);
        let value = '';
        if ($value.querySelector('a')) {
          const $as = [...$value.querySelectorAll('a')];
          if ($as.length === 1) {
            value = $as[0].href;
          } else {
            value = $as.map(($a) => $a.href);
          }
        } else if ($value.querySelector('p')) {
          const $ps = [...$value.querySelectorAll('p')];
          if ($ps.length === 1) {
            value = $ps[0].textContent;
          } else {
            value = $ps.map(($p) => $p.textContent);
          }
        } else value = $row.children[1].textContent;
        config[name] = value;
      }
    }
  });
  return config;
}

/**
 * Official Google WEBP detection.
 * @param {Function} callback The callback function
 */
function checkWebpFeature(callback) {
  const webpSupport = sessionStorage.getItem('webpSupport');
  if (!webpSupport) {
    const kTestImages = 'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
    const img = new Image();
    img.onload = () => {
      const result = (img.width > 0) && (img.height > 0);
      window.webpSupport = result;
      sessionStorage.setItem('webpSupport', result);
      callback();
    };
    img.onerror = () => {
      sessionStorage.setItem('webpSupport', false);
      window.webpSupport = false;
      callback();
    };
    img.src = `data:image/webp;base64,${kTestImages}`;
  } else {
    window.webpSupport = (webpSupport === 'true');
    callback();
  }
}

/**
 * WEBP Polyfill for older browser versions.
 * @param {Element} $elem The container element
 */
export function webpPolyfill($elem) {
  if (!window.webpSupport) {
    $elem.querySelectorAll('img').forEach(($img) => {
      resetOptimizedImageURL($img, 'src');
    });
    $elem.querySelectorAll('picture source').forEach(($source) => {
      resetOptimizedImageURL($source, 'srcset');
    });
  }
}

/**
 * Normalizes all headings within a container element.
 * @param {Element} $elem The container element
 * @param {[string]]} allowedHeadings The list of allowed headings (h1 ... h6)
 */
export function normalizeHeadings($elem, allowedHeadings) {
  const allowed = allowedHeadings.map((h) => h.toLowerCase());
  $elem.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((tag) => {
    const h = tag.tagName.toLowerCase();
    if (allowed.indexOf(h) === -1) {
      // current heading is not in the allowed list -> try first to "promote" the heading
      let level = parseInt(h.charAt(1), 10) - 1;
      while (allowed.indexOf(`h${level}`) === -1 && level > 0) {
        level -= 1;
      }
      if (level === 0) {
        // did not find a match -> try to "downgrade" the heading
        while (allowed.indexOf(`h${level}`) === -1 && level < 7) {
          level += 1;
        }
      }
      if (level !== 7) {
        tag.outerHTML = `<h${level}>${tag.textContent}</h${level}>`;
      }
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} $main The main element
 */
export function decorateMain($main) {
  buildAutoBlocks($main);
  wrapSections($main.querySelectorAll(':scope > div'));
  checkWebpFeature(() => {
    webpPolyfill($main);
  });
  decorateBlocks($main);
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const $link = document.createElement('link');
  $link.rel = 'icon';
  $link.type = 'image/svg+xml';
  $link.href = href;
  const $existingLink = document.querySelector('head link[rel="icon"]');
  if ($existingLink) {
    $existingLink.parentElement.replaceChild($link, $existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild($link);
  }
}

/**
 * fetches blog article index.
 * @param {string} locale prefix used for path to index
 * @returns {object} index with data and path lookup
 */

export async function fetchBlogArticleIndex(locale = '') {
  const resp = await fetch(`${locale}/blog/query-index.json`);
  const json = await resp.json();
  const byPath = {};
  json.data.forEach((post) => {
    byPath[post.path.split('.')[0]] = post;
  });
  const index = { data: json.data, byPath };
  return (index);
}

/**
 * gets a blog article index information by path.
 * @param {string} path indentifies article
 * @returns {object} article object
 */

export async function getBlogArticle(path, locale = '') {
  if (!window.blogIndex) {
    window.blogIndex = await fetchBlogArticleIndex(locale);
  }
  const index = window.blogIndex;
  return (index.byPath[path]);
}

/**
 * Sets the trigger for the LCP (Largest Contentful Paint) event.
 * @see https://web.dev/lcp/
 * @param {Document} doc The document
 * @param {Function} postLCP The callback function
 */
function setLCPTrigger(doc, postLCP) {
  const $lcpCandidate = doc.querySelector('main > div:first-of-type img');
  if ($lcpCandidate) {
    if ($lcpCandidate.complete) {
      postLCP();
    } else {
      $lcpCandidate.addEventListener('load', () => {
        postLCP();
      });
      $lcpCandidate.addEventListener('error', () => {
        postLCP();
      });
    }
  } else {
    postLCP();
  }
}

/**
 * Decorates the page.
 * @param {Window} win The window
 */
async function decoratePage(win = window) {
  const doc = win.document;
  const $main = doc.querySelector('main');
  if ($main) {
    decorateMain($main);
    doc.querySelector('body').classList.add('appear');
    setLCPTrigger(doc, async () => {
      // post LCP actions go here

      /* load gnav */
      const header = document.querySelector('header');
      header.setAttribute('data-block-name', 'gnav');
      header.setAttribute('data-gnav-source', '/blog/gnav');
      loadBlock(header);

      await loadBlocks($main);
      loadCSS('/styles/lazy-styles.css');
      addFavIcon('/styles/favicon.svg');
    });
  }
}

decoratePage(window);
