chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ trueSightEnabled: false });
});

chrome.action.onClicked.addListener(async (tab) => {
  const result = await chrome.storage.sync.get(['trueSightEnabled']);
  const newState = !result.trueSightEnabled;
  
  await chrome.storage.sync.set({ trueSightEnabled: newState });
  
  chrome.tabs.sendMessage(tab.id, {
    action: 'toggleTrueSight',
    enabled: newState
  });
});