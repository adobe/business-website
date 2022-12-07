export default function decorate($block) {
  // turn links into buttons
  $block.querySelectorAll(':scope a').forEach(($a) => {
    const $button = document.createElement('button');
    $button.title = $a.title || $a.textContent.trim();
    $button.textContent = $a.textContent.trim();
    $button.addEventListener('click', () => {
      window.location.href = $a.href;
    });
    $a.replaceWith($button);
  });
}
