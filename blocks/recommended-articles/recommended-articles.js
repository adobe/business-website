import {
  createOptimizedPicture,
  getBlogArticle,
  fetchVariables,
} from '../../scripts/scripts.js';

async function decorateRecommendedArticles(recommendedArticlesEl, paths) {
  if (recommendedArticlesEl.classList.contains('small')) {
    recommendedArticlesEl.parentNode.querySelectorAll('a').forEach((aEl) => {
      aEl.classList.add('button', 'small', 'action', 'light');
    });
    recommendedArticlesEl.parentNode.classList.add('recommended-articles-small-content-wrapper');
  } else {
    const title = document.createElement('h3');
    const vars = await fetchVariables();
    title.textContent = vars['recommended-for-you'];
    recommendedArticlesEl.prepend(title);
  }
  const articleCardsContainer = document.createElement('div');
  articleCardsContainer.className = 'article-cards';
  for (let i = 0; i < paths.length; i += 1) {
    const articlePath = paths[i];
    // eslint-disable-next-line no-await-in-loop
    const article = await getBlogArticle(articlePath);
    const {
      title, description, image, category,
    } = article;

    const path = article.path.split('.')[0];

    const picture = createOptimizedPicture(image, title, false, [{ width: '750' }]);
    const pictureTag = picture.outerHTML;
    const card = document.createElement('a');
    card.className = 'article-card';
    card.href = path;
    card.innerHTML = `<div class="article-card-image">
        ${pictureTag}
      </div>
      <div class="article-card-body">
        <p class="article-card-category">
          <a href="${window.location.origin}/blog/categories/${category}">${category}</a>
        </p>
        <h3>${title}</h3>
        <p>${description}</p>
      </div>`;
    articleCardsContainer.append(card);
    recommendedArticlesEl.append(articleCardsContainer);
  }
}

export default function decorate(blockEl) {
  const anchors = [...blockEl.querySelectorAll('a')];
  blockEl.innerHTML = '';
  const paths = anchors.map((a) => new URL(a.href).pathname);
  decorateRecommendedArticles(blockEl, paths);
}
