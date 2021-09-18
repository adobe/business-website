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

/**
 * log RUM if part of the sample.
 * @param {string} checkpoint identifies the checkpoint in funnel
 * @param {Object} data additional data for RUM sample
 */
export function sampleRUM(checkpoint, data = {}) {
  window.hlx = window.hlx || {};
  if (!window.hlx.rum) {
    const usp = new URLSearchParams(window.location.search);
    const weight = (usp.get('rum') === 'on') ? 1 : 100; // with parameter, weight is 1. Defaults to 100.
    // eslint-disable-next-line no-bitwise
    const hashCode = (s) => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);
    const id = `${hashCode(window.location.href)}-${new Date().getTime()}-${Math.random().toString(16).substr(2, 14)}`;
    const random = Math.random();
    const isSelected = (random * weight < 1);
    // eslint-disable-next-line object-curly-newline
    window.hlx.rum = { weight, id, random, isSelected };
  }
  const { random, weight, id } = window.hlx.rum;
  if (random && (random * weight < 1)) {
    // eslint-disable-next-line object-curly-newline
    const body = JSON.stringify({ weight, id, referer: window.location.href, generation: 'biz-gen1', checkpoint, ...data });
    const url = `https://rum.hlx3.page/.rum/${weight}`;
    // eslint-disable-next-line no-unused-expressions
    (navigator.sendBeacon && navigator.sendBeacon(url, body)) || fetch(url, { body, method: 'POST', keepalive: true }); // we should probably use XHR instead of fetch
  }
}

sampleRUM('top');
window.addEventListener('load', () => sampleRUM('load'));
document.addEventListener('click', () => sampleRUM('click'));

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
  const meta = [...document.head.querySelectorAll(`meta[${attr}="${name}"]`)].map((el) => el.content).join(', ');
  return meta;
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
  let blockName = classes[0];
  if (!blockName) return;
  const $section = $block.closest('.section-wrapper');
  if ($section) {
    $section.classList.add(`${blockName}-container`.replace(/--/g, '-'));
  }
  const blocksWithVariants = ['recommended-articles'];
  blocksWithVariants.forEach((b) => {
    if (blockName.startsWith(`${b}-`)) {
      const options = blockName.substring(b.length + 1).split('-').filter((opt) => !!opt);
      blockName = b;
      $block.classList.add(b);
      $block.classList.add(...options);
    }
  });

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
  const div = document.createElement('div');
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
  div.append(articleHeaderBlockEl);
  mainEl.prepend(div);
}

function buildTagHeader(mainEl) {
  const div = document.createElement('div');
  const h1 = mainEl.querySelector('h1');
  const picture = mainEl.querySelector('picture');
  const tagHeaderBlockEl = buildBlock('tag-header', [
    [h1],
    [{ elems: [picture.closest('p')] }],
  ]);
  div.append(tagHeaderBlockEl);
  mainEl.prepend(div);
}

function buildArticleFeed(mainEl) {
  const { pathname } = window.location;
  const div = document.createElement('div');
  const title = mainEl.querySelector('h1').textContent.trim();
  const articleFeedEl = buildBlock('article-feed', [
    [`${pathname.includes('/tags/') ? 'tags' : 'category'}`, title],
  ]);
  div.append(articleFeedEl);
  mainEl.append(div);
}

function buildTagsBlock(mainEl) {
  const tags = getMetadata('article:tag');
  if (tags) {
    const tagsBlock = buildBlock('tags', [
      [`<p>${tags}</p>`],
    ]);
    const recBlock = mainEl.querySelector('.recommended-articles');
    if (recBlock) {
      recBlock.parentNode.insertBefore(tagsBlock, recBlock);
    } else {
      mainEl.append(tagsBlock);
    }
  }
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
      buildTagsBlock(mainEl);
    }
    if (window.location.pathname.includes('/categories/') || window.location.pathname.includes('/tags/')) {
      buildTagHeader(mainEl);
      buildArticleFeed(mainEl);
    }
    buildImageBlocks(mainEl);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function unwrapBlock(block) {
  const section = block.parentNode;
  const els = [...section.children];
  const blockSection = document.createElement('div');
  const postBlockSection = document.createElement('div');
  const nextSection = section.nextSibling;
  section.parentNode.insertBefore(blockSection, nextSection);
  section.parentNode.insertBefore(postBlockSection, nextSection);

  let $appendTo;
  els.forEach((el) => {
    if (el === block) $appendTo = blockSection;
    if ($appendTo) {
      $appendTo.appendChild(el);
      $appendTo = postBlockSection;
    }
  });

  if (!postBlockSection.hasChildNodes()) {
    postBlockSection.remove();
  }
}

