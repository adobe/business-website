import { fetchBlogArticleIndex, getOptimizedImageURL } from '../../scripts/scripts.js';

function highlightTextElements(terms, elements) {
  elements.forEach((e) => {
    const matches = [];
    const txt = e.textContent;
    terms.forEach((term) => {
      const offset = txt.toLowerCase().indexOf(term);
      if (offset >= 0) {
        matches.push({ offset, term });
      }
    });
    matches.sort((a, b) => a.offset - b.offset);
    let markedUp = '';
    if (!matches.length) markedUp = txt;
    else {
      markedUp = txt.substr(0, matches[0].offset);
      matches.forEach((hit, i) => {
        markedUp += `<span class="gnav-search-highlight">${txt.substr(hit.offset, hit.term.length)}</span>`;
        if (matches.length - 1 === i) {
          markedUp += txt.substr(hit.offset + hit.term.length);
        } else {
          markedUp += txt.substring(hit.offset + hit.term.length, matches[i + 1].offset);
        }
      });
      e.innerHTML = markedUp;
    }
  });
}

async function populateSearchResults(searchTerms, searchResultsEl) {
  const limit = 12;
  const terms = searchTerms.toLowerCase().split(' ').map((e) => e.trim()).filter((e) => !!e);
  searchResultsEl.innerHTML = '';

  if (terms.length) {
    if (!window.blogIndex) {
      window.blogIndex = await fetchBlogArticleIndex();
    }

    const articles = window.blogIndex.data;

    const hits = [];
    let i = 0;
    for (; i < articles.length; i += 1) {
      const e = articles[i];
      const text = [e.category, e.title, e.teaser].join(' ').toLowerCase();

      if (terms.every((term) => text.includes(term))) {
        if (hits.length === limit) {
          break;
        }
        hits.push(e);
      }
    }

    hits.forEach((e) => {
      const {
        title, description, image, category,
      } = e;

      const path = e.path.split('.')[0];

      const imagePath = image.split('?')[0].split('_')[1];
      const imageSrc = getOptimizedImageURL(`./media_${imagePath}?format=webply&optimize=medium&width=2000`);
      const pictureTag = `<picture>
        <img src="${imageSrc}">
      </picture>`;
      const card = document.createElement('a');
      card.className = 'article-card';
      card.href = path;
      card.innerHTML = `<div class="article-card-image">
          ${pictureTag}
        </div>
        <div class="article-card-body">
        <p class="article-card-category">${category}</p>
        <h3>${title}</h3>
          <p>${description}</p>
        </div>`;
      searchResultsEl.appendChild(card);
    });

    highlightTextElements(terms, searchResultsEl.querySelectorAll('h3, .article-card-category, .article-card-body > p '));
  }
}

function getRelativeURL(href) {
  const url = new URL(href, window.location);
  if (url.hostname.includes('blog.adobe.com')
    || url.hostname.includes('.page')
    || url.hostname.includes('.live')
    || url.hostname.includes('localhost')) {
    return (url.pathname);
  }
  return (href);
}

function isSelected(navItem) {
  if (navItem.submenu) {
    const matches = navItem.submenu.filter((e) => {
      const navpath = new URL(e.href, window.location).pathname;
      return (navpath === window.location.pathname);
    });
    if (matches.length) return (true);
  }
  if (navItem.href) {
    const navpath = new URL(navItem.href, window.location).pathname;
    return (navpath === window.location.pathname);
  }
  return false;
}

function collapseAll(gnav) {
  [...gnav.querySelectorAll('[aria-expanded=true]')].forEach((expanded) => {
    expanded.setAttribute('aria-expanded', 'false');
  });
}

function getSubmenu(submenu) {
  const submenuEl = document.createElement('div');
  submenuEl.className = 'gnav-submenu';
  submenu.forEach((e) => {
    const navItemEl = document.createElement('div');
    navItemEl.innerHTML = `<a href="${e.href}">${e.text}</a>`;
    submenuEl.appendChild(navItemEl);
  });
  return submenuEl;
}

