// Background script with enhanced debugging
console.log('🔵 Mermaid Visualizer background script starting...');

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('🟢 Extension icon clicked! Tab ID:', tab.id, 'URL:', tab.url);
  
  // Send message to content script
  chrome.tabs.sendMessage(tab.id, { action: 'visualizeAll' })
    .then((response) => {
      console.log('✅ Message sent successfully, response:', response);
    })
    .catch((error) => {
      console.log('⚠️ Content script not found, injecting scripts...', error.message);
      
      // Inject all necessary scripts
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [
          'shared/pako.min.js',
          'shared/mermaid.min.js',
          'shared/mermaid-detector.js', 
          'shared/diagram-renderer.js',
          'shared/content.js'
        ]
      }).then(() => {
        console.log('✅ Scripts injected successfully');
        
        // Try sending message again after a short delay
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, { action: 'visualizeAll' })
            .then((response) => {
              console.log('✅ Message sent after injection, response:', response);
            })
            .catch((error) => {
              console.log('❌ Still failed after injection:', error.message);
            });
        }, 1000);
        
      }).catch((injectionError) => {
        console.log('❌ Failed to inject scripts:', injectionError.message);
      });
    });
});

console.log('🔵 Background script setup complete');