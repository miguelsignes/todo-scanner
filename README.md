# 📝 Todo Scanner

An extension for Visual Studio Code that automatically scans your project files for `TODO`, `FIXME`, `HACK`, and `IDEA` comments, displaying them grouped neatly in a sidebar view.

---

## 🚀 Features

- **Scans all your project files** for `TODO`, `FIXME`, `HACK`, and `IDEA` comments.
- **Supports both single-line** (`// TODO`) **and multi-line** (`/* TODO ... */`) comments.
- **Automatically deletes** the entire block when marking as done.
- **Color-coded tags** for better visibility:
  - ✅ TODO → Green
  - 🛠️ FIXME → Orange
  - 🐞 HACK → Red
  - 💡 IDEA → Blue
- **Opens the file and highlights** the comment line when clicked.
- **Auto-excludes** unwanted files and folders like `node_modules`, `dist`, `.map`, `.min.js`, `.json`, etc.
- **No configuration needed**: Auto-delete is enabled by default.


---

## 🛠️ Configuration

```json
{
  "todoScanner.autoDeleteOnDone": true,
  "todoScanner.includeFileTypes": ["ts", "tsx", "js", "jsx", "html", "scss", "json", "md", "py"]
}
