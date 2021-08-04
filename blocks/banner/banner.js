import {
  normalizeHeadings,
} from '../../scripts/scripts.js';

export default function decorate($block) {
  const $bannerContents = document.createElement('div');
  $bannerContents.classList.add('banner-contents');
  $block.querySelectorAll('a').forEach(async ($a) => {
    if ($a && $a.href) {
      // content wrapper
      const $bannerContent = document.createElement('div');
      $bannerContent.classList.add('content-wrapper');

      // get response from the href URL
      const response = await fetch(`${$a.href}.plain.html`);
      const $response = document.createElement('div');
      $response.innerHTML = await response.text();
      $block.classList.add('is-loaded');

      // creating banner image and text div.
      const $bannerImage = document.createElement('div');
      const $bannerText = document.createElement('div');
      $bannerImage.classList.add('banner-image');
      $bannerText.classList.add('banner-text');

      // banner image content
      const $picture = $response.querySelector('picture');
      $bannerImage.append($picture);

      // banner text content
      normalizeHeadings($response, ['h3']);
      const $link = $response.querySelector('a');
      $link.classList.add('cta-link');
      $bannerText.append($response);

      // appending DOM objects
      $bannerContent.append($bannerImage);
      $bannerContent.append($bannerText);
      $bannerContents.append($bannerContent);
    }
  });
  $block.innerHTML = '';
  $block.append($bannerContents);
}
