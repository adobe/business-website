import defaultExport from '../../consonant/marquee/marquee.js';

export default function decorate(block) {
  defaultExport(block);
  block.closest('.section-wrapper').classList.add('marquee-container');
}
