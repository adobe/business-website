import {
  fetchVariables,
} from '../../scripts/scripts.js';

async function markupToFooter(url) {
  const resp = await fetch(`${url}.plain.html`);
  const html = await resp.text();
  const placeholder = document.createElement('div');
  placeholder.innerHTML = html;
  const data = {};

  const regionEl = placeholder.querySelector('.region-selector');
  if (regionEl) {
    const regions = [];
    let selected;
    if (regionEl.querySelector('a')) { // multi-option
      regionEl.querySelectorAll('a').forEach((a) => {
        const { href, textContent: region } = a;
        const { pathname: path } = new URL(href);
        regions.push({ region, path });
        const parentNode = a.parentNode.nodeName;
        if (parentNode === 'STRONG') {
          selected = region;
        }
      });
    }
    data.regionSelector = {
      selected,
      options: regions,
    };
  }

  data.copyright = placeholder.querySelector(':scope > div em').textContent;

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
  const regionHtml = `
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
  </div>`;
  const infoHtml = `
  <div class="footer-info">
    <p class="footer-copyright-text">
      ${data.copyright}
    </p>
    <ul class="footer-links"></ul>
  </div>`;
  if (data.regionSelector) {
    footer.innerHTML = regionHtml;

    const regionOptionsContainer = footer.querySelector('.footer-region-options');

    data.regionSelector.options.forEach((option) => {
      const li = document.createElement('li');
      li.className = 'footer-region-option';
      const a = document.createElement('a');
      a.href = option.path;
      a.textContent = option.region;
      a.setAttribute('title', option.region);
      if (option.region === data.regionSelector.selected) {
        li.classList.add('footer-region-selected');
      }
      li.append(a);
      regionOptionsContainer.append(li);
    });
  }
  footer.innerHTML += infoHtml;

  const regionBtn = footer.querySelector('.footer-region-button');
  if (regionBtn) {
    regionBtn.addEventListener('click', () => {
      const regionsExpanded = regionBtn.getAttribute('aria-expanded');
      if (regionsExpanded === 'false') {
        regionBtn.setAttribute('aria-expanded', true);
      } else {
        regionBtn.setAttribute('aria-expanded', false);
      }

      window.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' && regionsExpanded === 'true') {
          regionBtn.setAttribute('aria-expanded', false);
        }
      });
    });

    window.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      const regionsExpanded = regionBtn.getAttribute('aria-expanded');
      if (a !== regionBtn && regionsExpanded === 'true') {
        regionBtn.setAttribute('aria-expanded', false);
      }
    });
  }

  const linkContainer = footer.querySelector('.footer-links');

  data.links.forEach((link) => {
    const li = document.createElement('li');
    li.className = 'footer-link';
    if (link.href) {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.text;
      const { hash } = new URL(link.href);
      if (hash === '#interest-based-ads') {
        li.innerHTML = '<img class="footer-link-img" loading="lazy" src="/blocks/footer/adchoices-small.svg">';
      }
      li.append(a);
      linkContainer.append(li);
    }
  });

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
