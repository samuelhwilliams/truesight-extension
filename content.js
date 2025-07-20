let trueSightEnabled = false;

const CSS_ID = 'truesight-styles';
const CUSTOM_CLASS = 'truesight-revealed';

const injectCSS = () => {
  if (document.getElementById(CSS_ID)) return;
  
  const style = document.createElement('style');
  style.id = CSS_ID;
  style.textContent = `
    .${CUSTOM_CLASS} {
      background-color: #e6d7ff !important;
      opacity: 1 !important;
      visibility: visible !important;
      position: static !important;
      width: auto !important;
      height: auto !important;
      clip: auto !important;
      overflow: visible !important;
      white-space: normal !important;
      border: 1px solid #9b6bb5 !important;
      padding: 2px 4px !important;
      margin: 1px !important;
      font-size: 12px !important;
      line-height: 1.2 !important;
    }
  `;
  document.head.appendChild(style);
};

const removeCSS = () => {
  const style = document.getElementById(CSS_ID);
  if (style) {
    style.remove();
  }
};

const toggleElements = (enable) => {
  const elements = document.querySelectorAll('.govuk-visually-hidden, .truesight-revealed');
  
  elements.forEach(element => {
    if (enable) {
      if (element.classList.contains('govuk-visually-hidden')) {
        element.classList.remove('govuk-visually-hidden');
        element.classList.add(CUSTOM_CLASS);
        element.setAttribute('data-truesight-original', 'govuk-visually-hidden');
      }
    } else {
      if (element.classList.contains(CUSTOM_CLASS) && 
          element.getAttribute('data-truesight-original') === 'govuk-visually-hidden') {
        element.classList.remove(CUSTOM_CLASS);
        element.classList.add('govuk-visually-hidden');
        element.removeAttribute('data-truesight-original');
      }
    }
  });
};

const applyTrueSight = (enabled) => {
  trueSightEnabled = enabled;
  
  if (enabled) {
    injectCSS();
    toggleElements(true);
  } else {
    toggleElements(false);
    removeCSS();
  }
};

const observeNewElements = () => {
  if (!trueSightEnabled) return;
  
  const observer = new MutationObserver(mutations => {
    if (!trueSightEnabled) return;
    
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const hiddenElements = node.querySelectorAll ? 
            node.querySelectorAll('.govuk-visually-hidden') : [];
          
          if (node.classList && node.classList.contains('govuk-visually-hidden')) {
            node.classList.remove('govuk-visually-hidden');
            node.classList.add(CUSTOM_CLASS);
            node.setAttribute('data-truesight-original', 'govuk-visually-hidden');
          }
          
          hiddenElements.forEach(element => {
            element.classList.remove('govuk-visually-hidden');
            element.classList.add(CUSTOM_CLASS);
            element.setAttribute('data-truesight-original', 'govuk-visually-hidden');
          });
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
};

let observer = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleTrueSight') {
    applyTrueSight(message.enabled);
    
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    
    if (message.enabled) {
      observer = observeNewElements();
    }
  }
});

chrome.storage.sync.get(['trueSightEnabled']).then(result => {
  const enabled = result.trueSightEnabled || false;
  applyTrueSight(enabled);
  
  if (enabled) {
    observer = observeNewElements();
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['trueSightEnabled']).then(result => {
      const enabled = result.trueSightEnabled || false;
      if (enabled) {
        setTimeout(() => applyTrueSight(enabled), 100);
      }
    });
  });
}