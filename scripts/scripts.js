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
  try {
    window.hlx = window.hlx || {};
    if (!window.hlx.rum) {
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
      const sendPing = () => {
        // eslint-disable-next-line object-curly-newline, max-len, no-use-before-define
        const body = JSON.stringify({ weight, id, referer: window.location.href, generation: window.RUM_GENERATION, checkpoint, ...data });
        const url = `https://rum.hlx.page/.rum/${weight}`;
        // eslint-disable-next-line no-unused-expressions
        navigator.sendBeacon(url, body);
      };
      sendPing();
      // special case CWV
      if (checkpoint === 'cwv') {
        // use classic script to avoid CORS issues
        const script = document.createElement('script');
        script.src = 'https://rum.hlx.page/.rum/web-vitals/dist/web-vitals.iife.js';
        script.onload = () => {
          const storeCWV = (measurement) => {
            data.cwv = {};
            data.cwv[measurement.name] = measurement.value;
            sendPing();
          };
            // When loading `web-vitals` using a classic script, all the public
            // methods can be found on the `webVitals` global namespace.
          window.webVitals.getCLS(storeCWV);
          window.webVitals.getFID(storeCWV);
          window.webVitals.getLCP(storeCWV);
        };
        document.head.appendChild(script);
      }
    }
  } catch (e) {
    // something went wrong
  }
}