function getGnav(nav) {
  const gnav = document.createElement('div');
  gnav.className = 'gnav';
  const html = `
        <div class="gnav-hamburger" tabindex="0"></div>
        <div class="gnav-logo"><a href="${nav.logo.href}"><img loading="lazy" src="/blocks/gnav/adobe-logo.svg"></a><span class="gnav-adobe">${nav.logo.text}</span></a></div>
        <div class="gnav-section"></div>
        </div>
        <div class="gnav-search"><div class="gnav-search-icon" tabindex="0"><svg xmlns="http://www.w3.org/2000/svg" id="gnav-search-icon" width="20" height="20" viewBox="0 0 24 24" focusable="false">
            <path d="M14 2A8 8 0 0 0 7.4 14.5L2.4 19.4a1.5 1.5 0 0 0 2.1 2.1L9.5 16.6A8 8 0 1 0 14 2Zm0 14.1A6.1 6.1 0 1 1 20.1 10 6.1 6.1 0 0 1 14 16.1Z"></path></div>
          </svg>
          <div class="gnav-search-box-wrapper">
            <div class="gnav-search-box gnav-nosearch">
              <div class="gnav-search-input">
                <input type="text" id="gnav-search-terms">
                <svg xmlns="http://www.w3.org/2000/svg" id="gnav-search-icon" width="20" height="20" viewBox="0 0 24 24" focusable="false">
                  <path d="M14 2A8 8 0 0 0 7.4 14.5L2.4 19.4a1.5 1.5 0 0 0 2.1 2.1L9.5 16.6A8 8 0 1 0 14 2Zm0 14.1A6.1 6.1 0 1 1 20.1 10 6.1 6.1 0 0 1 14 16.1Z"></path>
                </svg>
              </div>
              <div id="gnav-search-results" class="gnav-search-results">
              </div>
              <div class="gnav-search-link">
                <a href="${nav.search.href}">Try our advanced search</a>
              </div>
            </div>
          </div>
        </div>
        <div class="gnav-signin"><a href="${nav.signIn.href}">${nav.signIn.text}</a></div>`;

  gnav.innerHTML = html;

  const hamburger = gnav.querySelector('.gnav-hamburger');
  hamburger.addEventListener('click', () => {
    const expanded = gnav.getAttribute('aria-expanded') === 'true';
    gnav.setAttribute('aria-expanded', !expanded);
  });

  const search = gnav.querySelector('.gnav-search');
  const searchIcon = gnav.querySelector('.gnav-search-icon');
  const searchTerms = gnav.querySelector('#gnav-search-terms');

  searchIcon.addEventListener('click', () => {
    const expanded = (search.getAttribute('aria-expanded') === 'true');
    collapseAll(gnav);
    search.setAttribute('aria-expanded', !expanded);
    if (!expanded) {
      searchTerms.focus();
    }
  });

  searchTerms.addEventListener('input', () => {
    const searchResultsEl = gnav.querySelector('#gnav-search-results');
    populateSearchResults(searchTerms.value, searchResultsEl);
    const searchBox = gnav.querySelector('.gnav-search-box');
    if (searchTerms.value.trim().length === 0) {
      searchBox.classList.add('gnav-nosearch');
    } else {
      searchBox.classList.remove('gnav-nosearch');
    }
    const a = gnav.querySelector('.gnav-search-link a');
    if (a) {
      const href = new URL(a.href);
      href.searchParams.set('q', searchTerms.value);
      a.href = href.toString();
    }
  });

  searchTerms.addEventListener('keydown', (evt) => {
    if (evt.code === 'Escape') {
      collapseAll(gnav);
    }
  });

  const sectionEl = gnav.querySelector('.gnav-section');

  nav.top.forEach((e) => {
    const selected = isSelected(e) && !sectionEl.querySelector('.gnav-selected');
    const navItemEl = document.createElement('span');
    if (selected) navItemEl.classList.add('gnav-selected');
    if (e.href) {
      navItemEl.innerHTML = `<a href="${e.href}">${e.text}</a>`;
    } else if (e.type === 'button') {
      navItemEl.innerHTML = `<a href="#" class="gnav-button gnav-primary">${e.text}</a>`;
    } else {
      navItemEl.classList.add('gnav-drop');
      navItemEl.setAttribute('tabindex', '0');
      navItemEl.innerHTML = `${e.text}`;
      if (e.submenu) {
        const submenuEl = getSubmenu(e.submenu);
        navItemEl.appendChild(submenuEl);
        navItemEl.addEventListener('click', () => {
          const expanded = navItemEl.getAttribute('aria-expanded') === 'true';
          collapseAll(gnav);
          navItemEl.setAttribute('aria-expanded', !expanded);
        });
      }
    }
    sectionEl.appendChild(navItemEl);
  });

  return (gnav);
}

async function markupToNav(url) {
  const resp = await fetch(`${url}.plain.html`);
  const html = await resp.text();
  const header = document.createElement('header');
  header.innerHTML = html;
  const nav = {};
  nav.top = [...header.querySelectorAll(':scope > div h2')].map((h2) => {
    const navItem = {};
    const div = h2.closest('div');
    navItem.text = h2.textContent;
    const h2a = h2.closest('a') || h2.querySelector('a');
    if (h2a) {
      navItem.href = getRelativeURL(h2a.href);
    }
    if (div.querySelector('li')) {
      navItem.submenu = [...div.querySelectorAll('li')].map((li) => {
        const a = li.querySelector('a');
        const ni = {
          text: li.textContent,
        };
        if (a) ni.href = getRelativeURL(a.href);
        return (ni);
      });
    }
    return (navItem);
  });
  const logo = nav.top.shift();
  nav.logo = logo;

  const signInEl = header.querySelector('.sign-in a');
  if (signInEl) {
    nav.signIn = {
      text: signInEl.textContent,
      href: signInEl.href,
    };
  }

  const searchEl = header.querySelector('.search a');
  if (searchEl) {
    nav.search = {
      text: searchEl.textContent,
      href: searchEl.href,
    };
  }

  return nav;
}

export async function decorateGNav(blockEl, url) {
  const nav = await markupToNav(url);

  blockEl.appendChild(getGnav(nav));
}

export default function decorate(blockEl) {
  const url = blockEl.getAttribute('data-gnav-source');
  decorateGNav(blockEl, url);
}
