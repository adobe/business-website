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
