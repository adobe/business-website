export default function decorateTagHeader(blockEl) {
  const img = blockEl.querySelector('img');
  const imgSrc = img.getAttribute('src');
  blockEl.parentElement.parentElement.style.backgroundImage = `url('${imgSrc}')`;
  img.closest('p').remove();
}
