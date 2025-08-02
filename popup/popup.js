/**
 * Popup UI JavaScript for Mermaid Visualizer Extension
 */

(function() {
  'use strict';

  // DOM elements
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const diagramsFound = document.getElementById('diagramsFound');
  const enabledToggle = document.getElementById('enabledToggle');
  const autoDetectToggle = document.getElementById('autoDetectToggle');
  const themeSelect = document.getElementById('themeSelect');
  const scanButton = document.getElementById('scanButton');
  const helpButton = document.getElementById('helpButton');
  const helpSection = document.getElementById('helpSection');
  const feedbackLink = document.getElementById('feedbackLink');

  // State
  let currentSettings = {
    enabled: true,
    autoDetect: true,
    theme: 'default'
  };

  // Initialize popup
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await loadSettings();
      await updateStatus();
      setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      showError('Failed to initialize extension');
    }
  });

  /**
   * Load settings from storage
   */
  async function loadSettings() {
    return new Promise((resolve) => {
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
          if (response) {
            currentSettings = response;
            updateUI();
          }
          resolve();
        });
      } else {
        // Fallback for development/testing
        resolve();
      }
    });
  }

  /**
   * Save settings to storage
   */
  async function saveSettings() {
    return new Promise((resolve) => {
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ 
          action: 'saveSettings', 
          settings: currentSettings 
        }, (response) => {
          resolve(response && response.success);
        });
      } else {
        resolve(true);
      }
    });
  }

  /**
   * Update UI based on current settings
   */
  function updateUI() {
    enabledToggle.checked = currentSettings.enabled;
    autoDetectToggle.checked = currentSettings.autoDetect;
    themeSelect.value = currentSettings.theme;
    
    // Update scan button state
    scanButton.disabled = !currentSettings.enabled;
  }

  /**
   * Update extension status
   */
  async function updateStatus() {
    try {
      const tabs = await getCurrentTab();
      if (!tabs || !tabs[0]) {
        setStatus('inactive', 'No active tab');
        return;
      }

      const tab = tabs[0];
      
      // Check if tab is supported
      if (!isSupportedUrl(tab.url)) {
        setStatus('inactive', 'Unsupported page');
        diagramsFound.textContent = '0';
        return;
      }

      if (!currentSettings.enabled) {
        setStatus('inactive', 'Extension disabled');
        diagramsFound.textContent = '0';
        return;
      }

      // Query content script for diagram count
      setStatus('checking', 'Scanning...');
      
      chrome.tabs.sendMessage(tab.id, { action: 'getDiagramCount' }, (response) => {
        if (chrome.runtime.lastError) {
          setStatus('inactive', 'Content script not loaded');
          diagramsFound.textContent = '0';
        } else if (response) {
          const count = response.count || 0;
          setStatus('active', count > 0 ? 'Diagrams detected' : 'No diagrams found');
          diagramsFound.textContent = count.toString();
        } else {
          setStatus('inactive', 'Unable to scan');
          diagramsFound.textContent = '0';
        }
      });
      
    } catch (error) {
      console.error('Failed to update status:', error);
      setStatus('inactive', 'Error checking status');
    }
  }

  /**
   * Set status indicator
   */
  function setStatus(state, text) {
    statusDot.className = `status-dot ${state}`;
    statusText.textContent = text;
  }

  /**
   * Get current active tab
   */
  function getCurrentTab() {
    return new Promise((resolve) => {
      if (chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, resolve);
      } else {
        resolve([]);
      }
    });
  }

  /**
   * Check if URL is supported
   */
  function isSupportedUrl(url) {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Settings toggles
    enabledToggle.addEventListener('change', async () => {
      currentSettings.enabled = enabledToggle.checked;
      await saveSettings();
      updateUI();
      await updateStatus();
    });

    autoDetectToggle.addEventListener('change', async () => {
      currentSettings.autoDetect = autoDetectToggle.checked;
      await saveSettings();
    });

    themeSelect.addEventListener('change', async () => {
      currentSettings.theme = themeSelect.value;
      await saveSettings();
    });

    // Action buttons
    scanButton.addEventListener('click', async () => {
      try {
        const tabs = await getCurrentTab();
        if (!tabs || !tabs[0]) return;

        const tab = tabs[0];
        scanButton.disabled = true;
        scanButton.textContent = 'Scanning...';

        // Send scan message to content script
        chrome.tabs.sendMessage(tab.id, { action: 'rescanPage' }, () => {
          scanButton.disabled = false;
          scanButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Scan Page
          `;
          updateStatus();
        });
      } catch (error) {
        console.error('Failed to scan page:', error);
        showError('Failed to scan page');
      }
    });

    helpButton.addEventListener('click', () => {
      const isVisible = helpSection.style.display !== 'none';
      helpSection.style.display = isVisible ? 'none' : 'block';
      helpButton.textContent = isVisible ? 'Help' : 'Hide Help';
    });

    // Feedback link
    feedbackLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({
        url: 'https://github.com/your-username/mermaid-visualizer/issues'
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.close();
      }
      
      if (e.key === 'Enter' && e.target === scanButton) {
        scanButton.click();
      }
    });
  }

  /**
   * Show error message
   */
  function showError(message) {
    statusText.textContent = message;
    statusDot.className = 'status-dot inactive';
  }

  /**
   * Listen for messages from background script
   */
  if (chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'updatePopup') {
        updateStatus();
      }
    });
  }

  // Update status periodically
  setInterval(updateStatus, 5000);

})();