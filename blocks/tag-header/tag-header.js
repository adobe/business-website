export default function decorateTagHeader(blockEl) {
  const img = blockEl.querySelector('img');
  const imgSrc = img.currentSrc;
  blockEl.parentElement.parentElement.style.backgroundImage = `url('${imgSrc}')`;
  img.closest('p').remove();
}
