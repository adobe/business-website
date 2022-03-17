import {
  getRootPath,
} from '../../scripts/scripts.js';

/**
 * Checks if a given match intersects with an existing match
 * before adding it to the list of matches. In case of an
 * intersection, the more specific (i.e. longer) match wins.
 * @param {array} matches The existing matches
 * @param {object} contender The match to check and add
 * @param {number} maxMatches The maximum number of matches
 */
export function checkAndAddMatch(matches, contender, maxMatches) {
  const collisions = matches
    // check for intersections
    .filter((match) => {
      if (contender.end < match.start || contender.start > match.end) {
        // no intersection with existing match
        return false;
      }
      // contender starts or ends within existing match
      return true;
    });
  if (collisions.length === 0 && matches.length < maxMatches) {
    // no intersecting existing matches, add contender if max not yet reached
    matches.push(contender);
  }
}

/**
 * Loops through a list of keywords and looks for matches in the article text.
 * The first occurrence of each keyword will be replaced with a link.
 */
export default async function interlink() {
  const articleBody = document.querySelector('main');
  const resp = await fetch(`${getRootPath()}/keywords.json`);
  if (articleBody && resp.ok) {
    const json = await resp.json();
    const articleText = articleBody.textContent.toLowerCase();
    // set article link limit: 1 every 100 words
    const articleLinks = articleBody.querySelectorAll('a').length;
    const articleWords = articleText.split(/\s/).length;
    const maxLinks = (Math.floor(articleWords / 100)) - articleLinks;
    // eslint-disable-next-line no-useless-return
    if (maxLinks <= 0) return;
    const keywords = (Array.isArray(json) ? json : json.data)
      // scan article to filter keywords down to relevant ones
      .filter(({ Keyword }) => articleText.indexOf(Keyword.toLowerCase()) !== -1)
      // sort matches by length descending
      .sort((a, b) => b.Keyword.length - a.Keyword.length)
      // prepare regexps
      .map((item) => ({
        regexp: new RegExp(`\\b(${item.Keyword.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')})\\b`, 'iu'),
        ...item,
      }));
    // eslint-disable-next-line no-useless-return
    if (keywords.length === 0) return;
    // find exact text node matches and insert links
    articleBody
      .querySelectorAll('div > p:not([class])')
      .forEach((p) => {
        // set paragraph link limit: 1 every 40 words
        const paraLinks = p.querySelectorAll('a').length;
        const paraWords = p.textContent.split(/\s/).length;
        const maxParaLinks = Math.floor(paraWords / 40) - paraLinks;
        if (maxParaLinks > 0) {
          Array.from(p.childNodes)
          // filter out non text nodes
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .forEach((textNode) => {
              const matches = [];
              // find case-insensitive matches inside text node
              keywords.forEach((item) => {
                const match = item.regexp.exec(textNode.nodeValue);
                if (match) {
                  checkAndAddMatch(matches, {
                    item,
                    start: match.index,
                    end: match.index + item.Keyword.length,
                  }, maxParaLinks);
                }
              });
              matches
              // sort matches by start index descending
                .sort((a, b) => b.start - a.start)
              // split text node and insert link with matched text
                .forEach(({ item, start, end }) => {
                  const text = textNode.nodeValue;
                  const a = document.createElement('a');
                  a.title = item.Keyword;
                  a.href = item.URL;
                  a.setAttribute('data-origin', 'interlink');
                  a.appendChild(document.createTextNode(text.substring(start, end)));
                  p.insertBefore(a, textNode.nextSibling);
                  p.insertBefore(document.createTextNode(text.substring(end)), a.nextSibling);
                  textNode.nodeValue = text.substring(0, start);
                  // remove matched link from interlinks
                  keywords.splice(keywords.indexOf(item), 1);
                });
            });
        }
      });
  }
}

interlink();
