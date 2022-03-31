import {
  loadScript,
  fetchMarketoFormConfig,
} from '../../scripts/scripts.js';

const getMarketoForm = async (name) => {
  let formData = false;
  const marketoFormConfig = await fetchMarketoFormConfig();
  marketoFormConfig.forEach((formItem) => {
    if (name.toLowerCase() === formItem.name.toLowerCase()) {
      formData = formItem;
      if (formData.setValues) {
        formData.setValues = JSON.parse(formData.setValues);
      }
      if (formData.addHiddenFields) {
        formData.addHiddenFields = JSON.parse(formData.addHiddenFields);
      }
      // eslint-disable-next-line no-useless-return
      return;
    }
  });
  return formData;
};

const loadEmbed = async (block) => {
  const formName = block.textContent.trim();
  const formData = await getMarketoForm(formName);
  if (formData) {
    block.innerHTML = '<form id="mktoForm_6"></form>';
    loadScript(`${formData.baseURL}/js/forms2/js/forms2.min.js`, () => {
      // eslint-disable-next-line no-undef
      MktoForms2.loadForm(formData.baseURL, formData.munchkinId, formData.formId, (form) => {
        if (formData.setValues) {
          form.setValues(formData.setValues);
        }
        if (formData.addHiddenFields) {
          form.addHiddenFields(formData.addHiddenFields);
        }
      });
      block.classList.add('is-loaded');
    });
  }
};

const intersectHandler = (entries) => {
  const entry = entries[0];
  if (entry.isIntersecting) {
    if (entry.intersectionRatio >= 0.25) {
      const block = entry.target;
      loadEmbed(block);
    }
  } else {
    // if ((entry.intersectionRatio === 0.0) && (adBox.dataset.totalViewTime >= 60000)) {
    // Error handler placeholder
    // }
  }
};

export default function decorate(block) {
  const runObserver = () => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: [0.0, 0.25],
    };

    const observer = new IntersectionObserver(intersectHandler, options);
    observer.observe(block);
  };

  if (document.readyState === 'complete') {
    runObserver();
  } else {
    window.addEventListener('load', () => {
      runObserver();
    });
  }
}
