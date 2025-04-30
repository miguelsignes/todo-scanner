
---

### ✅ `CHANGELOG.md`

```md
# Changelog

---

## [1.1.0] - 2025-04-30

### ✨ New Features

- 📂 New **Tree View panel** in the Activity Bar:
  - Grouped by file
  - Click to open line directly
- ✅ **Auto-delete** now works for both `//` and `/* */` multi-line blocks
- 🎯 **Autocompletion** support:
  - Type `// TODO [` and get suggestions like `[HIGH]`, `[MEDIUM]`, `[LOW]`
- 🔁 **Auto-refresh** on file save
- 🔍 Improved regex detection for multiline TODOs
- 📦 Refactored and optimized scanning logic
- 🧠 Auto-enabled settings: no config needed for `autoDeleteOnDone`

### 🐛 Fixes

- 🛠 Fixed issue where marking a TODO as done removed all items from the same file
- 🛠 Fixed colors not rendering properly in the WebView
- 🛠 Fixed `"There is no data provider registered"` error

---

## [1.0.0] - 2025-04-28

### ✨ Initial full release

- ✅ Auto-scan and sidebar display
- ✅ Color-coded TODO, FIXME, HACK, and IDEA tags
- ✅ Open file on click, scroll to line
- ✅ Auto-delete on checkbox
- ✅ Multi-line comment support
- ✅ Settings for file types and folders
- 🌍 English and Spanish ready

---

## [0.0.1] - 2025-04-25

### 🚀 First working version

- Initial scanning of `.ts`, `.js`, `.scss`, `.html`
- Webview panel with list of TODOs
- Color tags and checkboxes
- Auto-delete on done
