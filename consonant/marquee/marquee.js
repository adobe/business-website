function decorateButtons(el) {
  const buttons = el.querySelectorAll('em a, strong a');
  buttons.forEach((button) => {
    const parent = button.parentElement;
    const buttonType = parent.nodeName === 'STRONG' ? 'blue' : 'outline';
    button.classList.add('con-button', buttonType);
    parent.insertAdjacentElement('afterend', button);
    parent.remove();
  });
  if (buttons.length > 0) {
    buttons[0].closest('p').classList.add('action-area');
  }
}

function decorateText(el) {
  const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const title = headings[headings.length - 1];
  title.classList.add('heading-XL');
  title.nextElementSibling.classList.add('body-M');
  if (headings.length > 1) {
    headings[0].classList.add('detail-M');
  }
}

export default function init(el) {
  const children = el.querySelectorAll(':scope > div');
  const foreground = children[children.length - 1];
  if (children.length > 1) {
    children[0].classList.add('background');
  }
  foreground.classList.add('foreground', 'container');
  const text = foreground.querySelector('h1, h2, h3, h4, h5, h6').closest('div');
  text.classList.add('text');
  const image = foreground.querySelector(':scope > div:not([class])');
  if (image) {
    image.classList.add('image');
  }
  decorateButtons(text);
  decorateText(text);
}
