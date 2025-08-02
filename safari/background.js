/**
 * Safari Extension Background Script
 * Handles extension lifecycle and provides additional functionality
 */

// Extension installation and update handling
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Mermaid Visualizer installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      enabled: true,
      autoDetect: true,
      theme: 'default'
    });
  }
});

// When the user clicks on the extension icon
chrome.browserAction.onClicked.addListener((tab) => {
  // Send a message to the content script to find and visualize all diagrams
  chrome.tabs.sendMessage(tab.id, {
    action: 'visualizeAll'
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.log('Could not send message to content script:', chrome.runtime.lastError);
    }
  });
});

// Context menu for detected Mermaid code
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'visualize-mermaid',
    title: 'Visualize as Mermaid Diagram',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'visualize-mermaid' && info.selectionText) {
    // Send selected text to content script for visualization
    chrome.tabs.sendMessage(tab.id, {
      action: 'visualizeSelection',
      text: info.selectionText
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Failed to send message to content script:', chrome.runtime.lastError);
      }
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    // Update extension badge with number of diagrams found
    chrome.browserAction.setBadgeText({
      text: request.count > 0 ? request.count.toString() : '',
      tabId: sender.tab.id
    });
    
    chrome.browserAction.setBadgeBackgroundColor({
      color: '#0366d6',
      tabId: sender.tab.id
    });
  }
  
  if (request.action === 'getSettings') {
    // Return current settings
    chrome.storage.sync.get(['enabled', 'autoDetect', 'theme'], (result) => {
      sendResponse({
        enabled: result.enabled !== false,
        autoDetect: result.autoDetect !== false,
        theme: result.theme || 'default'
      });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'saveSettings') {
    // Save settings
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Tab navigation handling
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Clear badge when navigating to new page
    chrome.browserAction.setBadgeText({
      text: '',
      tabId: tabId
    });
  }
});

// Keyboard shortcut handling (if supported in Safari)
if (chrome.commands) {
  chrome.commands.onCommand.addListener((command, tab) => {
    if (command === 'toggle-visualization') {
      chrome.tabs.sendMessage(tab.id, {
        action: 'toggleVisualization'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Failed to send toggle command:', chrome.runtime.lastError);
        }
      });
    }
  });
}

// Analytics and error reporting (optional)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'reportError') {
    console.error('Content script error:', request.error);
    // Could send to analytics service here
  }
  
  if (request.action === 'reportUsage') {
    console.log('Diagram visualized:', request.platform, request.diagramType);
    // Could send usage stats here
  }
});