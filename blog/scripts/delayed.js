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

/* globals */
import { loadScript, sampleRUM, getHelixEnv } from './scripts.js';

function updateExternalLinks() {
  document.querySelectorAll('main a, footer a').forEach((a) => {
    if (!a.href) {
      return;
    }

    const { origin } = new URL(a);
    if (origin && origin !== window.location.origin && !a.getAttribute('rel')) {
      a.setAttribute('rel', 'noopener');
      a.setAttribute('target', '_blank');
    }
  });
}

if (document.querySelector('.article-header') && !document.querySelector('[data-origin]')) {
  loadScript('/blog/blocks/interlinks/interlinks.js', null, 'module');
}

updateExternalLinks();

/* Core Web Vitals RUM collection */

sampleRUM('cwv');
sampleRUM.observe(document.querySelectorAll('main picture > img'));

function loadPrivacy() {
  function getOtDomainId() {
    const domains = {
      'adobe.com': '7a5eb705-95ed-4cc4-a11d-0cc5760e93db',
      'hlx.page': '3a6a37fe-9e07-4aa9-8640-8f358a623271',
    };

    const currentDomain = Object.keys(domains)
      .find((domain) => window.location.host.indexOf(domain) > -1);

    return `${domains[currentDomain] || domains[Object.keys(domains)[0]]}`;
  }

  // Configure Privacy
  window.fedsConfig = {
    privacy: {
      otDomainId: getOtDomainId(),
    },
  };

  const preferenceCenter = document.querySelector('[href="https://www.adobe.com/#openPrivacy"]');
  if (preferenceCenter) {
    preferenceCenter.addEventListener('click', (event) => {
      event.preventDefault();
      window?.adobePrivacy?.showConsentPopup();
    });
  }

  const env = getHelixEnv().name === 'prod' ? '' : 'stage.';
  loadScript(`https://www.${env}adobe.com/etc/beagle/public/globalnav/adobe-privacy/latest/privacy.min.js`);
}

if (!window.hlx.lighthouse) loadPrivacy();

async function setupLinkTracking() {
  const resp = await fetch('/blog/instrumentation.json');
  const json = await resp.json();
  const linkTracking = json['link-tracking'].data;
  linkTracking.forEach((entry) => {
    // eslint-disable-next-line no-underscore-dangle
    document.querySelectorAll(entry.selector).forEach((el) => {
      el.setAttribute('daa-lh', el.getAttribute('data-block-name'));
      el.querySelectorAll('a').forEach((a) => {
        if (a.href) {
          let value = '';
          const img = a.querySelector('img');
          if (img) {
            value = img.getAttribute('alt');
          } else {
            value = a.textContent.trim().substr(0, 64);
          }
          a.setAttribute('daa-ll', value);
        }
      });
    });
  });
}

setupLinkTracking();

function getCookie(cname) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function setLinksToGeo(location) {
  const glocalCountries = ['au', 'uk'];
  sessionStorage.setItem('blog-international', location.country);
  if (location.country && glocalCountries.includes(location.country.toLowerCase())) {
    const prefix = `/${location.country.toLowerCase()}`;
    // eslint-disable-next-line no-console
    console.log(`setting links to: ${prefix}`);
    document.querySelectorAll('a[href^="https://business.adobe.com"], a[href^="https://www.adobe.com"]').forEach((a) => {
      const url = new URL(a.href);
      if (!url.pathname.startsWith(prefix) && !url.pathname.startsWith('/blog')) {
        const newHref = `${url.protocol}//${url.host}${prefix}${url.pathname}${url.search}`;
        fetch(newHref).then((response) => {
          if (response.ok) {
            a.href = newHref;
          }
        });
      }
    });
  }
}

window.setLinksToGeo = setLinksToGeo;

setTimeout(() => {
  const intl = sessionStorage.getItem('blog-international') || getCookie('international');
  if (intl) {
    setLinksToGeo({ country: intl });
  } else {
    loadScript('https://geo2.adobe.com/json/?callback=setLinksToGeo');
  }
}, 2000);
