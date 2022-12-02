import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  createOptimizedPicture,
} from './lib-franklin.js';

const LCP_BLOCKS = ['featured-article', 'article-header'];

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

const PRODUCTION_DOMAINS = ['business.adobe.com'];

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
 * Sanitizes a name for use as class name.
 * @param {*} name The unsanitized name
 * @returns {string} The class name
 */
export function toClassName(name) {
  return name && typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-')
    : '';
}

function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await waitForLCP(LCP_BLOCKS);
  }
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
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? main.querySelector(hash) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
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

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

/*
 * ------------------------------------------------------------
 * Edit above at your own risk
 * ------------------------------------------------------------
 */

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
 *  Wraps headings in a '.region' container for SEO compliance.
 */
export function compliantHeadings() {
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((tag) => {
    tag.outerHTML = `<div role="region" class="heading-container" aria-label="${tag.textContent.trim()}">${tag.outerHTML}</div>`;
  });
}

// feature flag for alloy
// const alloy = (
//   usp.get('alloy') === 'on'
//   || localStorage.getItem('alloy') === 'on'
// );
// permanently on

/**
 * Returns the language dependent root path
 * @returns {string} The computed root path
 */
export function getRootPath() {
  const loc = window.location.pathname.includes('/blog/') ? window.location.pathname.split('/blog/')[0] : '';
  return `${loc}/blog`;
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
  KO: 'kr',
  ES: 'es',
  IT: 'it',
  JP: 'jp',
  BR: 'br',
};

const LANG_LOC = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  kr: 'ko-KR',
  es: 'es-ES', // es-MX?
  it: 'it-IT',
  jp: 'ja-JP',
  br: 'pt-BR',
};

const SPECIAL_LANG = [
  'kr',
  'jp',
];

let language;
let taxonomy;
export const authorTaxonomy = {};

/**
 * Get the current Helix environment
 * @returns {Object} the env object
 */
