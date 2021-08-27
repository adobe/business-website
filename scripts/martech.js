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
import { loadScript } from './scripts.js';

window.marketingtech = window.marketingtech || {};
window.marketingtech.adobe = {
  target: true,
  audienceManager: true,
  launch: {
    property: 'global',
    environment: 'production',
  },
};
window.targetGlobalSettings = window.targetGlobalSettings || {};
window.targetGlobalSettings.bodyHidingEnabled = false;

const launchScriptEl = loadScript('https://www.adobe.com/marketingtech/main.no-promise.min.js');
launchScriptEl.setAttribute('data-seed-adobelaunch', 'true');
