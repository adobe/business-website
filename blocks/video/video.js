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
// eslint-disable-next-line no-redeclare
/* global window */
/* eslint-disable import/named, import/extensions */

import { buildFigure } from '../../scripts/scripts.js';

const loadVideo = ($block) => {
  if ($block.classList.contains('is-loaded')) {
    return;
  }
  const poster = $block.querySelector('img') ? `poster="${$block.querySelector('img').src}"` : '';
  const $a = $block.querySelector('a');
  const videoSrc = $a.href;
  const $video = document.createElement('div');
  const $figure = buildFigure($block.firstChild.firstChild);
  $video.classList.add('video-wrapper');
  $video.innerHTML = `<video controls preload="none" ${poster}><source src="${videoSrc}" type="video/mp4"></video>`;
  $block.innerHTML = '<figure class="figure"></figure>';
  $block.firstChild.prepend($video);
  $block.firstChild.append($figure.querySelector('figcaption'));
  $block.classList.add('is-loaded');
};

const intersectHandler = (entries) => {
  const entry = entries[0];
  if (entry.isIntersecting) {
    if (entry.intersectionRatio >= 0.25) {
      const $block = entry.target;
      loadVideo($block);
    }
  } else {
    // if ((entry.intersectionRatio === 0.0) && (adBox.dataset.totalViewTime >= 60000)) {
    // Error handler placeholder
    // }
  }
};

export default function decorate($block) {
  window.addEventListener('load', () => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: [0.0, 0.25],
    };
    const observer = new IntersectionObserver(intersectHandler, options);
    observer.observe($block);
  });
}
