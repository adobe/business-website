export default function decorate(block) {
  const originalBlock = document.createElement('div');
  originalBlock.innerHTML = block.innerHTML;
  block.closest('.section-wrapper').classList.add('marquee-container');
  const bgImg = block.querySelector('div:first-child > div:first-child > picture img');
  const marqueeContents = document.createElement('div');
  const textContent = document.createElement('div');
  const imageContent = document.createElement('div');
  marqueeContents.classList.add('marquee-content-wrapper');
  textContent.classList.add('text-content');
  imageContent.classList.add('image-content');
  const theme = block.classList.contains('dark') ? 'dark' : 'light';
  
  // for background image
  if (bgImg) {
    block.style.backgroundImage = `url(${bgImg.src})`;
  }

  // for text content
  const title = block.querySelector('h2');
  const body = block.querySelector('h2 + p');
  const detail = title.closest('div').querySelector('*');
  title.classList.add('title');
  if (detail.nodeName !== 'H2') {
    detail.classList.add('detail');
    textContent.appendChild(detail);
  }
  // for cta
  const linkWrapper = document.createElement('div')
  linkWrapper.classList.add('link-wrapper')
  const primaryCTAs = block.querySelectorAll('strong a');
  primaryCTAs.forEach((link) => {
    link.classList.add('button', 'primary', theme);
    linkWrapper.appendChild(link);
  });
  const secondaryCTAs = block.querySelectorAll('em a');
  secondaryCTAs.forEach((link) => {
    link.classList.add('button', 'secondary', theme);
    linkWrapper.appendChild(link);
  });
  const otherCTAs = block.querySelectorAll('a');
  otherCTAs.forEach((link) => {
    link.classList.add('button', theme);
    linkWrapper.appendChild(link);
  });

  // for optional subject image
  const subjectImg = block.querySelector('div:nth-child(2) > div:nth-child(2) > picture img');
  if (subjectImg) {
    imageContent.appendChild(subjectImg);
  }

  // text content appending
  textContent.appendChild(title);
  textContent.appendChild(body)
  textContent.appendChild(linkWrapper);
  
  // for seperator
  const hr = block.querySelector('hr');
  if(hr) {
    textContent.appendChild(hr);  
  }

  // wraping up appending
  marqueeContents.appendChild(textContent);
  if (subjectImg) {
    marqueeContents.appendChild(imageContent);
  }
  block.innerHTML = marqueeContents.outerHTML;
}
