chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ trueSightEnabled: false });
});

chrome.action.onClicked.addListener(async (tab) => {
  const result = await chrome.storage.sync.get(['trueSightEnabled']);
  const newState = !result.trueSightEnabled;
  
  await chrome.storage.sync.set({ trueSightEnabled: newState });
  
  // Update icon based on state
  const iconPath = newState ? 'eye-open' : 'eye-closed';
  chrome.action.setIcon({
    path: {
      "16": `icons/${iconPath}-16.png`,
      "32": `icons/${iconPath}-32.png`,
      "48": `icons/${iconPath}-48.png`,
      "128": `icons/${iconPath}-128.png`
    }
  });
  
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