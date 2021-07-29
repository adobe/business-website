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
/* global */
/* eslint-disable import/named, import/extensions */

import {
  getOptimizedImageURL,
  getBlogArticle,
} from '../../scripts/scripts.js';

async function decorateRecommendedArticles(recommendedArticlesEl, paths) {
  for (let i = 0; i < paths.length; i += 1) {
    const articlePath = paths[i];
    // eslint-disable-next-line no-await-in-loop
    const article = await getBlogArticle(articlePath);
    const {
      title, description, image, category,
    } = article;

    const path = article.path.split('.')[0];

    const imagePath = image.split('?')[0].split('_')[1];
    const imageSrcDesktop = getOptimizedImageURL(`./media_${imagePath}?format=webply&optimize=medium&width=2000`);
    const imageSrcMobile = getOptimizedImageURL(`./media_${imagePath}?format=webply&optimize=medium&width=2000`);
    const pictureTag = `<picture>
      <source media="(max-width: 400px)" srcset="${imageSrcMobile}">
      <img src="${imageSrcDesktop}">
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
    recommendedArticlesEl.append(card);
  }
}

export default function decorate(block) {
  const anchors = [...block.querySelectorAll('a')];
  block.innerHTML = '';
  const paths = anchors.map((a) => new URL(a.href).pathname);
  decorateRecommendedArticles(block, paths);
}
