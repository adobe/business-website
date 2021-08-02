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
/* global fetch */

import {
  buildFigure,
  getOptimizedImageURL,
} from '../../scripts/scripts.js';

async function populateAuthorImg(imgEl, url, name) {
  const resp = await fetch(`${url}.plain.html`);
  const text = await resp.text();
  if (resp.status === 200) {
    const placeholder = document.createElement('div');
    placeholder.innerHTML = text;
    const placeholderImg = placeholder.querySelector('img');
    const src = placeholderImg.src.replace('width=2000', 'width=200');
    imgEl.src = getOptimizedImageURL(src);
    imgEl.alt = name;
    imgEl.onerror = () => {
      imgEl.src = '/blocks/gnav/adobe-logo.svg';
      imgEl.removeAttribute('alt');
    };
  }
}

export default function decorateArticleHeader(blockEl) {
  const childrenEls = Array.from(blockEl.children);
  // category
  const categoryContainer = childrenEls[0];
  categoryContainer.classList.add('article-category');
  // title
  const titleContainer = childrenEls[1];
  titleContainer.classList.add('article-title');
  // byline
  const bylineContainer = childrenEls[2];
  bylineContainer.classList.add('article-byline');
  bylineContainer.firstChild.classList.add('article-byline-info');
  // author
  const author = bylineContainer.firstChild.firstChild;
  const authorURL = author.querySelector('a').href;
  const authorName = author.textContent;
  author.textContent = authorName;
  author.classList.add('article-author');
  // publication date
  const date = bylineContainer.firstChild.lastChild;
  date.classList.add('article-date');
  // author img
  const authorImg = document.createElement('img');
  authorImg.classList.add('article-author-image');
  authorImg.src = '/blocks/gnav/adobe-logo.svg';
  bylineContainer.prepend(authorImg);
  populateAuthorImg(authorImg, authorURL, authorName);
  // feature img
  const featureImgContainer = childrenEls[3];
  featureImgContainer.classList.add('article-feature-image');
  const featureFigEl = buildFigure(featureImgContainer.firstChild);
  featureFigEl.classList.add('figure-feature');
  featureImgContainer.prepend(featureFigEl);
  featureImgContainer.lastChild.remove();
}
