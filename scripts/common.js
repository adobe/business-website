/**
 * Creates a tag with the given name and attributes.
 * @param {string} name The tag name
 * @param {object} attrs An object containing the attributes
 * @returns The new tag
 */
export const createTag = (name, attrs) => {
    const el = document.createElement(name);
    if (typeof attrs === 'object') {
        for (let [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
        }
    }
    return el;
}

export const loadScript = (url, callback, type, appendTo = 'head') => {
    const $appendTo = document.querySelector(appendTo);
    const $script = createTag('script', { src: url });
    if (type) {
      $script.setAttribute('type', type);
    }
    $appendTo.append($script);
    $script.onload = callback;
    return $script;
};