import { createTag } from '../block-helpers.js';

export default function decorate($block) {
  const url = new URL(window.location.href);
  const baseUrl = `${url.origin}${url.pathname}#`;
  const $list = createTag('ol', { }, null);
  const $content = $block.querySelector('ul');
  const $headers = document.querySelectorAll('h1, h2, h3, h4, h5');

  Array.from($content.children).forEach(($tab) => {
    const $anchor = createTag('a', {}, null);
    let target;

    if ($tab.textContent === 'Introduction') {
      $anchor.href = `${baseUrl}introduction`;
      $anchor.textContent = 'Introduction';
      target = $block.parentElement.parentElement.previousElementSibling;
    } else {
      $headers.forEach(($header) => {
        if ($tab.textContent === $header.textContent) {
          $anchor.href = `${baseUrl}${$header.id}`;
          $anchor.textContent = $tab.textContent;
          target = $header;
        }
      });
    }

    if (target) {
      $tab.innerHTML = '';
      $tab.append($anchor);
      $list.append($tab);
      target.classList.add('--with-scroll-margin-top');
    } else {
      $tab.remove();
    }
  });

  $content.after($list);
  $content.remove();
}
