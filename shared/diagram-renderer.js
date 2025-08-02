/**
 * Diagram Renderer
 * Handles rendering Mermaid diagrams and managing the UI
 */

class DiagramRenderer {
  constructor() {
    this.buttonId = 'mermaid-visualizer-btn';
    this.modalId = 'mermaid-visualizer-modal';
    this.loadedMermaid = false;
    this.mermaidVersion = '10.6.1';
  }

  /**
   * Initialize Mermaid library (now bundled locally)
   */
  async loadMermaid() {
    if (this.loadedMermaid) {
      return Promise.resolve();
    }

    // Mermaid is now loaded via content script, just initialize it
    if (window.mermaid) {
      console.log('🔧 Initializing Mermaid...');
      window.mermaid.initialize({ 
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Arial, sans-serif'
      });
      this.loadedMermaid = true;
      console.log('✅ Mermaid initialized successfully');
      return Promise.resolve();
    } else {
      console.log('❌ Mermaid library not available on window object');
      return Promise.reject(new Error('Mermaid library not available'));
    }
  }

  /**
   * Create a visualize button for a Mermaid code element
   */
  createVisualizeButton(mermaidData) {
    const button = document.createElement('button');
    button.className = `${this.buttonId} mermaid-ext-button`;
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      Visualize Mermaid
    `;
    button.title = 'Click to visualize this Mermaid diagram';
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showDiagram(mermaidData.code);
    });

    return button;
  }

  /**
   * Position button relative to the code element
   */
  positionButton(button, element) {
    const rect = element.getBoundingClientRect();
    const isFixed = this.isElementFixed(element);
    
    // Try to position the button in the top-right corner of the code block
    button.style.position = isFixed ? 'fixed' : 'absolute';
    button.style.top = (isFixed ? rect.top : rect.top + window.scrollY) + 'px';
    button.style.left = (isFixed ? rect.right - 140 : rect.right + window.scrollX - 140) + 'px';
    button.style.zIndex = '10000';
  }

  /**
   * Check if element or its parents have fixed positioning
   */
  isElementFixed(element) {
    let current = element;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      if (style.position === 'fixed') {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  /**
   * Add visualize button to a Mermaid element
   */
  addVisualizeButton(mermaidData) {
    const element = mermaidData.element;
    
    // Check if button already exists
    const existingButton = element.querySelector(`.${this.buttonId}`);
    if (existingButton) {
      return;
    }

    // Create and style the button
    const button = this.createVisualizeButton(mermaidData);
    
    // Different strategies for different platforms
    const platform = mermaidData.platform;
    
    if (platform === 'github') {
      this.addButtonToGitHub(element, button);
    } else if (platform === 'confluence') {
      this.addButtonToConfluence(element, button);
    } else if (platform === 'jira') {
      this.addButtonToJira(element, button);
    } else {
      this.addButtonGeneric(element, button);
    }
  }

  /**
   * Add button for GitHub
   */
  addButtonToGitHub(element, button) {
    // Try to add to the parent pre element or code block container
    const parent = element.closest('pre') || element.closest('.highlight') || element.parentElement;
    if (parent) {
      parent.style.position = 'relative';
      parent.appendChild(button);
      this.positionButton(button, parent);
    }
  }

  /**
   * Add button for Confluence
   */
  addButtonToConfluence(element, button) {
    const parent = element.closest('.code-block') || element.closest('pre') || element.parentElement;
    if (parent) {
      parent.style.position = 'relative';
      parent.appendChild(button);
      this.positionButton(button, parent);
    }
  }

  /**
   * Add button for Jira
   */
  addButtonToJira(element, button) {
    const parent = element.closest('.code-block') || element.closest('pre') || element.parentElement;
    if (parent) {
      parent.style.position = 'relative';
      parent.appendChild(button);
      this.positionButton(button, parent);
    }
  }

  /**
   * Generic button addition
   */
  addButtonGeneric(element, button) {
    const parent = element.parentElement;
    if (parent) {
      parent.style.position = 'relative';
      parent.appendChild(button);
      this.positionButton(button, parent);
    }
  }

  /**
   * Create and show a modal that cycles through all diagrams
   */
  async showAllDiagrams(mermaidCodes) {
    try {
      console.log('🎨 Visualizing', mermaidCodes.length, 'diagrams');
      
      if (!mermaidCodes || mermaidCodes.length === 0) {
        this.showError('No Mermaid diagrams found on this page.');
        return;
      }
      
      await this.loadMermaid();

      // Create or get the modal
      const modal = this.createMultiDiagramModal(mermaidCodes.length);
      document.body.appendChild(modal);
      
      let currentIndex = 0;
      const diagramContainer = modal.querySelector('.mermaid-diagram-container');
      const diagramCounter = modal.querySelector('.mermaid-diagram-counter');
      const prevButton = modal.querySelector('.mermaid-btn-prev');
      const nextButton = modal.querySelector('.mermaid-btn-next');

      // Function to render a specific diagram
      const render = async (index) => {
        if (index < 0 || index >= mermaidCodes.length) {
          return;
        }
        currentIndex = index;
        
        // Update counter
        diagramCounter.textContent = `${currentIndex + 1} / ${mermaidCodes.length}`;
        
        // Render diagram
        console.log('🎨 Rendering diagram', currentIndex + 1, 'of', mermaidCodes.length);
        await this.renderDiagram(mermaidCodes[currentIndex], diagramContainer);
        
        // Update button states
        if (prevButton) prevButton.disabled = currentIndex === 0;
        if (nextButton) nextButton.disabled = currentIndex === mermaidCodes.length - 1;
      };

      // Event listeners for navigation
      if (prevButton) prevButton.addEventListener('click', () => render(currentIndex - 1));
      if (nextButton) nextButton.addEventListener('click', () => render(currentIndex + 1));

      // Keydown navigation
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && prevButton) prevButton.click();
        if (e.key === 'ArrowRight' && nextButton) nextButton.click();
      });

      // Initial render
      await render(0);
      
      // Apply beautiful modal styles
      modal.setAttribute('style', `
        display: flex !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 2147483647 !important;
        background-color: rgba(0, 0, 0, 0.6) !important;
        backdrop-filter: blur(4px) !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        align-items: center !important;
        justify-content: center !important;
      `);
      
      // Style modal content beautifully  
      const modalContent = modal.querySelector('.mermaid-modal-content');
      if (modalContent) {
        modalContent.setAttribute('style', `
          width: 90vw !important;
          height: 90vh !important;
          max-width: 1200px !important;
          max-height: 800px !important;
          min-width: 600px !important;
          min-height: 400px !important;
          background: white !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3) !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
        `);
        console.log('✅ Beautiful modal styles applied');
      }
      
      modal.focus();
      console.log('🎉 Mermaid Extension: Modal displayed successfully!');

    } catch (error) {
      console.error('Error showing all diagrams:', error);
      this.showError('Failed to visualize diagrams: ' + error.message);
    }
  }

  /**
   * Create the modal for multiple diagrams
   */
  createMultiDiagramModal(count) {
    const existingModal = document.getElementById(this.modalId);
    if (existingModal) {
      existingModal.remove();
    }
      
    const modal = this.createModal();
    const header = modal.querySelector('.mermaid-modal-header');

    // Add navigation controls
    const navigation = document.createElement('div');
    navigation.className = 'mermaid-modal-navigation';
    navigation.innerHTML = `
      <button class="mermaid-btn mermaid-btn-prev" title="Previous (Left Arrow)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
      <span class="mermaid-diagram-counter">1 / ${count}</span>
      <button class="mermaid-btn mermaid-btn-next" title="Next (Right Arrow)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    `;
    header.insertBefore(navigation, header.querySelector('.mermaid-modal-controls'));

