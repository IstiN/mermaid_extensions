/**
 * Mermaid Diagram Detector
 * Shared logic for detecting Mermaid diagrams on web pages
 */

class MermaidDetector {
  constructor() {
    // Common patterns for Mermaid diagram detection
    this.mermaidPatterns = [
      /^\s*(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|pie|gantt|gitgraph|journey|timeline|mindmap|quadrantChart|requirement|erDiagram|C4Context|C4Container|C4Component|C4Dynamic|block-beta)/i,
      /^\s*```mermaid/i,
      /^\s*```\s*mermaid/i
    ];

    // Selectors for different platforms
    this.selectors = {
      // GitHub
      github: [
        'pre code.language-mermaid',
        'code[data-lang="mermaid"]',
        '.highlight-source-mermaid pre',
        '.blob-code-inner'
      ],
      // Confluence
      confluence: [
        '.code-block[data-language="mermaid"]',
        '.code-macro .code-block',
        'pre code',
        '.wiki-content pre'
      ],
      // Jira
      jira: [
        '.code-block',
        'pre code',
        '.wiki-textbox pre',
        '.comment-content pre'
      ],
      // Generic
      generic: [
        'pre code',
        'code',
        'pre',
        '.mermaid',
        '[class*="mermaid"]',
        '[data-lang="mermaid"]',
        '[data-language="mermaid"]'
      ]
    };
  }

  /**
   * Detect the current platform
   */
  detectPlatform() {
    const hostname = window.location.hostname.toLowerCase();
    
    if (hostname.includes('github.com') || hostname.includes('github.')) {
      return 'github';
    } else if (hostname.includes('atlassian.') || hostname.includes('confluence') || 
               document.querySelector('[data-confluence-space]') ||
               document.querySelector('.confluence-space')) {
      return 'confluence';
    } else if (hostname.includes('atlassian.') || hostname.includes('jira') ||
               document.querySelector('[data-jira-issue]') ||
               document.querySelector('.jira-issue')) {
      return 'jira';
    }
    
    return 'generic';
  }

  /**
   * Check if text contains Mermaid diagram syntax
   */
  isMermaidCode(text) {
    if (!text || typeof text !== 'string') return false;
    
    const trimmedText = text.trim();
    if (trimmedText.length < 5) return false;

    // Check for explicit mermaid code blocks
    if (trimmedText.startsWith('```mermaid') || trimmedText.includes('```mermaid')) {
      return true;
    }

    // Check for Mermaid diagram patterns
    return this.mermaidPatterns.some(pattern => pattern.test(trimmedText));
  }

  /**
   * Extract clean Mermaid code from various formats
   */
  extractMermaidCode(text) {
    if (!text) return '';

    let cleaned = text.trim();

    // Remove markdown code block wrapper
    cleaned = cleaned.replace(/^```\s*mermaid\s*\n?/i, '');
    cleaned = cleaned.replace(/\n?```\s*$/i, '');

    // Remove HTML entities
    cleaned = cleaned.replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'");

    return cleaned.trim();
  }

  /**
   * Find all potential Mermaid diagram elements on the page
   */
  findMermaidElements() {
    const platform = this.detectPlatform();
    console.log(`🔍 Detecting platform: ${platform}`);
    const selectors = [...this.selectors[platform], ...this.selectors.generic];
    const mermaidElements = [];
    const processedElements = new Set();

    // Search through all relevant selectors
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`🔍 Selector "${selector}" found ${elements.length} elements`);
        }
        elements.forEach(element => {
          // Avoid processing the same element multiple times
          if (processedElements.has(element)) return;
          processedElements.add(element);

          const text = element.textContent || element.innerText || '';
          
          if (this.isMermaidCode(text)) {
            const cleanCode = this.extractMermaidCode(text);
            if (cleanCode) {
              console.log(`✅ Found Mermaid diagram with selector "${selector}":`, cleanCode.substring(0, 100) + '...');
              mermaidElements.push({
                element: element,
                code: cleanCode,
                platform: platform,
                selector: selector
              });
            }
          }
        });
      } catch (error) {
        console.debug('MermaidDetector: Error with selector', selector, error);
      }
    });

    // Also check for data attributes and classes that might indicate Mermaid
    // BUT exclude our own extension elements
    const mermaidClassElements = document.querySelectorAll('[class*="mermaid"], [data-mermaid], .mermaid');
    mermaidClassElements.forEach(element => {
      if (processedElements.has(element)) return;
      
      // Skip our own extension elements
      if (element.classList.contains('mermaid-ext-button') || 
          element.classList.contains('mermaid-visualizer-modal') ||
          element.closest('.mermaid-visualizer-modal')) {
        return;
      }
      
      processedElements.add(element);

      const text = element.textContent || element.innerText || element.getAttribute('data-mermaid') || '';
      if (text && this.isMermaidCode(text)) {
        mermaidElements.push({
          element: element,
          code: this.extractMermaidCode(text) || text,
          platform: platform,
          selector: 'mermaid-class'
        });
      }
    });

    return mermaidElements;
  }

  /**
   * Monitor for dynamically added content
   */
  observeChanges(callback) {
    const observer = new MutationObserver((mutations) => {
      let hasNewContent = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && 
                !node.classList.contains('mermaid-ext-button') &&
                !node.classList.contains('mermaid-visualizer-modal')) {
              hasNewContent = true;
            }
          });
        }
      });

      if (hasNewContent) {
        // Debounce the callback to avoid too many calls
        clearTimeout(this.observerTimeout);
        this.observerTimeout = setTimeout(callback, 2000); // Increased debounce time
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  }
}

// Export for use in content scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MermaidDetector;
} else {
  window.MermaidDetector = MermaidDetector;
}