/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 */
export function loadCSS(href, callback) {
  if (!document.querySelector(`head > link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    if (typeof callback === 'function') {
      link.onload = (e) => callback(e.type);
      link.onerror = (e) => callback(e.type);
    }
    document.head.appendChild(link);
  } else if (typeof callback === 'function') {
    callback('noop');
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
    window.hlx.dependencies = window.hlx.dependencies.concat(urls);
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
 * Decorates a block.
 * @param {Element} block The block element
 */
export function decorateBlock(block) {
  const trimDashes = (str) => str.replace(/(^\s*-)|(-\s*$)/g, '');
  const classes = Array.from(block.classList.values());
  const blockName = classes[0];
  if (!blockName) return;
  const section = block.closest('.section');
  if (section) {
    section.classList.add(`${blockName}-container`.replace(/--/g, '-'));
  }
  const blockWithVariants = blockName.split('--');
  const shortBlockName = trimDashes(blockWithVariants.shift());
  const variants = blockWithVariants.map((v) => trimDashes(v));
  block.classList.add(shortBlockName);
  block.classList.add(...variants);

  block.classList.add('block');
  block.setAttribute('data-block-name', shortBlockName);
  block.setAttribute('data-block-status', 'initialized');

  const blockWrapper = block.parentElement;
  blockWrapper.classList.add(`${shortBlockName}-wrapper`);
}

/**
 * Extracts the config from a block.
 * @param {Element} block The block element
 * @returns {object} The block config
 */
export function readBlockConfig(block) {
  const config = {};
  block.querySelectorAll(':scope>div').forEach((row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const col = cols[1];
        const name = toClassName(cols[0].textContent);
        let value = '';
        if (col.querySelector('a')) {
          const as = [...col.querySelectorAll('a')];
          if (as.length === 1) {
            value = as[0].href;
          } else {
            value = as.map((a) => a.href);
          }
        } else if (col.querySelector('p')) {
          const ps = [...col.querySelectorAll('p')];
          if (ps.length === 1) {
            value = ps[0].textContent;
          } else {
            value = ps.map((p) => p.textContent);
          }
        } else value = row.children[1].textContent;
        config[name] = value;
      }
    }
  });
  return config;
}

/**
 * Decorates all sections in a container element.
 * @param {Element} $main The container element
 */
export function decorateSections($main) {
  $main.querySelectorAll(':scope > div').forEach((section) => {
    const wrappers = [];
    let defaultContent = false;
    [...section.children].forEach((e) => {
      if (e.tagName === 'DIV' || !defaultContent) {
        const wrapper = document.createElement('div');
        wrappers.push(wrapper);
        defaultContent = e.tagName !== 'DIV';
        if (defaultContent) wrapper.classList.add('default-content-wrapper');
      }
      wrappers[wrappers.length - 1].append(e);
    });
    wrappers.forEach((wrapper) => section.append(wrapper));
    section.classList.add('section');
    section.setAttribute('data-section-status', 'initialized');

    /* process section metadata */
    const sectionMeta = section.querySelector('div.section-metadata');
    if (sectionMeta) {
      const meta = readBlockConfig(sectionMeta);
      const keys = Object.keys(meta);
      keys.forEach((key) => {
        if (key === 'style') section.classList.add(toClassName(meta.style));
        else section.dataset[key] = meta[key];
      });
      sectionMeta.remove();
    }
  });
}

/**
 * Updates all section status in a container element.
 * @param {Element} main The container element
 */
export function updateSectionsStatus(main) {
  const sections = [...main.querySelectorAll(':scope > div.section')];
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    const status = section.getAttribute('data-section-status');
    if (status !== 'loaded') {
      const loadingBlock = section.querySelector('.block[data-block-status="initialized"], .block[data-block-status="loading"]');
      if (loadingBlock) {
        section.setAttribute('data-section-status', 'loading');
        break;
      } else {
        section.setAttribute('data-section-status', 'loaded');
      }
    }
  }
}

/**
 * Decorates all blocks in a container element.
 * @param {Element} main The container element
 */
export function decorateBlocks(main) {
  main
    .querySelectorAll('div.section > div > div')
    .forEach((block) => decorateBlock(block));
}

/**
 * Builds a block DOM Element from a two dimensional array
 * @param {string} blockName name of the block
 * @param {any} content two dimensional array or string or object of content
 */
export function buildBlock(blockName, content) {
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
 * Loads JS and CSS for a block.
 * @param {Element} block The block element
 */
export async function loadBlock(block, eager = false) {
  if (!(block.getAttribute('data-block-status') === 'loading' || block.getAttribute('data-block-status') === 'loaded')) {
    block.setAttribute('data-block-status', 'loading');
    const blockName = block.getAttribute('data-block-name');
    try {
      const cssLoaded = new Promise((resolve) => {
        loadCSS(`${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.css`, resolve);
      });
      const decorationComplete = new Promise((resolve) => {
        (async () => {
          try {
            const mod = await import(`../blocks/${blockName}/${blockName}.js`);
            if (mod.default) {
              await mod.default(block, blockName, document, eager);
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.log(`failed to load module for ${blockName}`, err);
          }
          resolve();
        })();
      });
      await Promise.all([cssLoaded, decorationComplete]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(`failed to load block ${blockName}`, err);
    }
    block.setAttribute('data-block-status', 'loaded');
  }
}

/**
 * Loads JS and CSS for all blocks in a container element.
 * @param {Element} main The container element
 */
export async function loadBlocks(main) {
  updateSectionsStatus(main);
  const blocks = [...main.querySelectorAll('div.block')];
  for (let i = 0; i < blocks.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await loadBlock(blocks[i]);
    updateSectionsStatus(main);
  }
}

/**
 * Returns a picture element with webp and fallbacks
 * @param {string} src The image URL
 * @param {boolean} eager load image eager
 * @param {Array} breakpoints breakpoints and corresponding params (eg. width)
 */
export function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [{ media: '(min-width: 400px)', width: '2000' }, { width: '750' }]) {
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
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      picture.appendChild(img);
      img.setAttribute('src', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
    }
  });

  return picture;
}

/**
 * Normalizes all headings within a container element.
 * @param {Element} el The container element
 * @param {[string]]} allowedHeadings The list of allowed headings (h1 ... h6)
 */
export function normalizeHeadings(el, allowedHeadings) {
  const allowed = allowedHeadings.map((h) => h.toLowerCase());
  el.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((tag) => {
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
        tag.outerHTML = `<h${level} id="${tag.id}">${tag.textContent}</h${level}>`;
      }
    }
  });
}

/**
 * Turns absolute links within the domain into relative links.
 * @param {Element} main The container element
 */
export function makeLinksRelative(main) {
  main.querySelectorAll('a').forEach((a) => {
    // eslint-disable-next-line no-use-before-define
    const hosts = ['hlx3.page', 'hlx.page', 'hlx.live', ...PRODUCTION_DOMAINS];
    if (a.href) {
      try {
        const url = new URL(a.href);
        const relative = hosts.some((host) => url.hostname.includes(host));
        if (relative) a.href = `${url.pathname}${url.search}${url.hash}`;
      } catch (e) {
        // something went wrong
        // eslint-disable-next-line no-console
        console.log(e);
      }
    }
  });
}

/**
 * Decorates the picture elements and removes formatting.
 * @param {Element} main The container element
 */
export function decoratePictures(main) {
  main.querySelectorAll('img[src*="/media_"').forEach((img, i) => {
    const newPicture = createOptimizedPicture(img.src, img.alt, !i);
    const picture = img.closest('picture');
    if (picture) picture.parentElement.replaceChild(newPicture, picture);
    if (['EM', 'STRONG'].includes(newPicture.parentElement.tagName)) {
      const styleEl = newPicture.parentElement;
      styleEl.parentElement.replaceChild(newPicture, styleEl);
    }
  });
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * load LCP block and/or wait for LCP in default content.
 */
async function waitForLCP() {
  // eslint-disable-next-line no-use-before-define
  const lcpBlocks = LCP_BLOCKS;
  const block = document.querySelector('.block');
  const hasLCPBlock = (block && lcpBlocks.includes(block.getAttribute('data-block-name')));
  if (hasLCPBlock) await loadBlock(block, true);

  document.querySelector('body').classList.add('appear');
  const lcpCandidate = document.querySelector('main img');
  await new Promise((resolve) => {
    if (lcpCandidate && !lcpCandidate.complete) {
      lcpCandidate.setAttribute('loading', 'eager');
      lcpCandidate.addEventListener('load', () => resolve());
      lcpCandidate.addEventListener('error', () => resolve());
    } else {
      resolve();
    }
  });
}

/**
 * Decorates the page.
 */
async function loadPage(doc) {
  // eslint-disable-next-line no-use-before-define
  await loadEager(doc);
  // eslint-disable-next-line no-use-before-define
  await loadLazy(doc);
  // eslint-disable-next-line no-use-before-define
  loadDelayed(doc);
}

export function initHlx() {
  window.hlx = window.hlx || {};
  window.hlx.lighthouse = new URLSearchParams(window.location.search).get('lighthouse') === 'on';
  window.hlx.codeBasePath = '';

  const scriptEl = document.querySelector('script[src$="/scripts/scripts.js"]');
  if (scriptEl) {
    try {
      [window.hlx.codeBasePath] = new URL(scriptEl.src).pathname.split('/scripts/scripts.js');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}

initHlx();

/*
 * ------------------------------------------------------------
 * Edit above at your own risk
 * ------------------------------------------------------------
 */

const usp = new URLSearchParams(window.location.search);

// feature flag for alloy
// const alloy = (
//   usp.get('alloy') === 'on'
//   || localStorage.getItem('alloy') === 'on'
// );
// permanently on
const alloy = true;

const LCP_BLOCKS = ['featured-article', 'article-header'];
window.RUM_GENERATION = 'biz-gen3'; // add your RUM generation information here
const PRODUCTION_DOMAINS = [];

sampleRUM.mediaobserver = (window.IntersectionObserver) ? new IntersectionObserver((entries) => {
  entries
    .filter((entry) => entry.isIntersecting)
    .forEach((entry) => {
      sampleRUM.mediaobserver.unobserve(entry.target); // observe only once
      const target = sampleRUM.targetselector(entry.target);
      const source = sampleRUM.sourceselector(entry.target);
      sampleRUM('viewmedia', { target, source });
    });
}, { threshold: 0.25 }) : { observe: () => {} };

sampleRUM.blockobserver = (window.IntersectionObserver) ? new IntersectionObserver((entries) => {
  entries
    .filter((entry) => entry.isIntersecting)
    .forEach((entry) => {
      sampleRUM.blockobserver.unobserve(entry.target); // observe only once
      const target = sampleRUM.targetselector(entry.target);
      const source = sampleRUM.sourceselector(entry.target);
      sampleRUM('viewblock', { target, source });
    });
}, { threshold: 0.25 }) : { observe: () => {} };

sampleRUM.observe = ((elements) => {
  elements.forEach((element) => {
    if (element.tagName.toLowerCase() === 'img'
    || element.tagName.toLowerCase() === 'video'
    || element.tagName.toLowerCase() === 'audio'
    || element.tagName.toLowerCase() === 'iframe') {
      sampleRUM.mediaobserver.observe(element);
    } else {
      sampleRUM.blockobserver.observe(element);
    }
  });
});

sampleRUM.sourceselector = (element) => {
  if (element === document.body || element === document.documentElement || !element) {
    return undefined;
  }
  if (element.id) {
    return `#${element.id}`;
  }
  if (element.getAttribute('data-block-name')) {
    return `.${element.getAttribute('data-block-name')}`;
  }
  return sampleRUM.sourceselector(element.parentElement);
};

sampleRUM.targetselector = (element) => {
  let value = element.getAttribute('href') || element.currentSrc || element.getAttribute('src');
  if (value && value.startsWith('https://')) {
    // resolve relative links
    value = new URL(value, window.location).href;
  }
  return value;
};

sampleRUM('top');
window.addEventListener('load', () => sampleRUM('load'));
document.addEventListener('click', (event) => {
  sampleRUM('click', {
    target: sampleRUM.targetselector(event.target),
    source: sampleRUM.sourceselector(event.target),
  });
});

const olderror = window.onerror;
window.onerror = (event, source, line) => {
  sampleRUM('error', { source, target: line });
  // keep the old error handler around
  if (typeof olderror === 'function') {
    olderror(event, source, line);
  } else {
    throw new Error(event);
  }
};

sampleRUM('top');
window.addEventListener('load', () => sampleRUM('load'));
document.addEventListener('click', () => sampleRUM('click'));

loadPage(document);

/**
 * Returns the language dependent root path
 * @returns {string} The computed root path
 */
export function getRootPath() {
  const loc = window.location.pathname.includes('/blog/') ? window.location.pathname.split('/blog/')[0] : '';
  return `${loc}/blog`;
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
    [`<p><a href="${getRootPath()}/authors/${toClassName(author)}">${author}</a></p>
      <p>${publicationDate}</p>`],
    [{ elems: [picture.closest('p'), getImageCaption(picture)] }],
  ]);
  div.append(articleHeaderBlockEl);
  mainEl.prepend(div);
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
      mainEl.lastElementChild.append(tagsBlock);
    }
  }
}

