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

/* globals  */
import { loadScript, sampleRUM } from './scripts.js';

function updateExternalLinks() {
  document.querySelectorAll('main a, footer a').forEach((a) => {
    const { origin } = new URL(a);
    if (origin && origin !== window.location.origin) {
      a.setAttribute('rel', 'noopener');
      a.setAttribute('target', '_blank');
    }
  });
}

if (document.querySelector('.article-header') && !document.querySelector('[data-origin]')) {
  loadScript('../../blocks/interlinks/interlinks.js', null, 'module');
}

updateExternalLinks();

/* Core Web Vitals RUM collection */

sampleRUM('cwv');
