// src/extension.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let viewProvider: TodoViewProvider | null = null;

export function activate(context: vscode.ExtensionContext) {
  viewProvider = new TodoViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('todoScannerView', viewProvider)
  );

  vscode.workspace.onDidSaveTextDocument(async () => {
    if (viewProvider) {
      viewProvider.refresh();
    }
  });
}

export function deactivate() {}

class TodoViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this._extensionUri = extensionUri;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    this.refresh();

    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (message.command === 'open') {
        const fileUri = vscode.Uri.file(message.file);
        const doc = await vscode.workspace.openTextDocument(fileUri);
        const editor = await vscode.window.showTextDocument(doc);
        const pos = new vscode.Position(message.line - 1, 0);
        editor.selection = new vscode.Selection(pos, pos);
        editor.revealRange(new vscode.Range(pos, pos));
      }
    });
  }

  public async refresh() {
    if (!this._view) {
      return;
    }

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

    lines.forEach((line, index) => {
      const match = line.match(/\b(TODO|FIXME|HACK)\s*:(.*)/);
      if (match) {
        todoItems.push({
          file: file.fsPath,
          line: index + 1,
          tag: match[1],
          text: match[2].trim()
        });
      }
    });
  }

  return todoItems;
}

function getWebviewContent(todos: TodoItem[]): string {
  const items = todos.map(todo => `
    <li>
      <a href="#" onclick="openTodo('${todo.file.replace(/'/g, "\\'")}', ${todo.line})">
        <strong>[${todo.tag}]</strong> ${todo.text} <em>(${path.basename(todo.file)}:${todo.line})</em>
      </a>
    </li>`).join('');

  return `
    <html>
    <body>
      <h2>TODO Scanner</h2>
      <ul>${items}</ul>
      <script>
        const vscode = acquireVsCodeApi();
        function openTodo(file, line) {
          vscode.postMessage({ command: 'open', file, line });
        }
      </script>
    </body>
    </html>
  `;
}

type TodoItem = {
  file: string;
  line: number;
  tag: string;
  text: string;
};