function buildTagHeader(mainEl) {
  const div = mainEl.querySelector('div');
  const h1 = mainEl.querySelector('h1');
  const picture = mainEl.querySelector('picture');
  const tagHeaderBlockEl = buildBlock('tag-header', [
    [h1],
    [{ elems: [picture.closest('p')] }],
  ]);
  div.prepend(tagHeaderBlockEl);
}

function buildArticleFeed(mainEl, type) {
  const div = document.createElement('div');
  const title = mainEl.querySelector('h1').textContent.trim();
  const articleFeedEl = buildBlock('article-feed', [
    [type, title],
  ]);
  div.append(articleFeedEl);
  mainEl.append(div);
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
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(mainEl) {
  removeStylingFromImages(mainEl);
  try {
    if (getMetadata('publication-date') && !mainEl.querySelector('.article-header')) {
      buildArticleHeader(mainEl);
      buildTagsBlock(mainEl);
    }
    if (window.location.pathname.includes('/tags/')) {
      buildTagHeader(mainEl);
      if (!document.querySelector('.article-feed')) {
        buildArticleFeed(mainEl, 'tags');
      }
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

  let appendTo;
  els.forEach((el) => {
    if (el === block) appendTo = blockSection;
    if (appendTo) {
      appendTo.appendChild(el);
      appendTo = postBlockSection;
    }
  });
  if (!section.hasChildNodes()) {
    section.remove();
  }
  if (!blockSection.hasChildNodes()) {
    blockSection.remove();
  }
  if (!postBlockSection.hasChildNodes()) {
    postBlockSection.remove();
  }
}

function splitSections() {
  document.querySelectorAll('main > div > div').forEach((block) => {
    const blocksToSplit = ['article-header', 'article-feed', 'recommended-articles'];
    if (blocksToSplit.includes(block.className)) {
      unwrapBlock(block);
    }
  });
}

function removeEmptySections() {
  document.querySelectorAll('main > div:empty').forEach((div) => {
    div.remove();
  });
}

/**
 * Wraps each section in an additional {@code div}.
 * @param {[Element]} sections The sections
 */
function wrapSections(sections) {
  sections.forEach((div) => {
    if (!div.id) {
      const wrapper = document.createElement('div');
      wrapper.className = 'section';
      div.parentNode.appendChild(wrapper);
      wrapper.appendChild(div);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
export function decorateMain(main) {
  // forward compatible pictures redecoration
  decoratePictures(main);
  buildAutoBlocks(main);
  splitSections();
  removeEmptySections();
  wrapSections(main.querySelectorAll(':scope > div'));
  decorateBlocks(main);

  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));

  /* hide h1 on homepage */
  if (window.location.pathname.endsWith('/blog/')) {
    const h1 = document.querySelector('h1');
    if (h1) h1.classList.add('hidden');
  }
}

function unhideBody() {
  try {
    const id = (
      alloy
        ? 'alloy-prehiding'
        : 'at-body-style'
    );
    document.head.removeChild(document.getElementById(id));
  } catch (e) {
    // nothing
  }
}

function hideBody() {
  const style = document.createElement('style');
  style.id = (
    alloy
      ? 'alloy-prehiding'
      : 'at-body-style'
  );
  style.innerHTML = (
    alloy
      ? 'body{visibility: hidden !important}'
      : '.personalization-container{opacity:0.01 !important}'
  );

  try {
    document.head.appendChild(style);
  } catch (e) {
    // nothing
  }
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager() {
  const main = document.querySelector('main');
  if (main) {
    decorateMain(main);
    document.querySelector('body').classList.add('appear');
    let target = getMetadata('target').toLocaleLowerCase() === 'on';
    if (alloy) {
      document.querySelector('body').classList.add('personalization-container');
      target = true;
    }
    if (target) {
      hideBody();
      setTimeout(() => {
        unhideBody();
      }, 3000);
    }
    await waitForLCP();
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

const LANG = {
  EN: 'en',
  DE: 'de',
  FR: 'fr',
  KO: 'ko',
  ES: 'es',
  IT: 'it',
  JP: 'jp',
  BR: 'br',
};

const LANG_LOC = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  ko: 'ko-KR',
  es: 'es-ES', // es-MX?
  it: 'it-IT',
  jp: 'ja-JP',
  br: 'pt-BR',
};

let language;

export function getLanguage() {
  if (language) return language;
  language = LANG.EN;
  const segs = window.location.pathname.split('/');
  if (segs && segs.length > 0) {
    // eslint-disable-next-line no-restricted-syntax
    for (const [, value] of Object.entries(LANG)) {
      if (value === segs[1]) {
        language = value;
        break;
      }
    }
  }
  return language;
}

/**
 * Get the current Helix environment
 * @returns {Object} the env object
 */
export function getHelixEnv() {
  let envName = sessionStorage.getItem('helix-env');
  if (!envName) envName = 'prod';
  const envs = {
    stage: {
      ims: 'stg1',
      adobeIO: 'cc-collab-stage.adobe.io',
      adminconsole: 'stage.adminconsole.adobe.com',
      account: 'stage.account.adobe.com',
    },
    prod: {
      ims: 'prod',
      adobeIO: 'cc-collab.adobe.io',
      adminconsole: 'adminconsole.adobe.com',
      account: 'account.adobe.com',
    },
  };
  const env = envs[envName];

  const overrideItem = sessionStorage.getItem('helix-env-overrides');
  if (overrideItem) {
    const overrides = JSON.parse(overrideItem);
    const keys = Object.keys(overrides);
    env.overrides = keys;

    keys.forEach((value) => {
      env[value] = overrides[value];
    });
  }

  if (env) {
    env.name = envName;
  }
  return env;
}

async function loadMartech() {
  const target = getMetadata('target').toLocaleLowerCase() === 'on';
  const env = getHelixEnv();
  const prod = env.name === 'prod' && usp.get('alloy-env') !== 'stage';

  // new alloy implementation
  if (alloy) {
    window.alloy_all = {
      xdm: {
        _adobe_corpnew: {
          digitalData: {
            page: {
              pageInfo: {
                language: LANG_LOC[getLanguage()] || '',
                legacyMarketSegment: 'COM',
              },
            },
          },
        },
      },
    };
    window.alloy_deferred = {
      xdm: {
        _adobe_corpnew: {
          digitalData: {
          },
        },
      },
      promises: [],
    };
    window.marketingtech = {
      adobe: {
        // NOTE: enable target everywhere all the time
        target: true,
        alloy: {
          edgeConfigId: (
            prod
              ? '65acfd54-d9fe-405c-ba04-8342d6782ab0'
              : '7d1ba912-10b6-4384-a8ff-4bfb1178e869'
          ),
        },
        launch: {
          url: (
            prod
              ? 'https://assets.adobedtm.com/d4d114c60e50/cf25c910a920/launch-9e8f94c77339.min.js'
              : 'https://assets.adobedtm.com/d4d114c60e50/cf25c910a920/launch-1bba233684fa-development.js'
          ),
          load: (l) => {
            const delay = () => (
              setTimeout(l, 4000)
            );
            if (document.readyState === 'complete') {
              delay();
            } else {
              window.addEventListener('load', delay);
            }
          },
        },
      },
    };
    window.alloy_deferred.promises.push(new Promise((resolve) => {
      loadScript(`https://www.adobe.com/marketingtech/${(
        prod ? 'main.alloy.min.js' : 'main.stage.alloy.js'
      )}`, async () => {
        const resp = await fetch('/blog/instrumentation.json');
        const json = await resp.json();
        const get = (obj, str) => {
          const segs = str.split('.');
          let temp = obj;
          let i = 0;
          const il = segs.length - 1;
          // get to the path
          // eslint-disable-next-line no-plusplus
          for (; i < il; i++) {
            const seg = segs[i];
            if (!temp[seg]) {
              return undefined;
            }
            temp = temp[seg];
          }
          // get the value
          return temp[segs[i]];
        };
        const set = (obj, str, value) => {
          const segs = str.split('.');
          let temp = obj;
          let i = 0;
          const il = segs.length - 1;
          // get to the path
          // eslint-disable-next-line no-plusplus
          for (; i < il; i++) {
            const seg = segs[i];
            temp[seg] = temp[seg] || {};
            temp = temp[seg];
          }
          // set the value
          temp[segs[i]] = value;
          return obj;
        };
        // set digitalData
        const digitalDataMap = json.digitaldata.data;
        digitalDataMap.forEach((mapping) => {
          const metaValue = getMetadata(mapping.metadata);
          if (metaValue) {
            set(
              // eslint-disable-next-line no-underscore-dangle
              window.alloy_deferred.xdm._adobe_corpnew.digitalData,
              mapping.digitaldata,
              metaValue,
            );
          }
        });
        // set lists
        const digitalDataLists = json['digitaldata-lists'].data;
        digitalDataLists.forEach((listEntry) => {
          const metaValue = getMetadata(listEntry.metadata);
          if (metaValue) {
            let listValue = get(
              // eslint-disable-next-line no-underscore-dangle
              window.alloy_deferred.xdm._adobe_corpnew.digitalData,
              listEntry.digitaldata,
            ) || '';
            const name = listEntry['list-item-name'];
            const metaValueArr = listEntry.delimiter
              ? metaValue.split(listEntry.delimiter)
              : [metaValue];
            metaValueArr.forEach((value) => {
              const escapedValue = value.split('|').join(); // well, well...
              listValue += `${listValue ? ' | ' : ''}${name}: ${escapedValue}`;
            });
            set(
              // eslint-disable-next-line no-underscore-dangle
              window.alloy_deferred.xdm._adobe_corpnew.digitalData,
              listEntry.digitaldata,
              listValue,
            );
          }
        });
        resolve();
      });
    }));

  // legacy implementation
  } else {
    window.digitalData = {
      page: {
        pageInfo: {
          language: LANG_LOC[getLanguage()] || '',
          category: 'unknown: before setDigitalData()',
        },
      },
    };
    window.marketingtech = {
      adobe: {
        target,
        audienceManager: true,
        launch: {
          property: 'global',
          environment: 'production',
        },
      },
    };
    window.targetGlobalSettings = window.targetGlobalSettings || {};
    loadScript('https://www.adobe.com/marketingtech/main.min.js', async () => {
      const digitaldata = window.digitalData;
      digitaldata.page.pageInfo.category = 'unknown: before instrumentation.json';
      const resp = await fetch('/blog/instrumentation.json');
      const json = await resp.json();
      delete digitaldata.page.pageInfo.category;
      const digitalDataMap = json.digitaldata.data;
      digitalDataMap.forEach((mapping) => {
        const metaValue = getMetadata(mapping.metadata);
        if (metaValue) {
          // eslint-disable-next-line no-underscore-dangle
          digitaldata._set(mapping.digitaldata, metaValue);
        }
      });
      const digitalDataLists = json['digitaldata-lists'].data;
      digitalDataLists.forEach((listEntry) => {
        const metaValue = getMetadata(listEntry.metadata);
        if (metaValue) {
          // eslint-disable-next-line no-underscore-dangle
          let listValue = digitaldata._get(listEntry.digitaldata) || '';
          const name = listEntry['list-item-name'];
          const metaValueArr = listEntry.delimiter
            ? metaValue.split(listEntry.delimiter)
            : [metaValue];
          metaValueArr.forEach((value) => {
            const escapedValue = value.split('|').join(); // well, well...
            listValue += `${listValue ? ' | ' : ''}${name}: ${escapedValue}`;
          });
          // eslint-disable-next-line no-underscore-dangle
          digitaldata._set(listEntry.digitaldata, listValue);
        }
      });
    });
  }
}

async function loadfooterBanner(main) {
  // getting Banner URL from the json
  const { href } = window.location;
  let URLpattern;
  const resp = await fetch(`${getRootPath()}/footer-banner.json`);
  const json = await resp.json();
  let defaultBannerURL;
  let footerBannerURL;
  const metaTag = getMetadata('article:tag');
  let metaTags;
  if (metaTag) {
    metaTags = getMetadata('article:tag').split(', ');
  }
  json.data.every((entry) => {
    if (entry.URL === 'default' || entry.default === 'default') {
      defaultBannerURL = entry.banner;
    }

    // checking URL's column
    const endStrMark = entry.URL.slice(-1) !== '*' ? '$' : '';
    URLpattern = new RegExp(`${entry.URL}${endStrMark}`);
    if (entry.URL && URLpattern.test(href)) {
      footerBannerURL = entry.banner;
      return false;
    }

    // checking tag's column
    if (metaTags && metaTags.find((tag) => tag.toLowerCase() === entry.tag.toLowerCase())) {
      footerBannerURL = entry.banner;
      return false;
    }
    return true;
  });

  if (!footerBannerURL) {
    footerBannerURL = defaultBannerURL;
  }

  // Do nothing if footerBannerURL isn't available to avoid 404
  if (!footerBannerURL) {
    return;
  }

  // get block body from the Banner URL
  const response = await fetch(`${footerBannerURL}.plain.html`);
  if (response.ok) {
    const responseEl = document.createElement('div');
    responseEl.innerHTML = await response.text();
    responseEl.classList.add('section');
    const bannerCTABlock = responseEl.querySelector('div[class^="banner-cta"]');
    main.append(responseEl);
    const header = document.querySelector('header');
    header.addEventListener('gnav:init', () => {
      const gnavCta = header.querySelector('.gnav-cta a');
      if (gnavCta) {
        bannerCTABlock.querySelector('a').href = gnavCta.href;
      }
    });
    // decorate the banner block
    decorateBlock(bannerCTABlock);
    loadBlock(bannerCTABlock);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy() {
  const main = document.querySelector('main');

  // post LCP actions go here
  sampleRUM('lcp');

  /* load gnav */
  const header = document.querySelector('header');
  const gnavPath = getMetadata('gnav') || `${getRootPath()}/gnav`;
  header.setAttribute('data-block-name', 'gnav');
  header.setAttribute('data-gnav-source', gnavPath);
  loadBlock(header);

  /* load footer */
  const footer = document.querySelector('footer');
  footer.setAttribute('data-block-name', 'footer');
  footer.setAttribute('data-footer-source', `${getRootPath()}/footer`);
  loadBlock(footer);
  loadfooterBanner(main);

  loadBlocks(main);
  loadCSS('/styles/lazy-styles.css');
  addFavIcon('/styles/favicon.svg');
  if (!window.hlx.lighthouse) loadMartech();
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
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
 * Build article card
 * @param {Element} article The article data to be placed in card.
 * @returns card Generated card
 */
export function buildArticleCard(article, type = 'article') {
  const {
    title, description, image, imageAlt, category,
  } = article;

  const path = article.path.split('.')[0];

  const picture = createOptimizedPicture(image, imageAlt || title, type === 'featured-article', [{ width: '750' }]);
  const pictureTag = picture.outerHTML;
  const card = document.createElement('a');
  card.className = `${type}-card`;
  card.href = path;
  card.innerHTML = `<div class="${type}-card-image">
      ${pictureTag}
    </div>
    <div class="${type}-card-body">
      <p class="${type}-card-category">
        <a href="${window.location.origin}${getRootPath()}/tags/${toClassName(category)}">${category}</a>
      </p>
      <h3>${title}</h3>
      <p>${description}</p>
    </div>`;
  return card;
}

/**
 * fetches the string variables.
 * @returns {object} localized variables
 */
export async function fetchPlaceholders() {
  if (!window.placeholders) {
    const resp = await fetch(`${getRootPath()}/placeholders.json`);
    const json = await resp.json();
    window.placeholders = {};
    json.data.forEach((placeholder) => {
      window.placeholders[placeholder.Key] = placeholder.Text;
    });
  }
  return window.placeholders;
}

/**
 * forward looking *.metadata.json experiment
 * fetches metadata.json of page
 * @param {path} path to *.metadata.json
 * @returns {Object} containing sanitized meta data
 */
async function getMetadataJson(path) {
  const resp = await fetch(path.split('.')[0]);
  const text = await resp.text();
  const meta = {};
  if (resp.status === 200 && text && text.includes('<head>')) {
    const headStr = text.split('<head>')[1].split('</head>')[0];
    const head = document.createElement('head');
    head.innerHTML = headStr;
    const metaTags = head.querySelectorAll(':scope > meta');
    metaTags.forEach((metaTag) => {
      const name = metaTag.getAttribute('name') || metaTag.getAttribute('property');
      const value = metaTag.getAttribute('content');
      if (meta[name]) {
        meta[name] += `, ${value}`;
      } else {
        meta[name] = value;
      }
    });
  }
  return (JSON.stringify(meta));
}

/**
 * gets a blog article index information by path.
 * @param {string} path indentifies article
 * @returns {object} article object
 */
export async function getBlogArticle(path) {
  const json = await getMetadataJson(`${path}.metadata.json`);
  const meta = JSON.parse(json);
  if (meta['og:title']) {
    const articleMeta = {
      description: meta.description,
      title: meta['og:title'],
      image: meta['og:image'],
      imageAlt: meta['og:image:alt'],
      date: meta['publication-date'],
      path,
      category: meta.category,
    };
    return (articleMeta);
  }
  return null;
}

export function rewritePath(path) {
  let newpath = path;
  const replacements = [{
    from: 'news',
    to: 'the-latest',
  }, {
    from: 'insights',
    to: 'perspectives',
  }];
  replacements.forEach((r) => {
    newpath = newpath.replace(`/${r.from}/`, `/${r.to}/`);
  });
  return newpath;
}

export function debug(message) {
  const { hostname } = window.location;
  const env = getHelixEnv();
  if (env.name !== 'prod' || hostname === 'localhost') {
    // eslint-disable-next-line no-console
    console.log(message);
  }
}

export function getBlockClasses(className) {
  const trimDashes = (str) => str.replace(/(^\s*-)|(-\s*$)/g, '');
  const blockWithVariants = className.split('--');
  const name = trimDashes(blockWithVariants.shift());
  const variants = blockWithVariants.map((v) => trimDashes(v));
  return { name, variants };
}

export function makeLinkRelative(href) {
  const url = new URL(href);
  const host = url.hostname;
  if (host.endsWith('.page') || host.endsWith('.live') || host === 'business.adobe.com') return (`${url.pathname}${url.search}${url.hash}`);
  return (href);
}

async function addSegmentToIndex(url, index, pageSize) {
  const resp = await fetch(url);
  const json = await resp.json();
  const complete = (json.limit + json.offset) === json.total;
  json.data.forEach((post) => {
    index.data.push(post);
    index.byPath[post.path.split('.')[0]] = post;
  });
  index.complete = complete;
  index.offset = json.offset + pageSize;
}

/**
 * fetches blog article index.
 * @returns {object} index with data and path lookup
 */
export async function fetchBlogArticleIndex() {
  const pageSize = 1000;
  window.blogIndex = window.blogIndex || {
    data: [],
    byPath: {},
    offset: 0,
    complete: false,
  };
  if (window.blogIndex.complete) return (window.blogIndex);
  const index = window.blogIndex;
  const { offset } = index;
  await addSegmentToIndex(`${getRootPath()}/query-index.json?limit=${pageSize}&offset=${offset}`, index, pageSize);
  if (getRootPath() === '/uk/blog' || getRootPath() === '/au/blog') {
    await addSegmentToIndex(`/blog/query-index.json?limit=${pageSize}&offset=${offset}`, index, pageSize);
    index.data.sort((a, b) => b.date - a.date);
  }
  return (index);
}

/*
 * lighthouse performance instrumentation helper
 * (needs a refactor)
 */
export function stamp(message) {
  if (window.name.includes('performance')) {
    debug(`${new Date() - performance.timing.navigationStart}:${message}`);
  }
}
