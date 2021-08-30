export default function decorateTags(blockEl) {
  console.log('hi from decorate tags');
  const tags = blockEl.textContent.split(', ');
  const container = blockEl.querySelector('p');
  container.classList.add('tags-container');
  container.textContent = '';
  tags.forEach((tag) => {
    const a = document.createElement('a');
    a.setAttribute('href', `../tags/${tag.toLowerCase().replace(' ', '-')}`);
    a.textContent = tag;
    a.classList.add('button');
    console.log(a);
    container.append(a);
  });
}
