(function() {
  if (window.trueSightInjected) {
    return;
  }
  window.trueSightInjected = true;

let trueSightEnabled = false;

const CSS_ID = 'truesight-styles';
const CUSTOM_CLASS = 'truesight-revealed';
const NOTIFICATION_ID = 'truesight-notification';

const injectCSS = () => {
  if (document.getElementById(CSS_ID)) return;
  
  const style = document.createElement('style');
  style.id = CSS_ID;
  style.textContent = `
    .${CUSTOM_CLASS} {
      background-color: #e6d7ff;
    }
    
    #${NOTIFICATION_ID} {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #e6d7ff;
      color: #4a4a4a;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease-out;
      max-width: 280px;
      pointer-events: none;
    }
    
    #${NOTIFICATION_ID}.show {
      opacity: 1;
      transform: translateX(0);
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

const showNotification = (message) => {
  // Ensure CSS is injected first
  injectCSS();
  
  // Remove existing notification if present
  const existing = document.getElementById(NOTIFICATION_ID);
  if (existing) {
    existing.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.id = NOTIFICATION_ID;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Wait a bit longer to ensure CSS is fully applied
  setTimeout(() => {
    notification.classList.add('show');
  }, 50);
  
  // Remove after 2 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300); // Wait for transition to complete
  }, 2000);
};

const applyTrueSight = (enabled) => {
  trueSightEnabled = enabled;
  
  if (enabled) {
    injectCSS();
    toggleElements(true);
  } else {
    toggleElements(false);
    // Don't remove CSS immediately - keep it for notifications
    // Only remove the revealed element styles
    const revealedElements = document.querySelectorAll(`.${CUSTOM_CLASS}`);
    revealedElements.forEach(element => {
      if (element.getAttribute('data-truesight-original') === 'govuk-visually-hidden') {
        element.classList.remove(CUSTOM_CLASS);
        element.classList.add('govuk-visually-hidden');
        element.removeAttribute('data-truesight-original');
      }
    });
  }
};

const revealElement = (element) => {
  element.classList.remove('govuk-visually-hidden');
  element.classList.add(CUSTOM_CLASS);
  element.setAttribute('data-truesight-original', 'govuk-visually-hidden');
};

const observeNewElements = () => {
  if (!trueSightEnabled) return;
  
  const observer = new MutationObserver(mutations => {
    if (!trueSightEnabled) return;
    
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the node itself has the hidden class
          if (node.classList && node.classList.contains('govuk-visually-hidden')) {
            revealElement(node);
          }
          
          // Check for hidden elements within the node
          if (node.querySelectorAll) {
            const hiddenElements = node.querySelectorAll('.govuk-visually-hidden');
            hiddenElements.forEach(revealElement);
          }
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
    
    // Show notification if message is provided
    if (message.notification) {
      showNotification(message.notification);
    }
  }
});

// Content script is injected on-demand when extension is activated

})();
