# 📝 Todo Scanner

A powerful yet simple Visual Studio Code extension to track and manage your `TODO`, `FIXME`, `HACK`, and `IDEA` comments across your project.

---

## 🚀 Features

- 🔍 **Auto-scans all project files** for `TODO`, `FIXME`, `HACK`, and `IDEA` tags.
- 🗂️ **Organized by file**, displayed in a collapsible sidebar tree.
- ✅ **Checkbox to mark items as done**, with automatic removal.
- 🖍️ **Color-coded tags**:
  - ✅ `TODO` → Green
  - 🛠️ `FIXME` → Orange
  - 🐞 `HACK` → Red
  - 💡 `IDEA` → Blue
- 🧠 **Multi-line comment support** (`//` and `/* */`).
- 🧹 **Auto-delete on done** is enabled by default.
- 🧭 **Auto-focus and scroll to comment line** when clicked.
- ⚙️ **Custom file filters** and file types.
- 🌐 **Multi-language support** (English and Spanish).
- 💡 **Smart autocompletion** for `[HIGH]`, `[MEDIUM]`, `[LOW]` priorities.
- 📁 **Tree view of TODOs grouped by file**.

---

## 📸 Screenshots

> _Coming soon!_

---

## ⚙️ Settings

You can override default settings via `settings.json`:

```json
{
  "todoScanner.autoDeleteOnDone": true,
  "todoScanner.includeFileTypes": ["ts", "tsx", "js", "jsx", "html", "scss", "md", "py"]
}
