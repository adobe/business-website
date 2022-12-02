import {
  normalizeHeadings,
} from '../../../scripts/lib-franklin.js';
import {
  makeLinksRelative,
} from '../../../scripts/scripts.js';

export default function decorate(block) {
  const bannerContents = document.createElement('div');
  bannerContents.classList.add('banner-contents');
  makeLinksRelative(block);
  block.querySelectorAll('a').forEach(async (a) => {
    if (a && a.href) {
      // content wrapper
      const bannerContent = document.createElement('div');
      bannerContent.classList.add('content-wrapper');

      // get response from the URL
      const { href, origin } = new URL(a);
      const response = await fetch(`${href?.replace(/\.html$/, '')}.plain.html`);
      if (response.ok) {
        const responseEl = document.createElement('div');
        responseEl.innerHTML = await response.text();
        block.classList.add('is-loaded');

        // creating banner image and text div.
        const bannerImage = document.createElement('div');
        const bannerText = document.createElement('div');
        bannerImage.classList.add('banner-image');
        bannerText.classList.add('banner-text');

        // banner image content
        const picture = responseEl.querySelector('picture');
        const source = picture.querySelector('source');
        const img = picture.querySelector('img');
        source.srcset = origin + source.srcset.slice(1);
        img.src = origin + new URL(img.src).pathname;
        bannerImage.append(picture);

        // banner text content
        normalizeHeadings(responseEl, ['h3']);
        const link = responseEl.querySelector('a');
        link.classList.add('cta-link');
        bannerText.append(responseEl);

        // appending DOM objects
        bannerContent.append(bannerImage);
        bannerContent.append(bannerText);
        bannerContents.append(bannerContent);
        block.innerHTML = '';
        block.append(bannerContents);
      } else {
        block.remove();
      }
    }
  });
}