function splitSections() {
  document.querySelectorAll('main > div > div').forEach((block) => {
    const blocksToSplit = ['article-feed', 'article-header', 'recommended-articles'];

    if (blocksToSplit.includes(block.className)) {
      unwrapBlock(block);
    }
  });
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
  if (blockEl.firstChild) {
    if (blockEl.firstChild.nodeName === 'PICTURE' || blockEl.firstChild.nodeName === 'VIDEO') {
      figEl.append(blockEl.firstChild);
    } else if (blockEl.firstChild.nodeName === 'P') {
      const pEls = Array.from(blockEl.children);
      pEls.forEach((pEl) => {
        if (pEl.firstChild) {
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
            }
            figEl.prepend(pEl.firstChild);
          }
        }
      });
    // catch link-only figures (like embed blocks);
    } else if (blockEl.firstChild.nodeName === 'A') {
      figEl.append(blockEl.firstChild);
    }
  }
  return figEl;
}

/**
 * Loads JS and CSS for a block.
 * @param {Element} $block The block element
 */
export async function loadBlock($block, callback) {
  if (!$block.getAttribute('data-block-loaded')) {
    $block.setAttribute('data-block-loaded', true);
    const blockName = $block.getAttribute('data-block-name');
    try {
      const mod = await import(`/blocks/${blockName}/${blockName}.js`);
      if (mod.default) {
        await mod.default($block, blockName, document, callback);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(`failed to load module for ${blockName}`, err);
    }
    loadCSS(`/blocks/${blockName}/${blockName}.css`);
  }
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
 * Returns a picture element with webp and fallbacks
 * @param {string} src The image URL
 * @param {boolean} eager load image eager
 * @param {Array} breakpoints breakpoints and corresponding params (eg. width)
 */

export function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [{ media: 'min-width: 400px', width: '2000' }, { width: '750' }]) {
  const url = new URL(src, window.location.href);
  const picture = document.createElement('picture');
  const { pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);

  // webp
  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', `${pathname}?width=${br.width}&format=webply&optimize=medium`);
    picture.appendChild(source);
  });

  // fallback
  breakpoints.forEach((br, i) => {
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute('srcset', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('src', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      picture.appendChild(img);
    }
  });

  return picture;
}

/**
 * Decorates the main element.
 * @param {Element} $main The main element
 */
function decoratePictures($main) {
  $main.querySelectorAll('img[src*="/media_"').forEach((img, i) => {
    const newPicture = createOptimizedPicture(img.src, img.alt, !i);
    const picture = img.closest('picture');
    if (picture) picture.parentElement.replaceChild(newPicture, picture);
  });
}

/**
 * Decorates the main element.
 * @param {Element} $main The main element
 */
