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

async function decorateFeaturedArticle(featuredArticleEl, articlePath) {
  const article = await getBlogArticle(articlePath);
  const {
    title, description, image, category,
  } = article;

  const path = article.path.split('.')[0];

  const imagePath = image.split('?')[0].split('_')[1];
  const imageSrcDesktop = getOptimizedImageURL(`./media_${imagePath}?format=webply&optimize=medium&width=750`);
  const imageSrcMobile = getOptimizedImageURL(`./media_${imagePath}?format=webply&optimize=medium&width=750`);
  const pictureTag = `<picture>
    <source media="(max-width: 400px)" srcset="${imageSrcMobile}">
    <img loading="eager" src="${imageSrcDesktop}">
  </picture>`;
  const card = document.createElement('a');
  card.className = 'featured-article-card';
  card.href = path;
  card.innerHTML = `<div class="featured-article-card-image">
      ${pictureTag}
    </div>
    <div class="featured-article-card-body">
    <p class="featured-article-card-category">${category}</p>
    <h3>${title}</h3>
      <p>${description}</p>
    </div>`;
  featuredArticleEl.append(card);
}

export default function decorate(block) {
  const a = block.querySelector('a');
  block.innerHTML = '';
  if (a && a.href) {
    const path = new URL(a.href).pathname;
    decorateFeaturedArticle(block, path);
  }
}
