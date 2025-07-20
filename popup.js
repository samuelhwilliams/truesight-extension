document.addEventListener('DOMContentLoaded', async () => {
  const toggleButton = document.getElementById('toggleButton');
  const status = document.getElementById('status');
  
  const updateUI = (enabled) => {
    if (enabled) {
      toggleButton.textContent = 'Disable TrueSight';
      toggleButton.className = 'toggle-button enabled';
      status.textContent = 'Hidden elements are revealed';
      status.className = 'status enabled';
    } else {
      toggleButton.textContent = 'Enable TrueSight';
      toggleButton.className = 'toggle-button disabled';
      status.textContent = 'Hidden elements are concealed';
      status.className = 'status disabled';
    }
  };
  
  const result = await chrome.storage.sync.get(['trueSightEnabled']);
  const currentState = result.trueSightEnabled || false;
  updateUI(currentState);
  
  toggleButton.addEventListener('click', async () => {
    const result = await chrome.storage.sync.get(['trueSightEnabled']);
    const newState = !result.trueSightEnabled;
    
    await chrome.storage.sync.set({ trueSightEnabled: newState });
    updateUI(newState);
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, {
      action: 'toggleTrueSight',
      enabled: newState
    });
  });
});