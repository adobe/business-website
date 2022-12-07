import {
  buildFigure,
  createOptimizedPicture,
  getRootPath,
  toClassName,
  loadAuthorTaxonomy,
  authorTaxonomy,
} from '../../scripts/scripts.js';

async function populateAuthorImg(imgContainer, url, name) {
  await loadAuthorTaxonomy();
  const authorURL = authorTaxonomy[name] || url;
  const resp = await fetch(`${authorURL}.plain.html`);
  const text = await resp.text();
  if (resp.status === 200) {
    const placeholder = document.createElement('div');
    placeholder.innerHTML = text;
    const placeholderImg = placeholder.querySelector('img');
    if (placeholderImg) {
      const src = new URL(placeholderImg.getAttribute('src'), new URL(authorURL));
      const picture = createOptimizedPicture(src, name, false, [{ width: 200 }]);
      imgContainer.append(picture);
      picture.querySelector('img').onerror = (e) => {
        // removing 404 img will reveal fallback background img
        e.srcElement.remove();
      };
    }
  }
}

export default async function decorateArticleHeader(blockEl, blockName, document) {
  const childrenEls = Array.from(blockEl.children);
  // category
  const categoryContainer = childrenEls[0];
  categoryContainer.classList.add('article-category');
  const category = categoryContainer.querySelector('p');
  const categoryA = document.createElement('a');
  categoryA.textContent = category.textContent.trim();
  categoryA.href = `${window.location.origin}${getRootPath()}/tags/${toClassName(category.textContent.trim())}`;
  category.innerHTML = '';
  category.append(categoryA);
  // title
  const titleContainer = childrenEls[1];
  titleContainer.classList.add('article-title');
  // byline
  const bylineContainer = childrenEls[2];
  bylineContainer.classList.add('article-byline');
  bylineContainer.firstElementChild.classList.add('article-byline-info');
  // author
  const author = bylineContainer.firstElementChild.firstElementChild;
  const authorURL = author.querySelector('a').href;
  const authorName = author.textContent.trim();
  author.textContent = authorName;
  author.classList.add('article-author');
  // publication date
  const date = bylineContainer.firstElementChild.lastElementChild;
  date.classList.add('article-date');
  // author img
  const authorImg = document.createElement('div');
  authorImg.classList = 'article-author-image';
  authorImg.style.backgroundImage = 'url(/blog/blocks/article-header/adobe-logo.svg)';
  bylineContainer.prepend(authorImg);
  populateAuthorImg(authorImg, authorURL, authorName);
  // feature img
  const featureImgContainer = childrenEls[3];
  featureImgContainer.classList.add('article-feature-image');
  const featureFigEl = buildFigure(featureImgContainer.firstElementChild);
  featureFigEl.classList.add('figure-feature');
  featureImgContainer.prepend(featureFigEl);
  featureImgContainer.lastElementChild.remove();
}
