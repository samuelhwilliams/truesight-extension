// Track per-tab state
const tabStates = new Map();

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
  
  // Check if content script is already injected, if not inject it
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.trueSightInjected
    });
    
    if (!results[0].result) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    }
  } catch (error) {
    // Content script not injected, inject it now
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  }
  
  // Send message to toggle
  chrome.tabs.sendMessage(tab.id, {
    action: 'toggleTrueSight',
    enabled: newState
  });
});

// Update icon when switching tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  const enabled = tabStates.get(activeInfo.tabId) || false;
  updateIcon(activeInfo.tabId, enabled);
});

// Clean up tab state when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabStates.delete(tabId);
});