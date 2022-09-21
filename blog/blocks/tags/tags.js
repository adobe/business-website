import {
  toClassName,
  loadTaxonomy,
} from '../../scripts/scripts.js';

export default function decorateTags(blockEl) {
  const tags = blockEl.textContent.split(', ');
  const container = blockEl.querySelector('p');
  container.classList.add('tags-container');
  container.textContent = '';
  tags.forEach((tag) => {
    const a = document.createElement('a');
    let tagname = '';
    toClassName(tag).split('-').forEach((e, i) => {
      if (e) {
        tagname += `${i ? '-' : ''}${e}`;
      }
    });
    a.setAttribute('href', `../tags/${tagname}`);
    a.textContent = tag;
    a.classList.add('button');
    container.append(a);
    if (tagname === 'fpost') {
      a.remove();
    }
  });
  const taxElements = document.querySelectorAll('.tags a');
  loadTaxonomy(taxElements);
}
