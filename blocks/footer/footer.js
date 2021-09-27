import {
  fetchVariables,
  getRootPath,
} from '../../scripts/scripts.js';

async function markupToFooter(url) {
  const resp = await fetch(`${url}.plain.html`);
  const html = await resp.text();
  const placeholder = document.createElement('div');
  placeholder.innerHTML = html;
  const data = {};

  const regionEl = placeholder.querySelector('.region-selector');
  const regions = [
    {
      region: 'Deutsch',
      path: 'de',
    },
    {
      region: 'Español',
      path: 'es',
    },
    {
      region: 'APAC (English)',
      path: 'en_apac',
    },
    {
      region: 'UK (English)',
      path: 'en_uk',
    },
    {
      region: 'US (English)',
      path: '',
    },
    {
      region: 'Français',
      path: 'fr',
    },
    {
      region: 'Italiano',
      path: 'it',
    },
    {
      region: '日本',
      path: 'jp',
    },
    {
      region: '한국어',
      path: 'ko',
    },
    {
      region: 'Português',
      path: 'br',
    },
  ];
  if (regionEl) {
    data.regionSelector = {
      selected: regionEl.textContent,
      options: regions,
    };
  }

  data.copyright = placeholder.querySelector(':scope > div p').textContent;

  data.links = [...placeholder.querySelectorAll(':scope > div h2')].map((h2) => {
    const link = {};
    link.text = h2.textContent;
    const h2a = h2.closest('a') || h2.querySelector('a');
    if (h2a) {
      link.href = h2a.href;
    }
    return link;
  });

  return data;
}

async function getFooter(data) {
  const vars = await fetchVariables();

  const footer = document.createElement('div');
  footer.className = 'footer';
  const html = `
  <div class="footer-region">
    <a class="footer-region-button" id="region-button" aria-haspopup="true" aria-expanded="false" role="button">
      <img class="footer-region-img" loading="lazy" src="/blocks/footer/globe.svg">
      <span class="footer-region-text">
        ${vars['change-language']}
      </span>
    </a>
    <div class="footer-region-dropdown" aria-labelledby="region-button" role="menu">
      <ul class="footer-region-options"></ul>
    </div>
  </div>
  <div class="footer-info">
    <p class="footer-copyright-text">
      ${data.copyright}
    </p>
    <ul class="footer-links"></ul>
  </div>
  `;

  footer.innerHTML = html;

  const regionOptionsContainer = footer.querySelector('.footer-region-options');
  const { origin } = new URL(window.location);

  data.regionSelector.options.forEach((option) => {
    const li = document.createElement('li');
    li.className = 'footer-region-option';
    const a = document.createElement('a');
    a.href = `${origin}/blog/${option.path}`;
    a.textContent = option.region;
    a.setAttribute('title', option.region);
    if (option.region === data.regionSelector.selected) {
      li.classList.add('region-selected');
    }
    li.append(a);
    regionOptionsContainer.append(li);
  });

  const regionBtn = footer.querySelector('.footer-region-button');

  regionBtn.onclick = () => {
    const regionsExpanded = regionBtn.getAttribute('aria-expanded');
    // const btn = e.target.closest('a');
    if (regionsExpanded === 'false') {
      regionBtn.setAttribute('aria-expanded', true);
    } else {
      regionBtn.setAttribute('aria-expanded', false);
    }

    window.onkeydown = (keyE) => {
      if (keyE.code === 'Escape') {
        regionBtn.setAttribute('aria-expanded', false);
      }
    };
  };

  window.onclick = (e) => {
    const a = e.target.closest('a');
    const regionsExpanded = regionBtn.getAttribute('aria-expanded');
    if (
      a !== regionBtn
      && regionsExpanded === 'true'
    ) {
      regionBtn.setAttribute('aria-expanded', false);
    }
  };

  const linkContainer = footer.querySelector('.footer-links');

  data.links.forEach((link) => {
    const li = document.createElement('li');
    li.className = 'footer-link';
    if (link.href) {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.text;
      if (
        link.text.startsWith('Ad')
        || link.text.startsWith('Choix')
      ) {
        li.innerHTML = '<img class="footer-region-img" loading="lazy" src="/blocks/footer/adchoices-small.svg">';
      }
      li.append(a);
      linkContainer.append(li);
    }
  });

  // const hamburger = footer.querySelector('.footer-hamburger');
  // hamburger.addEventListener('click', () => {
  //   const expanded = footer.getAttribute('aria-expanded') === 'true';
  //   footer.setAttribute('aria-expanded', !expanded);
  // });

  // const search = footer.querySelector('.footer-search');
  // const searchIcon = footer.querySelector('.footer-search-icon');
  // const searchTerms = footer.querySelector('#footer-search-terms');

  // searchIcon.addEventListener('click', () => {
  //   const expanded = (search.getAttribute('aria-expanded') === 'true');
  //   collapseAll(footer);
  //   search.setAttribute('aria-expanded', !expanded);
  //   if (!expanded) {
  //     searchTerms.focus();
  //   }
  // });

  // searchTerms.addEventListener('input', () => {
  //   const searchResultsEl = footer.querySelector('#footer-search-results');
  //   populateSearchResults(searchTerms.value, searchResultsEl);
  //   const searchBox = footer.querySelector('.footer-search-box');
  //   if (searchTerms.value.trim().length === 0) {
  //     searchBox.classList.add('footer-nosearch');
  //   } else {
  //     searchBox.classList.remove('footer-nosearch');
  //   }
  //   const a = footer.querySelector('.footer-search-link a');
  //   if (a) {
  //     const href = new URL(a.href);
  //     href.searchParams.set('q', searchTerms.value);
  //     a.href = href.toString();
  //   }
  // });

  // searchTerms.addEventListener('keydown', (evt) => {
  //   if (evt.code === 'Escape') {
  //     collapseAll(footer);
  //   }
  // });

  // const sectionEl = footer.querySelector('.footer-section');

  // nav.top.forEach((e) => {
  //   const selected = isSelected(e) && !sectionEl.querySelector('.footer-selected');
  //   const navItemEl = document.createElement('span');
  //   if (selected) navItemEl.classList.add('footer-selected');
  //   if (e.href) {
  //     navItemEl.innerHTML = `<a href="${e.href}">${e.text}</a>`;
  //   } else if (e.type === 'button') {
  //     navItemEl.innerHTML = `<a href="#" class="footer-button footer-primary">${e.text}</a>`;
  //   } else {
  //     navItemEl.classList.add('footer-drop');
  //     navItemEl.setAttribute('tabindex', '0');
  //     navItemEl.innerHTML = `${e.text}`;
  //     if (e.submenu) {
  //       const submenuEl = getSubmenu(e.submenu);
  //       navItemEl.appendChild(submenuEl);
  //       navItemEl.addEventListener('click', () => {
  //         const expanded = navItemEl.getAttribute('aria-expanded') === 'true';
  //         collapseAll(footer);
  //         navItemEl.setAttribute('aria-expanded', !expanded);
  //       });
  //     }
  //   }
  //   sectionEl.appendChild(navItemEl);
  // });

  return (footer);
}

export async function decorateFooter(blockEl, url) {
  const footerData = await markupToFooter(url);
  const footer = await getFooter(footerData);
  blockEl.appendChild(footer);
}

export default function decorate(blockEl) {
  const url = blockEl.getAttribute('data-footer-source');
  decorateFooter(blockEl, url);
}
