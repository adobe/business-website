/**
 * Replace element type. ex) <p> -> <div>
 * @param {Element} $e The original element that subject to replace.
 * @param {string} type The nodeName to be set for $e.
 * @returns $n Updated Element
 */
 export const replaceElementType = ($e, type) => {
    // If they are same, no need to replace.
    if ($e === null || $e.nodeName === type.toUpperCase()) {
        return $e;
    }
    const $n = document.createElement(type);
    $n.innerHTML = $e.innerHTML;
    $e.parentNode.replaceChild($n, $e);
    // copy all attributes from $e to $n
    [...$e.attributes].forEach(attr => $n.setAttribute(attr.nodeName, attr.nodeValue));
    return $n;
}
