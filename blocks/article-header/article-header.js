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
  authorImg.classList = 'article-author-image';
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