    return modal;
  }
  
  /**
   * Create and show the diagram modal
   */
  async showDiagram(mermaidCode) {
    await this.showAllDiagrams([mermaidCode]);
  }

  /**
   * Create the modal element
   */
  createModal() {
    const modal = document.createElement('div');
    modal.id = this.modalId;
    modal.className = 'mermaid-visualizer-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Mermaid Diagram Viewer');
    modal.tabIndex = -1;

    modal.innerHTML = `
      <div class="mermaid-modal-backdrop"></div>
      <div class="mermaid-modal-content">
        <div class="mermaid-modal-header">
          <h3>Mermaid Diagram</h3>
          <div class="mermaid-modal-controls">
            <button class="mermaid-btn mermaid-btn-new-tab" title="Open in New Tab">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15,3 21,3 21,9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </button>
            <button class="mermaid-btn mermaid-btn-download" title="Download as PNG">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <button class="mermaid-btn mermaid-btn-close" title="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="mermaid-diagram-container"></div>
      </div>
    `;

    // Add event listeners
    modal.querySelector('.mermaid-btn-close').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('.mermaid-modal-backdrop').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('.mermaid-btn-download').addEventListener('click', () => {
      this.downloadDiagram();
    });

    modal.querySelector('.mermaid-btn-new-tab').addEventListener('click', () => {
      this.openInNewTab();
    });

    // Close on Escape key
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modal.remove();
      }
    });

    return modal;
  }

  /**
   * Render the Mermaid diagram
   */
  async renderDiagram(code, container) {
    try {
      const id = 'mermaid-diagram-' + Date.now();
      container.innerHTML = `<div id="${id}">${code}</div>`;
      
      const { svg } = await window.mermaid.render(id + '-svg', code);
      container.innerHTML = svg;
      
      // Store the SVG and code for potential download/new tab
      this.currentSvg = svg;
      this.currentCode = code;
      
      console.log('✅ Diagram rendered successfully');
      
    } catch (error) {
      console.error('❌ Error rendering diagram:', error);
      container.innerHTML = `
        <div class="mermaid-error">
          <h4>Error rendering diagram:</h4>
          <p>${error.message}</p>
          <details>
            <summary>Mermaid Code</summary>
            <pre><code>${code}</code></pre>
          </details>
        </div>
      `;
      throw error;
    }
  }

  /**
   * Open diagram in mermaid.live with encoded URL
   */
  openInNewTab() {
    if (!this.currentCode) {
      console.error('No diagram code available to open');
      return;
    }

    try {
      // Generate mermaid.live URL with encoded diagram
      const mermaidUrl = this.generateMermaidLiveUrl(this.currentCode);
      
      // Open in new tab
      const newTab = window.open(mermaidUrl, '_blank');
      if (!newTab) {
        console.error('Failed to open new tab - popup blocked?');
      }
    } catch (error) {
      console.error('Error generating mermaid.live URL:', error);
    }
  }

  /**
   * Generate mermaid.live URL with pako compressed diagram code
   */
  generateMermaidLiveUrl(diagramCode) {
    try {
      // Check if pako is available
      if (typeof window.pako === 'undefined') {
        console.warn('Pako library not available, using fallback encoding');
        return this.generateFallbackUrl(diagramCode);
      }

      // Create the state object that mermaid.live expects
      const state = {
        code: diagramCode,
        mermaid: {
          theme: 'default'
        }
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(state);
      
      // Compress with pako (deflate)
      const compressed = window.pako.deflate(jsonString);
      
      // Convert to base64
      const base64 = btoa(String.fromCharCode.apply(null, compressed));
      
      // Create URL with pako prefix (view mode)
      return `https://mermaid.live/view#pako:${base64}`;
      
    } catch (error) {
      console.error('Error generating mermaid.live URL with pako:', error);
      return this.generateFallbackUrl(diagramCode);
    }
  }

  /**
   * Fallback URL generation without pako compression
   */
  generateFallbackUrl(diagramCode) {
    try {
      // Simple state object
      const state = {
        code: diagramCode,
        mermaid: {
          theme: 'default'
        }
      };
      
      const jsonString = JSON.stringify(state);
      const encoded = btoa(unescape(encodeURIComponent(jsonString)));
      
      return `https://mermaid.live/view#base64:${encoded}`;
    } catch (error) {
      console.error('Error in fallback encoding:', error);
      // Last resort - just encode the code directly
      const encoded = encodeURIComponent(diagramCode);
      return `https://mermaid.live/edit#code=${encoded}`;
    }
  }

  /**
   * Manual base64 encoding fallback
   */
  base64Encode(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = i < str.length ? str.charCodeAt(i++) : 0;
      const c = i < str.length ? str.charCodeAt(i++) : 0;
      
      const group = (a << 16) | (b << 8) | c;
      
      result += chars[(group >> 18) & 63];
      result += chars[(group >> 12) & 63];
      result += i - 2 < str.length ? chars[(group >> 6) & 63] : '=';
      result += i - 1 < str.length ? chars[group & 63] : '=';
    }
    
    return result;
  }

  /**
   * Download diagram as PNG
   */
  downloadDiagram() {
    if (!this.currentSvg) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `mermaid-diagram-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
        });
      };

      const svgBlob = new Blob([this.currentSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
      
    } catch (error) {
      console.error('Error downloading diagram:', error);
      this.showError('Failed to download diagram');
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'mermaid-error-toast';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 10001;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

// Export for use in content scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiagramRenderer;
} else {
  window.DiagramRenderer = DiagramRenderer;
}