# TODO Scanner 🚀

VS Code extension to automatically scan your project for:

- `// TODO:`
- `// FIXME:`
- `// HACK:`

And display them in a beautiful sidebar panel.

---

## ✨ Features

- ✅ Sidebar panel with grouped TODOs by file
- 🎨 Color coding for `TODO`, `FIXME`, and `HACK`
- 🔍 Click any TODO to jump to its location
- ☑️ Mark as "done" (checkbox)
- ✂️ Automatically deletes the TODO comment when marked as done
- 💾 Remembers which TODOs were marked as done between sessions
- ⚡ Auto-refreshes on file save

---

## 📸 Preview

> Coming soon...

---

## 🔧 Usage

1. Open a project with `TODO`, `FIXME`, or `HACK` comments
2. Open the **TODO Scanner** sidebar from the Activity Bar
3. Click to jump, check to mark as done (and auto-delete the comment!)

---

## 🛠 Development

```bash
npm install
npm run compile
vsce package
code --install-extension todo-scanner-0.0.1.vsix --force
```

---

## 📤 Publishing (for maintainers)

```bash
vsce login <publisher>
vsce publish patch|minor|major
```

---

## 📄 License

MIT © Miguel Signes