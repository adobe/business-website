import {
  loadScript,
  getHelixEnv,
  debug,
  makeLinkRelative,
} from '../../scripts/scripts.js';

class Nav {
  constructor(body, el) {
    this.el = el;
    this.body = body;
    this.env = getHelixEnv();
    this.desktop = window.matchMedia('(min-width: 1200px)');
  }

  init = () => {
    console.log(this.el);
    console.log(typeof this.body);

    const json = JSON.parse(this.body.innerHTML);
    console.log(json.data);
    const data = json.data;

    const ul = document.createElement('ul');
    
    this.el.appendChild(ul);

    const nItems = {};
    let i = 0;
    data.map((item) => {
      Object.keys(item).forEach(key => {
        if(i++ < 4) {
          const li = document.createElement('li');
          li.innerText=item[key];
          ul.appendChild(li);
         }
         
         //nItems[item[key]] = []; 
        //else console.log(key, item[key]);

      })
      
    })

    console.log(nItems);
    
  }
}

async function fetchNav(url) {
  const resp = await fetch(`${window.location.href}${url}.json`);
  const html = await resp.text();
  return html;
}
  
export default async function init(blockEl) {
  const url = blockEl.getAttribute('data-nav-source');
  
  if (url) {
    const html = await fetchNav(url);
    if (html) {
      try {
        const parser = new DOMParser();
        const navDoc = parser.parseFromString(html, 'text/html');
        const nav = new Nav(navDoc.body, blockEl);
        nav.init();
      } catch {
        debug('Could not create global navigation.');
      }
    }
  }
}