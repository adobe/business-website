export default function decorate($block) {
    $block.querySelectorAll('p').forEach(($p) => {       
        // Quote <p> to <h2>
        if ($p.innerHTML.startsWith('“') && $p.innerHTML.endsWith('”')) {
            replaceElementType($p, 'blockquote');
        }
    });
}

/**
 * This is a helper function that could be reusable for other blocks.
 * @param {Element} $e The original element that subject to replace.
 * @param {string} type The nodeName to be set for $e.
 * @returns $n Updated Element
 */
export const replaceElementType = ($e, type) => {
    // If they are same, no need to replace.
    if ($e.nodeName === type.toUpperCase()) {
        return $e;
    }
    const $n = document.createElement(type);
    $n.innerHTML = $e.innerHTML;
    $e.parentNode.replaceChild($n, $e);
    return $n;
}