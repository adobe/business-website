import {
  loadScript,
} from '../../scripts/scripts.js';

function checkForControlPresence(str, arr) {
  return arr.reduce((acc, prop) => {
    const reg = new RegExp(str, 'g');
    const check = reg.test(prop);
    const match = prop === str;

    if (check && !match) {
      return check;
    }

    return acc;
  }, false);
}

export function dataConf({ dataset } = {}) {
  const dataKeys = dataset ? Object.keys(dataset) : [];

  if (dataKeys.length === 0) {
    return {};
  }

  return dataKeys.reduce((acc, prop) => {
    const [control, config, ...modifiers] = prop.split(/(?=[A-Z])/);
    const confFix = config ? config.toLowerCase().concat(modifiers.join('')) : '';
    const controlGroup = checkForControlPresence(control, dataKeys);

    if (!acc[control] && controlGroup) {
      acc[control] = {};
    }

    if (config && controlGroup) {
      acc[control][confFix] = dataset[prop];
      return acc;
    }

    if (!config && controlGroup && (!!dataset[prop] && typeof dataset[prop] === 'string')) {
      acc[control].id = dataset[prop];
      return acc;
    }

    if (!config && !controlGroup) {
      acc[control] = dataset[prop];
      return acc;
    }

    return acc;
  }, {});
}

const loadEmbed = async (block) => {
  const faasForm = document.createElement('form');
  faasForm.id = 'faas-form-40';
  faasForm.classList.add('faas-form');
  block.innerHTML = faasForm.outerHTML;
  block.setAttribute('data-faas', '40');
  console.log(block);
  const faasconf = {
    faas: '40',
    id: '40',
    'faas-campid': '70114000002XYvIAAW',
    'faas-lang': 'en_us',
    'faas-type': '2846',
    'faas-subtype': '2851',
    'faas-prepopulated': '[js,faas_submission,sfdc,demandbase]',
    'faas-customizablequestions': '14,18,51,96,69,97',
    'faas-destinationurl': 'https://business.adobe.com/request-consultation/thankyou.html',
    'faas-hosturl': 'https://apps.enterprise.adobe.com',
    'faas-jquerypath': '/etc.insights.dexterlibs/dexter/clientlibs/base/jquery.min.js'
  };
  loadScript('https://code.jquery.com/jquery-3.6.0.min.js', () => {
    loadScript('https://apps.enterprise.adobe.com/faas/service/jquery.faas-3.0.0.js', () => {
      window.faasLoaded = true;
      console.log(faasconf);
      // eslint-disable-next-line no-undef
      $(block).faas(faasconf);
    });
  });
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
