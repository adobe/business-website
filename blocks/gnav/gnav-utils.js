/**
 * Create an element with ID, class, children, and attributes
 * @param {Object} props to create the element
 * @returns {HTMLElement} the element created
 */
export default function createTag({
  tag, className, id, html, attributes,
}) {
  const el = document.createElement(tag);
  if (id) { el.id = id; }
  if (className) { el.className = className; }
  if (html) {
    if (html instanceof HTMLElement) {
      el.append(html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      el.setAttribute(key, attributes[key]);
    });
  }
  return el;
}
