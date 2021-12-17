export default async function decorate($block) {
    const picture = $block.querySelector('picture');
    const h1 = $block.querySelector('h1');
    if (picture && h1) {
        const attribution = document.createElement('div');
        attribution.classList.add('attribution');
        
        let nextEl = picture.parentNode.nextElementSibling;
        while (nextEl && nextEl !== h1) {
            const currentEl = nextEl;
            nextEl = nextEl.nextElementSibling;
            attribution.appendChild(currentEl);
        }
        h1.closest('div').appendChild(attribution);
    }
    
}