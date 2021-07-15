export const config = {
    themes: {
        blog: {
            class: 'blog-theme',
            location: '/themes/blog/',
            styles: 'blog.css',
        },
    },
    blocks: {
        '.marquee': {
            location: '/blocks/marquee/',
            styles: 'marquee.css',
            scripts: 'marquee.js',
        },
        'a[href^="https://gist.github.com"]': {
            location: '/blocks/embed/',
            scripts: 'gist.js',
        }
    },
};

/**
 * Return the correct CMP integration ID based on the domain name
 */
export const getOtDomainId = () => {
    const domains = {
        'adobe.com': '7a5eb705-95ed-4cc4-a11d-0cc5760e93db',
        'hlx.page': '3a6a37fe-9e07-4aa9-8640-8f358a623271',
        'project-helix.page': '45a95a10-dff7-4048-a2f3-a235b5ec0492',
        'helix-demo.xyz': 'ff276bfd-1218-4a19-88d4-392a537b6ce3',
        'adobeaemcloud.com': '70cd62b6-0fe3-4e20-8788-ef0435b8cdb1',
    };
    const currentDomain = Object.keys(domains).find(domain => window.location.host.indexOf(domain) > -1);

    return `${domains[currentDomain] || domains[Object.keys(domains)[0]]}`;
};

export const fedsConfig = {
    locale: 'en',
    content: {
        experience: 'blogs/blog-gnav',
    },
    search: {
        context: 'blogs',
        passExperienceName: true,
    },
    disableSticky: false,
    privacy: {
        otDomainId: getOtDomainId(),
        footerLinkSelector: '[data-feds-action="open-adchoices-modal"]',
    },
}