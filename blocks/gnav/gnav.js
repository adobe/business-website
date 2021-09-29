import {
  createEl,
  loadScript,
  getHelixEnv,
  debug,
} from '../../scripts/scripts.js';

const BRAND_IMG = '<img loading="lazy" alt="Adobe" src="/blocks/gnav/adobe-logo.svg">';
const SEARCH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false">
<path d="M14 2A8 8 0 0 0 7.4 14.5L2.4 19.4a1.5 1.5 0 0 0 2.1 2.1L9.5 16.6A8 8 0 1 0 14 2Zm0 14.1A6.1 6.1 0 1 1 20.1 10 6.1 6.1 0 0 1 14 16.1Z"></path>
</svg>`;
const IS_OPEN = 'is-Open';
class Gnav {
  constructor(body, el) {
    this.el = el;
    this.body = body;
    this.env = getHelixEnv();
  }

  init = () => {
    this.state = {};
    this.curtain = createEl({ tag: 'div', className: 'gnav-curtain' });
    const nav = createEl({ tag: 'nav', className: 'gnav' });

    const mobileToggle = this.decorateToggle();
    nav.append(mobileToggle);

    const brand = this.decorateBrand();
    if (brand) {
      nav.append(brand);
    }

    const mainNav = this.decorateMainNav();
    if (mainNav) {
      nav.append(mainNav);
    }

    const search = this.decorateSearch();
    if (search) {
      nav.append(search);
    }

    const profile = this.decorateProfile();
    if (profile) {
      nav.append(profile);
    }

    const logo = this.decorateLogo();
    if (logo) {
      nav.append(logo);
    }

    const wrapper = createEl({ tag: 'div', className: 'gnav-wrapper', html: nav });
    this.el.append(this.curtain, wrapper);
  }

  decorateToggle = () => {
    const toggle = createEl({
      tag: 'button',
      className: 'gnav-toggle',
      attributes: {
        'aria-label': 'Navigation menu',
        'aria-expanded': false,
      },
    });
    toggle.addEventListener('click', async () => {
      toggle.parentElement.classList.toggle(IS_OPEN);
      if (!this.onSearchInput) {
        const gnavSearch = await import('./gnav-search.js');
        this.onSearchInput = gnavSearch.default;
      }
    });
    return toggle;
  }

  decorateBrand = () => {
    const brandBlock = this.body.querySelector('[class^="gnav-brand"]');
    if (!brandBlock) return null;
    const brand = brandBlock.querySelector('a');

    const { className } = brandBlock;
    const classNameClipped = className.slice(0, -1);
    const classNames = classNameClipped.split('--');
    brand.className = classNames.join(' ');
    if (brand.classList.contains('with-logo')) {
      brand.insertAdjacentHTML('afterbegin', BRAND_IMG);
    }
    return brand;
  }

  decorateLogo = () => {
    const logo = this.body.querySelector('.adobe-logo a');
    logo.classList.add('gnav-logo');
    logo.setAttribute('aria-label', logo.textContent);
    logo.textContent = '';
    logo.insertAdjacentHTML('afterbegin', BRAND_IMG);
    return logo;
  }

  decorateMainNav = () => {
    const mainLinks = this.body.querySelectorAll('h2 > a');
    if (mainLinks.length > 0) {
      return this.buildMainNav(mainLinks);
    }
    return null;
  }

  buildMainNav = (navLinks) => {
    const mainNav = createEl({ tag: 'div', className: 'gnav-mainnav' });
    navLinks.forEach((navLink, idx) => {
      const navItem = createEl({ tag: 'div', className: 'gnav-navitem' });

      const menu = navLink.closest('div');
      menu.querySelector('h2').remove();
      navItem.appendChild(navLink);

      if (menu.childElementCount > 0) {
        const id = `navmenu-${idx}`;
        menu.id = id;
        navItem.classList.add('has-Menu');
        navLink.setAttribute('role', 'button');
        navLink.setAttribute('aria-expanded', false);
        navLink.setAttribute('aria-controls', id);

        const decoratedMenu = this.decorateMenu(navItem, navLink, menu);
        navItem.appendChild(decoratedMenu);
      }
      mainNav.appendChild(navItem);
    });
    return mainNav;
  }

  decorateMenu = (navItem, navLink, menu) => {
    menu.className = 'gnav-navitem-menu';
    const childCount = menu.childElementCount;
    if (childCount === 1) {
      menu.classList.add('small-Variant');
    } else if (childCount === 2) {
      menu.classList.add('medium-Variant');
    } else if (childCount >= 3) {
      menu.classList.add('large-Variant');
    }
    navLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleMenu(navItem);
    });
    return menu;
  }

  decorateSearch = () => {
    const searchBlock = this.body.querySelector('.search');
    if (searchBlock) {
      const label = searchBlock.querySelector('p').textContent;
      const advancedLink = searchBlock.querySelector('a');
      const searchEl = createEl({ tag: 'div', className: 'gnav-search' });
      const searchBar = this.decorateSearchBar(label, advancedLink);
      const searchButton = createEl({
        tag: 'button', className: 'gnav-search-button', html: SEARCH_ICON, attributes: { 'aria-label': label },
      });

      searchButton.addEventListener('click', async () => {
        if (!this.onSearchInput) {
          const gnavSearch = await import('./gnav-search.js');
          this.onSearchInput = gnavSearch.default;
        }
        this.toggleMenu(searchEl);
      });
      searchEl.append(searchButton, searchBar);
      return searchEl;
    }
    return null;
  }

  decorateSearchBar = (label, advancedLink) => {
    const searchBar = createEl({ tag: 'aside', className: 'gnav-search-bar' });
    const searchField = createEl({ tag: 'div', className: 'gnav-search-field', html: SEARCH_ICON });
    const searchInput = createEl({ tag: 'input', className: 'gnav-search-input', attributes: { placeholder: label } });
    const searchResults = createEl({ tag: 'div', className: 'gnav-search-results' });

    searchInput.addEventListener('input', (e) => {
      this.onSearchInput(e.target.value, searchResults, advancedLink);
    });

    searchField.append(searchInput, advancedLink);
    searchBar.append(searchField, searchResults);
    return searchBar;
  }

  decorateProfile = () => {
    const blockEl = this.body.querySelector('.profile');
    if (!blockEl) return null;
    const profileEl = createEl({ tag: 'div', className: 'gnav-profile' });
    const envSuffix = this.env.ims === 'stg1' ? `-${this.env.ims}` : '';

    window.adobeid = {
      client_id: 'bizweb',
      scope: 'AdobeID,openid,gnav',
      locale: 'en_US',
      environment: this.env.ims,
      useLocalStorage: false,
      onReady: () => { this.imsReady(blockEl, profileEl); },
    };
    loadScript(`https://auth${envSuffix}.services.adobe.com/imslib/imslib.min.js`);

    return profileEl;
  }

  imsReady = async (blockEl, profileEl) => {
    const accessToken = window.adobeIMS.getAccessToken();
    if (accessToken) {
      const ioResp = await fetch('https://cc-collab-stage.adobe.io/profile', {
        headers: new Headers({ Authorization: `Bearer ${accessToken.token}` }),
      });
      if (ioResp.status === 200) {
        const imsProfile = await window.adobeIMS.getProfile();
        const ioProfile = await ioResp.json();
        this.decorateProfileMenu(blockEl, profileEl, imsProfile, ioProfile);
      } else {
        this.decorateSignIn(blockEl, profileEl);
      }
    } else {
      this.decorateSignIn(blockEl, profileEl);
    }
  }

  decorateSignIn = (blockEl, profileEl) => {
    const signIn = blockEl.querySelector('a');
    signIn.classList.add('gnav-signin');
    profileEl.append(signIn);
    profileEl.addEventListener('click', (e) => {
      e.preventDefault();
      window.adobeIMS.signIn();
    });
  }

  decorateProfileMenu = (blockEl, profileEl, imsProfile, ioProfile) => {
    const { displayName, email } = imsProfile;
    const displayEmail = this.decorateEmail(email);
    const { user, sections } = ioProfile;
    const { avatar } = user;
    const avatarImg = createEl({ tag: 'img', className: 'gnav-profile-img', attributes: { src: avatar } });
    const accountLink = blockEl.querySelector('div > div > p:nth-child(2) a');

    const profileButton = createEl({
      tag: 'button',
      className: 'gnav-profile-button',
      html: avatarImg,
      attributes: { 'arial-label': displayName },
    });
    profileButton.addEventListener('click', () => {
      this.toggleMenu(profileEl);
    });

    const profileMenu = createEl({ tag: 'div', className: 'gnav-profile-menu' });
    const profileHeader = createEl({ tag: 'a', className: 'gnav-profile-header' });
    const profileDetails = createEl({ tag: 'div', className: 'gnav-profile-details' });
    const profileActions = createEl({ tag: 'ul', className: 'gnav-profile-actions' });

    profileHeader.href = this.decorateProfileLink(accountLink.href, 'account');
    profileHeader.setAttribute('aria-label', accountLink.textContent);

    const profileImg = avatarImg.cloneNode(true);
    const profileName = createEl({ tag: 'p', className: 'gnav-profile-name', html: displayName });
    const profileEmail = createEl({ tag: 'p', className: 'gnav-profile-email', html: displayEmail });
    const accountText = blockEl.querySelector('div > div > p:nth-child(2) a').innerHTML;
    const profileViewAccount = createEl({ tag: 'p', className: 'gnav-profile-account', html: accountText });
    profileDetails.append(profileName, profileEmail, profileViewAccount);

    if (sections.manage.items.team?.id) {
      const teamLink = blockEl.querySelector('div > div > p:nth-child(3) a');
      teamLink.href = this.decorateProfileLink(teamLink.href, 'adminconsole');
      const manageTeam = createEl({ tag: 'li', html: teamLink, className: 'gnav-profile-action' });
      profileActions.append(manageTeam);
    }

    if (sections.manage.items.enterprise?.id) {
      const manageLink = blockEl.querySelector('div > div > p:nth-child(4) a');
      manageLink.href = this.decorateProfileLink(manageLink.href, 'adminconsole');
      const manageEnt = createEl({ tag: 'li', html: manageLink, className: 'gnav-profile-action' });
      profileActions.append(manageEnt);
    }

    const signOutLink = blockEl.querySelector('div > div > p:nth-child(5) a');
    signOutLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.adobeIMS.signOut();
    });
    const signOut = createEl({ tag: 'li', html: signOutLink, className: 'gnav-profile-action' });
    profileActions.append(signOut);

    profileHeader.append(profileImg, profileDetails);
    profileMenu.append(profileHeader, profileActions);
    profileEl.append(profileButton, profileMenu);
  }

  decorateEmail = (email) => {
    const MAX_CHAR = 12;
    const emailParts = email.split('@');
    const username = emailParts[0].length <= MAX_CHAR ? emailParts[0] : `${emailParts[0].slice(0, MAX_CHAR)}…`;
    const domainArr = emailParts[1].split('.');
    const tld = domainArr.pop();
    let domain = domainArr.join('.');
    domain = domain.length <= MAX_CHAR ? domain : `${domain.slice(0, MAX_CHAR)}…`;
    return `${username}@${domain}.${tld}`;
  }

  decorateProfileLink = (href, service) => {
    if (this.env.name === 'prod') return href;
    const url = new URL(href);
    url.hostname = this.env[service];
    return url.href;
  };

  /**
   * Toggles menus when clicked directly
   * @param {HTMLElement} el the element to check
   */
  toggleMenu = (el) => {
    const isSearch = el.classList.contains('gnav-search');
    const sameMenu = el === this.state.openMenu;
    if (this.state.openMenu) {
      this.closeMenu();
    }
    if (!sameMenu) {
      this.openMenu(el, isSearch);
    }
  }

  closeMenu = () => {
    this.state.openMenu.classList.remove(IS_OPEN);
    document.removeEventListener('click', this.closeOnDocClick);
    window.removeEventListener('keydown', this.closeOnEscape);
    this.curtain.classList.remove(IS_OPEN);
    this.state.openMenu = null;
  }

  openMenu = (el, isSearch) => {
    el.classList.add(IS_OPEN);
    document.addEventListener('click', this.closeOnDocClick);
    window.addEventListener('keydown', this.closeOnEscape);
    if (!isSearch) {
      document.addEventListener('scroll', this.closeOnScroll, { passive: true });
    } else {
      this.curtain.classList.add(IS_OPEN);
      el.querySelector('.gnav-search-input').focus();
    }
    this.state.openMenu = el;
  }

  closeOnScroll = () => {
    let scrolled;
    if (!scrolled) {
      this.toggleMenu(this.state.openMenu);
      scrolled = true;
      document.removeEventListener('scroll', this.closeOnScroll);
    }
  }

  closeOnDocClick = (e) => {
    const closest = e.target.closest(`.${IS_OPEN}`);
    const isCurtain = e.target === this.curtain;
    if ((this.state.openMenu && !closest) || isCurtain) {
      this.toggleMenu(this.state.openMenu);
    }
  }

  closeOnEscape = (e) => {
    if (e.keyCode === 27) {
      this.toggleMenu(this.state.openMenu);
    }
  }
}

async function fetchGnav(url) {
  const resp = await fetch(`${url}.plain.html`);
  const html = await resp.text();
  return html;
}

export default async function init(blockEl) {
  const url = blockEl.getAttribute('data-gnav-source');
  if (url) {
    const html = await fetchGnav(url);
    if (html) {
      try {
        const parser = new DOMParser();
        const gnavDoc = parser.parseFromString(html, 'text/html');
        const gnav = new Gnav(gnavDoc.body, blockEl);
        gnav.init();
      } catch {
        debug('Could not create global navigation.');
      }
    }
  }
}
