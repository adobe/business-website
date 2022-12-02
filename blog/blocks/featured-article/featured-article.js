/* eslint-disable import/named, import/extensions */

import {
  buildArticleCard,
  getBlogArticle,
  rewritePath,
} from '../../../scripts/scripts.js';

async function decorateFeaturedArticle(featuredArticleEl, articlePath) {
  const article = await getBlogArticle(articlePath);
  if (article) {
    const card = buildArticleCard(article, 'featured-article');
    const tagHeader = document.querySelector('.tag-header-container > div');
    if (tagHeader) {
      featuredArticleEl.append(card);
      tagHeader.append(featuredArticleEl);
    } else {
      featuredArticleEl.append(card);
    }
    featuredArticleEl.classList.add('loaded');
  } else {
    const { origin } = new URL(window.location.href);
    // eslint-disable-next-line no-console
    console.warn(`Featured article does not exist or is missing in index: ${origin}${articlePath}`);
  }
}

export default async function decorate(block, blockName, document, callback) {
  const a = block.querySelector('a');
  block.innerHTML = '';
  if (a && a.href) {
    const path = rewritePath(new URL(a.href).pathname);
    await decorateFeaturedArticle(block, path, callback);
  }
}
