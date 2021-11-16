import {
  toClassName,
} from '../../scripts/scripts.js';

export default function decorateTags(blockEl) {
  const tags = blockEl.textContent.split(', ');
  const container = blockEl.querySelector('p');
  container.classList.add('tags-container');
  container.textContent = '';
  tags.forEach((tag) => {
    const a = document.createElement('a');
    a.setAttribute('href', `../tags/${toClassName(tag)}`);
    a.textContent = tag;
    a.classList.add('button');
    container.append(a);
  });
}
