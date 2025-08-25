# ✨ Personal New Tab Dashboard

A beautiful, responsive dashboard designed to replace your browser's new tab page. Features a clean design with animated gradients, customizable shortcuts, and multiple dark themes.

## 🌟 Features

- **🎨 Beautiful Animated Gradients** - 10 stunning dark themes to choose from
- **⚡ Quick Search** - Google search integration with keyboard shortcut (`/`)
- **📱 Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- **🔧 Easy Customization** - Add unlimited shortcuts by editing `data.js`
- **⌚ Live Clock & Date** - Always know the current time
- **🎯 Minimalist Icons** - Clean geometric symbols for a premium look
- **⚙️ Settings Sidebar** - Dark mode toggle and theme switcher
- **🚀 Lightning Fast** - Pure HTML/CSS/JavaScript, no frameworks

## 🚀 Quick Start

1. **Fork this repository** or click "Use this template"
2. **Enable GitHub Pages** in Settings → Pages → Deploy from branch `main`
3. **Set as your browser start page** using the GitHub Pages URL
4. **Customize shortcuts** by editing `data.js`

## 📁 File Structure

```
├── index.html      # Main HTML structure
├── style.css       # All styling and animations
├── script.js       # JavaScript functionality
├── data.js         # Shortcuts configuration
└── README.md       # This file
```

## 🎨 Customization

### Adding Shortcuts

Edit `data.js` and add entries to the shortcuts array:

```javascript
{ name: "Your App", url: "https://yourapp.com", icon: "⚡" }
```

### Available Icons

Use these clean geometric symbols:
- **Shapes**: ◆ ◈ ◉ ◯ ◻ ● ◐ ◢
- **Arrows**: ▶ ▲ ▼ ◀ ➤ ➜
- **Symbols**: ⚡ ✦ ✧ ⭐ ♫ ✉ ⚙

### Adding Themes

Add new themes in `script.js` under the `themes` object:

```javascript
'your-theme': 'linear-gradient(-45deg, #color1, #color2, #color3, #color4)'
```

## 🎯 Keyboard Shortcuts

- **`/`** - Focus search bar instantly
- **`Escape`** - Close settings sidebar
- **`Tab`** - Navigate through shortcuts

## 🌐 Browser Setup

### Chrome
1. Settings → On startup → Open specific pages
2. Add your GitHub Pages URL

### Firefox  
1. Settings → Home → Homepage and new windows
2. Set to "Custom URLs" with your GitHub Pages URL

### Safari
1. Preferences → General → Homepage
2. Set to your GitHub Pages URL

## 📱 Mobile Friendly

The dashboard is fully responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets  
- 💻 Desktop computers
- 🖥️ Large screens

## 🎨 Themes

Choose from 10 beautiful dark gradient themes:
- **Default** - Blue-purple classic
- **Forest** - Dark green-teal  
- **Charcoal** - Industrial gray-blue
- **Midnight** - Professional navy
- **Obsidian** - Volcanic black-gray
- **Deep Ocean** - Oceanic depths
- **Dark Teal** - Modern purple-teal
- **Purple Teal** - Deep purple-cyan
- **Deep Blue** - Corporate black-blue
- **Dark Purple** - Mystical purple-magenta

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Share your customizations

## 📄 License

MIT License - feel free to use this for personal or commercial projects!

## ⭐ Show Your Support

If you like this project, please give it a star! It helps others discover it.

---

**Made with ❤️ for productivity and beautiful design**