/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global window */
/* eslint-disable import/named, import/extensions */

import { buildFigure } from '../../scripts/scripts.js';

const loadScript = (url, callback, type) => {
    const $head = document.querySelector('head');
    const $script = document.createElement('script');
    $script.src = url;
    if (type) {
      $script.setAttribute('type', type);
    }
    $head.append($script);
    $script.onload = callback;
    return $script;
}

// 'open.spotify.com' returns 'spotify'
const getServer = (url) => {
    const l = url.hostname.lastIndexOf('.');
    return url.hostname.substring(url.hostname.lastIndexOf('.', l - 1) + 1, l);
}
  
const getDefaultEmbed = (url) => {
    return `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
        scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
      </iframe>
    </div>`;
}
  
const embedYoutube = (url) => {
    const usp = new URLSearchParams(url.search);
    const vid = usp.get('v');
    const embed = url.pathname;
    const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&amp;v=${vid}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
    return embedHTML;
}
  
const embedInstagram = (url) => {
    const location = window.location.href;
    const src = `${url.origin}${url.pathname}${url.pathname.charAt(url.pathname.length - 1) === '/' ? '' : '/'}embed/?cr=1&amp;v=13&amp;wp=1316&amp;rd=${location.endsWith('.html') ? location : `${location}.html`}`;
    const embedHTML = `<div style="width: 100%; position: relative; display: flex; justify-content: center">
      <iframe class="instagram-media instagram-media-rendered" id="instagram-embed-0" src="${src}"
        allowtransparency="true" allowfullscreen="true" frameborder="0" height="530" style="background: white; border-radius: 3px; border: 1px solid rgb(219, 219, 219);
        box-shadow: none; display: block;" loading="lazy">
      </iframe>
    </div>`;
    return embedHTML;
}
  
const embedVimeo = (url) => {
    const linkArr = url.href.split('/');
    const video = linkArr ? linkArr[3] : linkArr;

    const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src=\"https:\/\/player.vimeo.com\/video\/${video}?app_id=122963\" 
        style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
        frameborder=\"0\" allow=\"autoplay; fullscreen; picture-in-picture\" allowfullscreen  
        title="Content from Vimeo" loading="lazy"><\/iframe>
    </div>`;
    return embedHTML;
}
  
const embedSpark = (url) => {
    let embedURL = url;
    if (!url.pathname.endsWith('/embed.html') && !url.pathname.endsWith('/embed')) {
      embedURL = new URL(`${url.href}${url.pathname.endsWith('/') ? '' : '/'}embed.html`);
    }
  
    return getDefaultEmbed(embedURL);
}
  
const embedTwitter = (url) => {
    const embedHTML = `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote>`;
    loadScript('https://platform.twitter.com/widgets.js');
    return embedHTML;
}

const embedTiktok = (url) => {
    let resultHtml = document.createElement('div');
    resultHtml.setAttribute('id', 'tiktok');
    fetch(`https://www.tiktok.com/oembed?url=${url}`)
    .then(response => response.json())
    .then(data => {
        loadScript('https://www.tiktok.com/embed.js');
        const $tiktok = document.getElementById('tiktok')
        $tiktok.outerHTML = data.html;
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    return resultHtml.outerHTML;
}

const embedSlidShare = (url) => {
    let resultHtml = document.createElement('div');
    resultHtml.setAttribute('id', 'slideShare');
    fetch(url)
    .then(data => {
        data.text().then( data => {
            const $el = document.createElement('div');
            $el.innerHTML = data;
            const embedUrl = $el.querySelector('.slideshow-info meta[itemprop="embedURL"]').content;
            if(embedUrl) {
                const $slideShare = document.getElementById('slideShare')
                $slideShare.outerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
                <iframe src="${embedUrl}" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" allowfullscreen loading="lazy"> </iframe>
                </div>`;
            }
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    
    return resultHtml.outerHTML;
}
  
const EMBEDS_CONFIG = {
    'www.youtube.com': {
        type: 'youtube',
        embed: embedYoutube,
    },
    'video.tv.adobe.com': {
        type: 'adobe-tv',
        embed: getDefaultEmbed,
    },
    'www.instagram.com': {
        type: 'instagram',
        embed: embedInstagram,
    },
    'vimeo.com': {
        type: 'vimeo-player',
        embed: embedVimeo,
    },
    'www.vimeo.com': {
        type: 'vimeo-player',
        embed: embedVimeo,
      },
    'player.vimeo.com': {
        type: 'vimeo-player',
        embed: embedVimeo,
    },
    'spark.adobe.com': {
        type: 'adobe-spark',
        embed: embedSpark,
    },
    'twitter.com': {
        type: 'twitter',
        embed: embedTwitter,
    },
    'tiktok.com': {
        type: 'tiktok',
        embed: embedTiktok,
    },
    'www.tiktok.com': {
        type: 'tiktok',
        embed: embedTiktok,
    },
    'www.slideshare.net': {
        type: 'slideshare',
        embed: embedSlidShare,
    },
  };

const loadEmbed = (entries) => {
    const $block = entries[0].target;
    const $figure = buildFigure($block.firstChild.firstChild);
    const $a = $figure.querySelector('a');
    if($a) {
        const url = new URL($a.href.replace(/\/$/, ''));
        const config = EMBEDS_CONFIG[url.hostname];
        if (config) {
            $a.outerHTML = config.embed(url);
            $block.classList = `block embed embed-${config.type}`;
        }
        else {
            $a.outerHTML = getDefaultEmbed(url);
            $block.classList = `block embed embed-${getServer(url)}`;
        }
        $block.innerHTML = $figure.outerHTML;
    }
};

export default function decorate($block) {
    window.addEventListener('load', (event) => {
        let observer;  
        let options = {
            root: null,
            rootMargin: "0px",
        };
        
        observer = new IntersectionObserver(loadEmbed, options);
        observer.observe($block);

        // // if current scrollY is already ready to load the block:
        // if(window.scrollY > $block.offsetTop - 1500) {
        //     $block.classList.add('is-loaded');
        //     loadEmbed($block);
        //     return;
        // }
        // else {
        //     document.addEventListener('scroll', (e) => {
        //         // do nothing if block is already loaded.
        //         if($block.classList.contains('is-loaded')) {
        //             return;
        //         }
        //         // load block as scroll.
        //         if(window.scrollY > $block.offsetTop - 1500) {
        //             $block.classList.add('is-loaded');
        //             loadEmbed($block);
        //             return;
        //         }
        //     },{ passive: true });
        // }
    });
}