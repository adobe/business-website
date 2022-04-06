function decorateButtons(el) {
  const buttons = el.querySelectorAll('em a, strong a, p > a');
  buttons.forEach((button) => {
    button.setAttribute('target', '_blank');
    const parent = button.parentElement;
    let buttonType;
    if (parent.nodeName === 'STRONG') {
      buttonType = ['button', 'blue'];
    } else if (parent.nodeName === 'EM') {
      buttonType = ['button', 'primary'];
    } else {
      buttonType = ['cta-link'];
    }
    button.classList.add(...buttonType);
    if (parent.nodeName !== 'P') {
      parent.insertAdjacentElement('afterend', button);
      parent.remove();
    }
  });
  if (buttons.length > 0) {
    buttons[0].closest('p').classList.add('action-area');
  }
}

export default function init(block) {
  block.closest('.section').classList.add('banner-cta-container');
  const children = block.querySelectorAll(':scope > div');
  const foreground = children[children.length - 1];
  if (children.length > 1) {
    children[0].classList.add('background');
  }
  foreground.classList.add('foreground', 'container');
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.classList.add('heading');
  }
  decorateButtons(foreground.querySelector(':scope > div'));
}
