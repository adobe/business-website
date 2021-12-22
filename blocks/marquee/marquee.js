export default async function decorate($block) {
  const [hero, callout] = [...$block.children];
  if (hero) {
    hero.classList.add('marquee-hero');
    const picture = hero.querySelector('picture');
    const h1 = hero.querySelector('h1');
    if (picture && h1) {
      // const image = picture.querySelector('img');
      /* const newPicture = createOptimizedPicture(image.src, image.altText, false,
       [{ media: '(min-width: 400px)', width: '2000' },
        { width: '750', suffix: '&crop=9:16,offset-x86' }]);
        */
      const attribution = document.createElement('div');
      attribution.classList.add('attribution');
      let nextEl = picture.parentNode.nextElementSibling;
      while (nextEl && nextEl !== h1) {
        const currentEl = nextEl;
        nextEl = nextEl.nextElementSibling;
        attribution.appendChild(currentEl);
      }
      // picture.parentNode.replaceChild(newPicture, picture);
      h1.closest('div').appendChild(attribution);
    }
  }

  if (callout) {
    callout.classList.add('marquee-callout');
    const button = callout.querySelector('.button');
    button.classList.remove('accent');
    button.classList.add('secondary', 'small', 'light');
  }
}
