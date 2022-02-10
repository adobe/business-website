const loadScript = (url, callback, type) => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (type) {
    script.setAttribute('type', type);
  }
  head.append(script);
  script.onload = callback;
  return script;
};

const getMarketoForm = async (name) => {
  let formData = false;
  const resp = await fetch('/blog/marketo-form.json');
  const json = await resp.json();
  json.data.forEach((formItem) => {
    if (name.toLowerCase() === formItem.name.toLowerCase()) {
      formData = formItem;
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
    loadScript(`${formData.baseUrl}/js/forms2/js/forms2.min.js`, () => {
      // eslint-disable-next-line no-undef
      MktoForms2.loadForm(formData.baseUrl, formData.munchkinId, formData.formId);
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