export function getHelixEnv() {
  let envName = sessionStorage.getItem('helix-env') || new URL(window.location.href).searchParams.get('env');
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

export function debug(message) {
  const { hostname } = window.location;
  const env = getHelixEnv();
  if (env.name !== 'prod' || hostname === 'localhost') {
    // eslint-disable-next-line no-console
    console.log(message);
  }
}

/**
 * For the given list of topics, returns the corresponding computed taxonomy:
 * - category: main topic
 * - topics: tags as an array
 * - visibleTopics: list of visible topics, including parents
 * - allTopics: list of all topics, including parents
 * @param {Array} topics List of topics
 * @returns {Object} Taxonomy object
 */
function computeTaxonomyFromTopics(topics, path) {
  // no topics: default to a randomly choosen category
  const category = topics?.length > 0 ? topics[0] : 'news';

  if (taxonomy) {
    const allTopics = [];
    const visibleTopics = [];
    // if taxonomy loaded, we can compute more
    topics.forEach((tag) => {
      const tax = taxonomy.get(tag.trim());
      if (tax) {
        if (!allTopics.includes(tag) && !tax.skipMeta) {
          allTopics.push(tag);
          if (tax.isUFT) visibleTopics.push(tag);
          const parents = taxonomy.getParents(tag);
          if (parents) {
            parents.forEach((parent) => {
              const ptax = taxonomy.get(parent);
              if (!allTopics.includes(parent)) {
                allTopics.push(parent);
                if (ptax.isUFT) visibleTopics.push(parent);
              }
            });
          }
        }
      } else {
        debug(`Unknown topic in tags list: ${tag} ${path ? `on page ${path}` : '(current page)'}`);
      }
    });
    return {
      category, topics, visibleTopics, allTopics,
    };
  }
  return {
    category, topics,
  };
}

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

export async function loadTaxonomy(elements) {
  if (!SPECIAL_LANG.includes(getLanguage())) {
    return;
  }
  const mod = await import('./taxonomy.js');
  taxonomy = await mod.default(getLanguage());
  if (taxonomy) {
    // taxonomy loaded, post loading adjustments
    // fix the links which have been created before the taxonomy has been loaded
    // (pre lcp or in lcp block).
    elements.forEach((a) => {
      const topic = a.innerText;
      const tax = taxonomy.get(topic);
      if (tax) {
        a.href = tax.link;
      } else {
        // eslint-disable-next-line no-console
        debug(`Trying to get a link for an unknown topic: ${topic} (current page)`);
        a.href = '#';
      }
      delete a.dataset.topicLink;
    });

    // adjust meta article:tag
    const metaTags = getMetadata('article:tag');
    const currentTags = metaTags ? getMetadata('article:tag').split(',') : [];
    const articleTax = computeTaxonomyFromTopics(currentTags);
    const allTopics = articleTax.allTopics || [];
    allTopics.forEach((topic) => {
      if (!currentTags.includes(topic)) {
        // computed topic (parent...) is not in meta -> add it
        const newMetaTag = document.createElement('meta');
        newMetaTag.setAttribute('property', 'article:tag');
        newMetaTag.setAttribute('content', topic);
        document.head.append(newMetaTag);
      }
    });

    currentTags.forEach((tag) => {
      const tax = taxonomy.get(tag);
      if (tax && tax.skipMeta) {
        // if skipMeta, remove from meta "article:tag"
        const meta = document.querySelector(`[property="article:tag"][content="${tag}"]`);
        if (meta) {
          meta.remove();
        }
        // but add as meta with name
        const newMetaTag = document.createElement('meta');
        newMetaTag.setAttribute('name', tag);
        newMetaTag.setAttribute('content', 'true');
        document.head.append(newMetaTag);
      }
    });
  }
}

/**
 * Load authorTaxonomy to map tanslated author name to English based author link.
 */
export async function loadAuthorTaxonomy() {
  if (!SPECIAL_LANG.includes(getLanguage())) {
    return;
  }
  // Do this process only one time.
  if (Object.keys(authorTaxonomy).length) {
    return;
  }
  const target = `/${getLanguage()}/blog/authors/author-taxonomy.json`;
  const res = await fetch(target);
  const json = await res.json();
  json.data.forEach((item) => {
    authorTaxonomy[item.Name] = item.Link;
  });
}

// add language to html tag
export function setLanguage() {
  const lang = getLanguage();
  const html = document.querySelector('html');
  html.setAttribute('lang', LANG_LOC[lang]);
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
  if (blockEl.firstElementChild) {
    if (blockEl.firstElementChild.nodeName === 'PICTURE' || blockEl.firstElementChild.nodeName === 'VIDEO') {
      figEl.append(blockEl.firstElementChild);
    } else if (blockEl.firstElementChild.nodeName === 'P') {
      const pEls = Array.from(blockEl.children);
      pEls.forEach((pEl) => {
        if (pEl.firstElementChild) {
          if (pEl.firstElementChild.nodeName === 'PICTURE' || pEl.firstElementChild.nodeName === 'VIDEO') {
            figEl.append(pEl.firstElementChild);
          } else if (pEl.firstElementChild.nodeName === 'EM') {
            const figCapEl = buildCaption(pEl);
            figEl.append(figCapEl);
          } else if (pEl.firstElementChild.nodeName === 'A') {
            const picEl = figEl.querySelector('picture');
            if (picEl) {
              pEl.firstElementChild.textContent = '';
              pEl.firstElementChild.append(picEl);
            }
            figEl.prepend(pEl.firstElementChild);
          }
        }
      });
      // catch link-only figures (like embed blocks);
    } else if (blockEl.firstElementChild.nodeName === 'A') {
      figEl.append(blockEl.firstElementChild);
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
    title, description, image, imageAlt, category, h1,
  } = article;

  const picture = createOptimizedPicture(image, imageAlt || title, type === 'featured-article', [{ width: '750' }]);
  const pictureTag = picture.outerHTML;
  const card = document.createElement('a');
  let tagLink = `${window.location.origin}${getRootPath()}/tags/${toClassName(category)}`;
  if (taxonomy && taxonomy.get(category)) {
    tagLink = taxonomy.get(category).link;
  }
  card.className = `${type}-card`;
  card.href = article.path;
  card.innerHTML = `<div class="${type}-card-image">
      ${pictureTag}
    </div>
    <div class="${type}-card-body">
      <p class="${type}-card-category">
        <a href="${tagLink}">${category}</a>
      </p>
      <h3>${h1 || title}</h3>
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
  const resp = await fetch(path);
  const text = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const head = doc.querySelector('head');
  const meta = {};
  if (resp.status === 200 && text && head) {
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
    meta.h1 = doc.querySelector('h1').textContent.trim();
  }
  return (JSON.stringify(meta));
}

/**
 * gets a blog article index information by path.
 * @param {string} path indentifies article
 * @returns {object} article object
 */
export async function getBlogArticle(path) {
  const json = await getMetadataJson(`${path}`);
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
      h1: meta.h1,
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
