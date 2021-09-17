import {
  readBlockConfig,
  buildArticleCard,
  fetchBlogArticleIndex,
} from '../../scripts/scripts.js';

function isCardOnPage(article) {
  const path = article.path.split('.')[0];
  /* using recommended and featured articles */
  return !!document.querySelector(`.featured-article a.featured-article-card[href="${path}"], .recommended-articles a.article-card[href="${path}"]`);
}

async function filterArticles(config, locale) {
  if (!window.blogIndex) {
    window.blogIndex = await fetchBlogArticleIndex(locale);
  }
  const index = window.blogIndex;

  const result = [];

  /* filter posts by category, tag and author */
  const filters = {};
  Object.keys(config).forEach((key) => {
    const filterNames = ['tag', 'author', 'category'];
    if (filterNames.includes(key)) {
      const vals = config[key];
      let v = vals;
      if (!Array.isArray(vals)) {
        v = [vals];
      }
      filters[key] = v.map((e) => e.toLowerCase().trim());
    }
  });

  /* filter and ignore if already in result */
  const feed = index.data.filter((article) => {
    const matchedAll = Object.keys(filters).every((key) => {
      const matchedFilter = filters[key].some((val) => (article[key]
        && article[key].toLowerCase().includes(val)));
      return matchedFilter;
    });
    return (matchedAll && !result.includes(article) && !isCardOnPage(article));
  });
  return (feed);
}

async function decorateArticleFeed(articleFeedEl, config, offset = 0) {
  const articles = await filterArticles(config);

  let articleCards = articleFeedEl.querySelector('.article-cards');
  if (!articleCards) {
    articleCards = document.createElement('div');
    articleCards.className = 'article-cards';
    articleFeedEl.appendChild(articleCards);
  }
  const limit = 12;
  const pageEnd = offset + limit;
  const max = pageEnd > articles.length ? articles.length : pageEnd;
  for (let i = offset; i < max; i += 1) {
    const article = articles[i];
    const card = buildArticleCard(article, 'article');

    articleCards.append(card);
  }
  if (articles.length > pageEnd) {
    const loadMore = document.createElement('a');
    loadMore.className = 'load-more button secondary';
    loadMore.href = '#';
    loadMore.innerHTML = 'Load more articles';
    articleFeedEl.append(loadMore);
    loadMore.addEventListener('click', (event) => {
      event.preventDefault();
      loadMore.remove();
      decorateArticleFeed(articleFeedEl, config, pageEnd);
    });
  }
  articleFeedEl.classList.add('appear');
}

export default function decorate(block) {
  const config = readBlockConfig(block);
  block.innerHTML = '';
  decorateArticleFeed(block, config);
}
