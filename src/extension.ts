// src/extension.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface TodoItem {
  file: string;
  line: number;
  tag: string;
  text: string;
  done?: boolean;
}

let savedState: Record<string, boolean> = {};

export function activate(context: vscode.ExtensionContext) {
  console.log('[TODO Scanner] Activando extensión...');
  const viewProvider = new TodoViewProvider(context.extensionUri, context);

  savedState = context.globalState.get<Record<string, boolean>>('todoScanner.done') || {};

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('todoScannerView', viewProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('todoScanner.showTodos', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.todoScanner');
      await viewProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async () => {
      await viewProvider.refresh();
    })
  );

  viewProvider.refresh();
}

class TodoViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly context: vscode.ExtensionContext
  ) {}

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    await this.refresh();

    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (message.command === 'open') {
        const fileUri = vscode.Uri.file(message.file);
        const doc = await vscode.workspace.openTextDocument(fileUri);
        const editor = await vscode.window.showTextDocument(doc);
        const pos = new vscode.Position(message.line - 1, 0);
        editor.selection = new vscode.Selection(pos, pos);
        editor.revealRange(new vscode.Range(pos, pos));
      } else if (message.command === 'toggleDone') {
        const key = `${message.file}:${message.line}`;
        savedState[key] = !savedState[key];
        await this.context.globalState.update('todoScanner.done', savedState);

        if (savedState[key]) {
          try {
            const fileUri = vscode.Uri.file(message.file);
            const doc = await vscode.workspace.openTextDocument(fileUri);
            const editor = await vscode.window.showTextDocument(doc, { preview: false });
            const targetLine = doc.lineAt(message.line - 1);
            const lineText = targetLine.text.trim();

            const isTodoLine = /^\/\/\s*(TODO|FIXME|HACK)\s*:/.test(lineText);
            if (isTodoLine) {
              await editor.edit(editBuilder => {
                editBuilder.delete(targetLine.range);
              });
              await doc.save();
            }
          } catch (err) {
            console.error('[TODO Scanner] Error al borrar el comentario:', err);
          }
        }

        await this.refresh();
      }
    });
  }

  public async refresh() {
    if (!this._view) return;
    const todos = await findTodos();
    this._view.webview.html = getWebviewContent(todos);
  }
}

async function findTodos(): Promise<TodoItem[]> {
  const todoItems: TodoItem[] = [];
  const files = await vscode.workspace.findFiles('**/*.{ts,js,html,scss}', '**/node_modules/**');

  for (const file of files) {
    const content = fs.readFileSync(file.fsPath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const match = line.match(/\b(TODO|FIXME|HACK)\s*:(.*)/);
      if (match) {
        const key = `${file.fsPath}:${index + 1}`;
        todoItems.push({
          file: file.fsPath,
          line: index + 1,
          tag: match[1],
          text: match[2].trim(),
          done: savedState[key] || false
        });
      }
    }
  }

  return todoItems;
}

function getWebviewContent(todos: TodoItem[]): string {
  const grouped = todos.reduce<Record<string, TodoItem[]>>((acc, todo) => {
    const fname = path.basename(todo.file);
    if (!acc[fname]) acc[fname] = [];
    acc[fname].push(todo);
    return acc;
  }, {});

  const fileBlocks = Object.entries(grouped).map(([filename, items]) => {
    const filteredItems = items
      .map(todo => {
        const normalizedPath = todo.file.replace(/\\/g, '/').replace(/'/g, "\\'");
        const colorClass = todo.tag === 'TODO' ? 'todo' : todo.tag === 'FIXME' ? 'fixme' : 'hack';
        const doneClass = todo.done ? 'done' : '';

        return `
          <li class="${colorClass} ${doneClass}">
            <input type="checkbox" ${todo.done ? 'checked' : ''} onchange="toggleDone('${normalizedPath}', ${todo.line})" />
            <a href="#" onclick="openTodo('${normalizedPath}', ${todo.line})">
              <strong>[${todo.tag}]</strong> ${todo.text}
              <em>(${filename}:${todo.line})</em>
            </a>
          </li>`;
      })
      .join('');

    return `<h4>${filename}</h4><ul>${filteredItems}</ul>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: sans-serif; padding: 10px; }
        ul { padding-left: 1em; }
        li { margin-bottom: 0.5em; list-style: none; }
        .todo strong { color: #4CAF50; }
        .fixme strong { color: #FF9800; }
        .hack strong { color: #F44336; }
        .done { text-decoration: line-through; opacity: 0.6; }
        em { color: #888; font-size: 0.85em; }
        h4 { margin-top: 1em; color: #1e90ff; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
        input[type="checkbox"] { margin-right: 0.5em; }
      </style>
    </head>
    <body>
      <h2>TODO Scanner</h2>
      ${fileBlocks}
      <script>
        const vscode = acquireVsCodeApi();
        function openTodo(file, line) {
          vscode.postMessage({ command: 'open', file, line });
        }
        function toggleDone(file, line) {
          vscode.postMessage({ command: 'toggleDone', file, line });
        }
      </script>
    </body>
    </html>
  `;
}