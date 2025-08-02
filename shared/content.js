/**
 * Content Script for Mermaid Extensions
 * Main entry point that coordinates detection and rendering
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.mermaidExtensionInitialized) {
    return;
  }
  window.mermaidExtensionInitialized = true;

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
  } else {
    initializeExtension();
  }

  function initializeExtension() {
    try {
      console.log('🟡 Mermaid Extension: Starting initialization...');
      
      // Initialize detector and renderer
      const detector = new MermaidDetector();
      const renderer = new DiagramRenderer();

      // Process existing content
      processPage();

      // Set up observer for dynamic content
      const observer = detector.observeChanges(() => {
        processPage();
      });

      // Store instances for potential cleanup
      window.mermaidExtension = {
        detector,
        renderer,
        observer,
        cleanup: () => {
          if (observer) observer.disconnect();
          removeMermaidButtons();
        }
      };

      console.log('✅ Mermaid Extension: Initialized successfully');

      function processPage() {
        try {
          const mermaidElements = detector.findMermaidElements();
          console.log(`🔍 Mermaid Extension: Found ${mermaidElements.length} Mermaid diagrams`);

          mermaidElements.forEach(mermaidData => {
            try {
              renderer.addVisualizeButton(mermaidData);
            } catch (error) {
              console.error('❌ Mermaid Extension: Error adding button to element:', error, mermaidData);
            }
          });
        } catch (error) {
          console.error('❌ Mermaid Extension: Error processing page:', error);
        }
      }

      function removeMermaidButtons() {
        const buttons = document.querySelectorAll('.mermaid-visualizer-btn');
        buttons.forEach(button => button.remove());
        
        const modals = document.querySelectorAll('#mermaid-visualizer-modal');
        modals.forEach(modal => modal.remove());
      }

    } catch (error) {
      console.error('Mermaid Extension: Failed to initialize:', error);
    }
  }

  // Handle page navigation (for SPAs)
  let currentUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      // Small delay to allow page to load
      setTimeout(() => {
        if (window.mermaidExtension) {
          window.mermaidExtension.detector.findMermaidElements().forEach(mermaidData => {
            window.mermaidExtension.renderer.addVisualizeButton(mermaidData);
          });
        }
      }, 1000);
    }
  }).observe(document, { subtree: true, childList: true });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (window.mermaidExtension && window.mermaidExtension.cleanup) {
      window.mermaidExtension.cleanup();
    }
  });

  // Listen for messages from popup and background script
  if (chrome.runtime && chrome.runtime.onMessage) {
    console.log('🔵 Mermaid Extension: Setting up message listener...');
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      try {
        console.log('📨 Mermaid Extension: Received message:', request);
        
        if (request.action === 'getDiagramCount') {
          const count = window.mermaidExtension ? 
            window.mermaidExtension.detector.findMermaidElements().length : 0;
          console.log('📊 Diagram count requested:', count);
          sendResponse({ count: count });
          
          // Update badge
          chrome.runtime.sendMessage({ 
            action: 'updateBadge', 
            count: count 
          }).catch(() => {
            // Ignore errors if background script is not available
          });
        }
        
        if (request.action === 'rescanPage') {
          console.log('🔄 Rescanning page...');
          processPage();
          const count = window.mermaidExtension ? 
            window.mermaidExtension.detector.findMermaidElements().length : 0;
          sendResponse({ count: count });
        }
        
        
        if (request.action === 'visualizeAll') {
          console.log('👁️ Visualize all diagrams requested...');
          if (window.mermaidExtension && window.mermaidExtension.renderer) {
            const mermaidElements = window.mermaidExtension.detector.findMermaidElements();
            const codes = mermaidElements.map(data => data.code);
            console.log(`🎨 Found ${codes.length} diagrams to visualize:`, codes);
            window.mermaidExtension.renderer.showAllDiagrams(codes);
            sendResponse({ success: true, count: codes.length });
          } else {
            console.log('❌ Extension not initialized yet');
            sendResponse({ success: false, error: 'Extension not initialized' });
          }
        }
        
        if (request.action === 'visualizeSelection') {
          if (window.mermaidExtension && window.mermaidExtension.renderer) {
            const text = request.text;
            if (window.mermaidExtension.detector.isMermaidCode(text)) {
              const cleanCode = window.mermaidExtension.detector.extractMermaidCode(text);
              window.mermaidExtension.renderer.showDiagram(cleanCode);
              sendResponse({ success: true });
            } else {
              sendResponse({ success: false, error: 'Not valid Mermaid code' });
            }
          }
        }
        
        if (request.action === 'toggleVisualization') {
          // Toggle visibility of all Mermaid buttons
          const buttons = document.querySelectorAll('.mermaid-visualizer-btn');
          buttons.forEach(button => {
            button.style.display = button.style.display === 'none' ? 'inline-flex' : 'none';
          });
          sendResponse({ success: true });
        }
        
      } catch (error) {
        console.error('Mermaid Extension: Error handling message:', error);
        sendResponse({ success: false, error: error.message });
      }
    });
  }

})();