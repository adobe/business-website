/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-console, class-methods-use-this */

const DEFAULT_COLSPAN = 2;

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  meta.Category = 'basics';
  meta.Author = 'DX Adobe';

  const date = document.querySelector('meta[name="publishDate"]');
  if (date) {
    meta['Publication Date'] = date.content.substring(0, date.content.indexOf('T'));
  }

  meta.Tags = 'Glossary';

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
}

const createColumnsBlock = (main, document) => {
  const relatedLinks = document.querySelector('.dexter-FlexContainer-Items.dexter-FlexContainer--mobileJustifyCenter.dexter-FlexContainer--mobileAlignItemCenter.dexter-FlexContainer--mobileAlignContentStretch.dexter-FlexContainer--mobileAlignItemContentStart.dexter-FlexContainer--tabletJustifyCenter.dexter-FlexContainer--tabletAlignItemStart.dexter-FlexContainer--desktopJustifyCenter.dexter-FlexContainer--desktopAlignItemStart');

  if(relatedLinks) {
    const paragraphs = relatedLinks.querySelectorAll('p');
    if(paragraphs) {
      const columnsBlock = document.createElement('table');

      let row = document.createElement('tr');
      columnsBlock.append(row);

      const hCell = document.createElement('th');
      row.append(hCell);

      hCell.innerHTML = 'Columns (contained, middle)';
      hCell.setAttribute('colspan', DEFAULT_COLSPAN);

      row = document.createElement('tr');
      columnsBlock.append(row);

      const col1Cell = document.createElement('td');
      row.append(col1Cell);

      col1Cell.append(paragraphs[0]);
      col1Cell.append(paragraphs[1]);

      const col2Cell = document.createElement('td');
      row.append(col2Cell);

      col2Cell.append(paragraphs[2]);
      col2Cell.append(paragraphs[3]);

      main.append(columnsBlock);
    }
  }
}

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transformDOM: ({ document, html}) => {
    // simply return the body, no transformation (yet)
    WebImporter.DOMUtils.remove(document, [
      'header, footer, .modalContainer.static, .xf'
    ]);

    const main = document.querySelector('.page');

    createColumnsBlock(main, document);
    createMetadata(main, document);

    return document.body;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: ({ document, url }) => {
    return new URL(url).pathname.replace(/\/$/, '');
  },
}