export function decorateMain($main) {
  // forward compatible pictures redecoration
  decoratePictures($main);
  buildAutoBlocks($main);
  splitSections();
  wrapSections($main.querySelectorAll(':scope > div'));
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
 * fetches locale-specific string variables.
 * @param {string} locale prefix used for path to index
 * @returns {object} localized variables
 */

export async function fetchVariables(locale = '') {
  const resp = await fetch(`${locale}/blog/variables.json`);
  const json = await resp.json();
  const vars = {};
  json.data.forEach((v) => {
    vars[v.Key] = v.Text;
  });
  return (vars);
}

/**
 * Sets the trigger for the LCP (Largest Contentful Paint) event.
 * @see https://web.dev/lcp/
 * @param {Element} lcpCandidateElement The LCP candidate element
 * @param {Function} postLCP The callback function
 */
function setLCPTrigger(lcpCandidateEl, postLCP) {
  if (lcpCandidateEl) {
    if (lcpCandidateEl.complete) {
      postLCP();
    } else {
      lcpCandidateEl.addEventListener('load', () => {
        postLCP();
      });
      lcpCandidateEl.addEventListener('error', () => {
        postLCP();
      });
    }
  } else {
    postLCP();
  }
}

/**
 * Gets the LCP (Largest Contentful Paint) candidate element.
 * @see https://web.dev/lcp/
 * @param {Function} callback The function called with the LCP candidate element
 */

function getLCPCandidate(callback) {
  const usp = new URLSearchParams(window.location.search);
  const lcp = usp.get('lcp');
  const lcpBlocks = ['featured-article'];
  let candidate = document.querySelector('main img');
  const block = document.querySelector('.block');
  if (block) {
    if (lcp !== 'simple' && lcpBlocks.includes(block.getAttribute('data-block-name'))) {
      loadBlock(block, () => {
        candidate = block.querySelector('img');
        // eslint-disable-next-line no-console
        console.log('LCP block found', candidate);
        callback(candidate);
      });
    } else {
      // not an LCP block
      // eslint-disable-next-line no-console
      console.log('first block is not LCP block', candidate);
      callback(candidate);
    }
  } else {
    // no blocks found
    // eslint-disable-next-line no-console
    console.log('no blocks found', candidate);
    callback(candidate);
  }
}

/**
 * loads a script by adding a script tag to the head.
 * @param {string} url URL of the js file
 * @param {Function} callback callback on load
 * @param {string} type type attribute of script tag
 * @returns {Element} script element
 */

export function loadScript(url, callback, type) {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.setAttribute('src', url);
  if (type) {
    script.setAttribute('type', type);
  }
  head.append(script);
  script.onload = callback;
  return script;
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
    getLCPCandidate((lcpCandidateEl) => {
      setLCPTrigger(lcpCandidateEl, async () => {
        // post LCP actions go here
        sampleRUM('lcp');

        /* load gnav */
        const header = document.querySelector('header');
        header.setAttribute('data-block-name', 'gnav');
        header.setAttribute('data-gnav-source', '/blog/gnav');
        loadBlock(header);

        await loadBlocks($main);
        loadCSS('/styles/lazy-styles.css');
        addFavIcon('/styles/favicon.svg');

        /* trigger martech.js load */
        const martechUrl = '/scripts/martech.js';
        const usp = new URLSearchParams(window.location.search);
        const martech = usp.get('martech');

        if (!(martech === 'off' || document.querySelector(`head script[src="${martechUrl}"]`))) {
          let ms = 3000;
          const delay = usp.get('delay');
          if (delay) ms = +delay;
          setTimeout(() => {
            loadScript(martechUrl, null, 'module');
          }, ms);
        }
      });
    });
    document.querySelector('body').classList.add('appear');
  }
}

decoratePage(window);

/*
 * lighthouse performance instrumentation helper
 * (needs a refactor)
 */

function stamp(message) {
  if (window.name.includes('performance')) {
    // eslint-disable-next-line no-console
    console.log(`${new Date() - performance.timing.navigationStart}:${message}`);
  }
}

stamp('start');

function registerPerformanceLogger() {
  try {
    const polcp = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      stamp(JSON.stringify(entries));
      // eslint-disable-next-line no-console
      console.log(entries[0].element);
    });
    polcp.observe({ type: 'largest-contentful-paint', buffered: true });

    const pols = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      stamp(JSON.stringify(entries));
      // eslint-disable-next-line no-console
      console.log(entries[0].sources[0].node);
    });
    pols.observe({ type: 'layout-shift', buffered: true });

    const pores = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        stamp(`resource loaded: ${entry.name} - [${Math.round(entry.startTime + entry.duration)}]`);
      });
    });

    pores.observe({ type: 'resource', buffered: true });
  } catch (e) {
    // no output
  }
}

if (window.name.includes('performance')) registerPerformanceLogger();
