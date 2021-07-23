/**
 * Replace element type. ex) <p> -> <div>
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

/**
 * Getting HTML source from given URL
 * @param {String} url 
 * @returns String from response.text()
 */
export const getSourceFromURL = async (url) => {
    const response = await fetch(url);
    const text = await response.text();
    return text;
}
