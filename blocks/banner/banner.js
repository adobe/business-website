import {
    getSourceFromURL,
    replaceElementType,
} from '../block-helpers.js';

export default function decorate($block) {
    $block.querySelectorAll('a').forEach(async ($a) => {
        if ($a && $a.href) {
            const body = await getSourceFromURL(`${$a.href}.plain.html`);
            $block.innerHTML = body;
            $block.classList.add('is-loaded');
            const $pictureParent = $block.querySelector('picture').parentElement;
            $block.prepend($pictureParent);
            replaceElementType($pictureParent, 'div');
        }
    });
}
