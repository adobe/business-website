/* eslint-disable import/named, import/extensions */

import {
  createOptimizedPicture,
  getBlogArticle,
} from '../../scripts/scripts.js';

async function decorateFeaturedArticle(featuredArticleEl, articlePath, callback) {
  const article = await getBlogArticle(articlePath);
  const {
    title, description, image, category,
  } = article;

  const path = article.path.split('.')[0];

  const picture = createOptimizedPicture(image, title, true, [{ width: '750' }]);
  const pictureTag = picture.outerHTML;

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
  const tagHeader = document.querySelector('.tag-header-container > div');
  if (tagHeader) {
    featuredArticleEl.append(card);
    tagHeader.append(featuredArticleEl);
  } else {
    featuredArticleEl.append(card);
  }
  if (callback) callback();
}

export default function decorate(block, blockName, document, callback) {
  const a = block.querySelector('a');
  block.innerHTML = '';
  if (a && a.href) {
    const path = new URL(a.href).pathname;
    decorateFeaturedArticle(block, path, callback);
  }
}
