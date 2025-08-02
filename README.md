# 🧜‍♀️ Mermaid Visualizer - Browser Extension

[![Build and Deploy](https://github.com/IstiN/mermaid_extensions/actions/workflows/deploy.yml/badge.svg)](https://github.com/IstiN/mermaid_extensions/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Transform Mermaid diagram code into beautiful visuals on any webpage with just one click!**

## ✨ Features

- ⚡ **One-click visualization** - Click the extension icon to find and visualize all Mermaid diagrams on the page
- 🌐 **Universal compatibility** - Works on GitHub, Confluence, Jira, GitLab, and any website with Mermaid code
- 🎨 **Beautiful rendering** - High-quality SVG diagrams with full zoom, pan, and navigation
- 🔗 **Mermaid.live integration** - Open diagrams directly in the official Mermaid.live editor
- 📱 **Mobile friendly** - Native browser zoom with pinch-to-zoom support
- 🔒 **Privacy first** - All processing happens locally in your browser
- 🎯 **Multi-diagram support** - Navigate between multiple diagrams on the same page
- 💾 **Export capabilities** - Download diagrams as SVG or open in Mermaid.live

## 🚀 Installation

### Chrome/Edge/Chromium
1. **From Chrome Web Store** (Coming Soon)
   - Visit the Chrome Web Store listing
   - Click "Add to Chrome"

2. **Manual Installation**
   - Download the latest `mermaid-visualizer-chrome.zip` from [Releases](https://github.com/IstiN/mermaid_extensions/releases)
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top-right toggle)
   - Click "Load unpacked" and select the extracted folder

### Safari (macOS)
1. **From Safari Extensions Gallery** (Coming Soon)
   - Visit the Safari Extensions Gallery listing
   - Click "Get"

2. **Manual Installation**
   - Download the latest `mermaid-visualizer-safari.zip` from [Releases](https://github.com/IstiN/mermaid_extensions/releases)
   - Open Safari → Preferences → Extensions
   - Enable "Developer mode"
   - Load the extension

## 🎯 How to Use

1. **Install the extension** for your browser
2. **Visit any webpage** containing Mermaid diagram code (GitHub, Confluence, Jira, etc.)
3. **Click the pink Mermaid icon** in your browser toolbar
4. **Enjoy beautiful diagrams!** Navigate, zoom, and export as needed

### Supported Platforms
- 🐙 **GitHub** - README files, issues, pull requests, wiki pages
- 📚 **Confluence** - Pages and blog posts
- 🎯 **Jira** - Issues, comments, descriptions  
- 📝 **GitLab** - README files, merge requests, wiki
- 📖 **Documentation sites** - GitBook, Notion, custom docs
- 🌐 **Any website** displaying Mermaid code in text format

## 🛠️ Development

### Project Structure
```
mermaid_extensions/
├── shared/                 # Shared code between browsers
│   ├── mermaid-detector.js # Detects Mermaid code on pages
│   ├── diagram-renderer.js # Renders and displays diagrams
│   ├── content.js          # Main content script
│   ├── styles.css          # Extension UI styles
│   ├── mermaid.min.js      # Mermaid library
│   ├── pako.min.js         # Compression library
│   └── icon.svg            # Source icon
├── chrome/                 # Chrome extension files
│   ├── manifest.json       # Chrome manifest (V3)
│   ├── background.js       # Service worker
│   └── icons/              # Chrome-specific icons
├── safari/                 # Safari extension files
│   ├── manifest.json       # Safari manifest (V2)
│   ├── background.js       # Background script
│   └── icons/              # Safari-specific icons
└── .github/workflows/      # CI/CD automation
```

### Setup Development Environment
```bash
# Clone the repository
git clone https://github.com/IstiN/mermaid_extensions.git
cd mermaid_extensions

# The extension is ready to use - no build step required!
# Load chrome/ or safari/ directory directly in your browser
```

### Making Changes
1. Edit files in the `shared/` directory for cross-browser changes
2. Browser-specific changes go in `chrome/` or `safari/` directories
3. Test changes by reloading the extension in your browser
4. The GitHub Actions workflow will automatically build and deploy when you push to main

### Architecture
- **Shared codebase** - Common functionality in `shared/` directory
- **Content scripts** - Injected into web pages to detect and render diagrams
- **Background scripts** - Handle extension icon clicks and script injection
- **No build process** - Pure JavaScript, ready to load directly

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** in the `shared/` directory for cross-browser compatibility
4. **Test thoroughly** on both Chrome and Safari
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines
- Keep code in `shared/` directory for maximum compatibility
- Test on both Chrome and Safari browsers
- Follow existing code style and patterns
- Add comments for complex functionality
- Update README if adding new features

## 📋 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Manifest V3, latest features |
| Edge | ✅ Full | Chromium-based, same as Chrome |
| Firefox | 🚧 Planned | Firefox manifest adaptation needed |
| Safari | ✅ Full | Manifest V2, macOS only |
| Opera | ✅ Likely | Chromium-based, should work |

## 🔧 Technical Details

### Content Security Policy
The extension includes its own bundled version of Mermaid.js and Pako compression library to avoid CSP restrictions on external CDNs.

### Permissions
- `activeTab` - Access current tab content to detect diagrams
- `scripting` - Inject content scripts when needed
- `storage` - Save user preferences (future feature)

### Privacy
- **No data collection** - Extension processes everything locally
- **No external requests** - All libraries are bundled locally
- **No tracking** - Zero telemetry or analytics

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Mermaid.js](https://mermaid.js.org/)** - The amazing diagramming library that makes this possible
- **[Mermaid.live](https://mermaid.live/)** - Official Mermaid editor integration
- **[Pako](https://github.com/nodeca/pako)** - Compression library for URL encoding

## 📞 Support

- 🐛 **Bug reports**: [Create an issue](https://github.com/IstiN/mermaid_extensions/issues)
- 💡 **Feature requests**: [Create an issue](https://github.com/IstiN/mermaid_extensions/issues)
- 💬 **Questions**: [Start a discussion](https://github.com/IstiN/mermaid_extensions/discussions)
- 📧 **Contact**: [Email us](mailto:your-email@example.com)

---

<div align="center">

**Made with ❤️ for the developer community**

[🌐 Website](https://IstiN.github.io/mermaid_extensions) • [📦 Downloads](https://IstiN.github.io/mermaid_extensions/downloads.html) • [🚀 Releases](https://github.com/IstiN/mermaid_extensions/releases)

</div>