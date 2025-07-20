// Track per-tab state
const tabStates = new Map();

// Helper function to inject content script
const injectContentScript = async (tabId) => {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => window.trueSightInjected
    });
    
    if (!results[0].result) {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
    }
  } catch (error) {
    // Content script not injected, inject it now
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
  }
};

const updateIcon = (tabId, enabled) => {
  const iconPath = enabled ? 'eye-open' : 'eye-closed';
  chrome.action.setIcon({
    tabId: tabId,
    path: {
      "16": `icons/${iconPath}-16.png`,
      "32": `icons/${iconPath}-32.png`,
      "48": `icons/${iconPath}-48.png`,
      "128": `icons/${iconPath}-128.png`
    }
  });
};

chrome.action.onClicked.addListener(async (tab) => {
  const currentState = tabStates.get(tab.id) || false;
  const newState = !currentState;
  
  tabStates.set(tab.id, newState);
  updateIcon(tab.id, newState);
  
  // Inject content script
  await injectContentScript(tab.id);
  
  // Send message to toggle with notification
  const notificationMessage = newState 
    ? 'GOV.UK hidden elements revealed' 
    : 'GOV.UK hidden elements re-hidden';
    
  chrome.tabs.sendMessage(tab.id, {
    action: 'toggleTrueSight',
    enabled: newState,
    notification: notificationMessage
  });
});

// Update icon when switching tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  const enabled = tabStates.get(activeInfo.tabId) || false;
  updateIcon(activeInfo.tabId, enabled);
});

// Re-inject content script on navigation if tab state is enabled
chrome.webNavigation.onCompleted.addListener(async (details) => {
  // Only handle main frame navigations (not iframes)
  if (details.frameId !== 0) return;
  
  const enabled = tabStates.get(details.tabId);
  if (enabled) {
    // Re-inject content script and apply state
    try {
      await injectContentScript(details.tabId);
      
      // Send message to apply the enabled state (no notification on navigation)
      chrome.tabs.sendMessage(details.tabId, {
        action: 'toggleTrueSight',
        enabled: true
      });
      
      // Update icon to reflect state
      updateIcon(details.tabId, true);
    } catch (error) {
      // Tab might be closed or navigation cancelled
    }
  }
});

// Clean up tab state when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabStates.delete(tabId);
});