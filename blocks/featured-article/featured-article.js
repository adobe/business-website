/* eslint-disable import/named, import/extensions */

import {
  buildArticleCard,
  getBlogArticle,
} from '../../scripts/scripts.js';

async function decorateFeaturedArticle(featuredArticleEl, articlePath, callback) {
  const article = await getBlogArticle(articlePath);
  const card = buildArticleCard(article, 'featured-article');
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
