import {
  buildArticleCard,
  getBlogArticle,
  fetchPlaceholders,
  rewritePath,
} from '../../scripts/scripts.js';

async function decorateRecommendedArticles(recommendedArticlesEl, paths) {
  if (recommendedArticlesEl.classList.contains('small')) {
    recommendedArticlesEl.closest('.recommended-articles-small-container').querySelectorAll('a').forEach((aEl) => {
      aEl.classList.add('button', 'primary', 'small', 'light');
    });
    recommendedArticlesEl.parentNode.classList.add('recommended-articles-small-content-wrapper');
  } else {
    const title = document.createElement('h3');
    const placeholders = await fetchPlaceholders();
    title.textContent = placeholders['recommended-for-you'];
    recommendedArticlesEl.prepend(title);
  }
  const articleCardsContainer = document.createElement('div');
  articleCardsContainer.className = 'article-cards';
  for (let i = 0; i < paths.length; i += 1) {
    const articlePath = rewritePath(paths[i]);
    // eslint-disable-next-line no-await-in-loop
    const article = await getBlogArticle(articlePath);
    if (article) {
      const card = buildArticleCard(article);
      articleCardsContainer.append(card);
      recommendedArticlesEl.append(articleCardsContainer);
    }
  }
  recommendedArticlesEl.closest('.section').classList.add('appear');
  if (!articleCardsContainer.hasChildNodes()) {
    recommendedArticlesEl.parentNode.parentNode.remove();
  }
}

export default async function decorate(blockEl) {
  const anchors = [...blockEl.querySelectorAll('a')];
  blockEl.innerHTML = '';
  const urls = anchors.map((a) => new URL(a.href));
  const paths = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const url of urls) {
    if (url.host === 'blog.adobe.com') {
      // eslint-disable-next-line no-await-in-loop
      const res = await fetch(url.href);
      paths.push(new URL(res.url).pathname);
    } else {
      paths.push(url.pathname);
    }
  }
  await decorateRecommendedArticles(blockEl, paths);
}
