import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TodoTreeProvider } from './TodoTreeProvider';
import { TodoItem } from './interfaces/todo-intefaces';

let viewProvider: TodoViewProvider | null = null;
let treeProvider: TodoTreeProvider | null = null;

export async function activate(context: vscode.ExtensionContext) {

  viewProvider = new TodoViewProvider(context.extensionUri, context.globalState);
  treeProvider = new TodoTreeProvider();

  vscode.window.registerTreeDataProvider('todoScannerTree', treeProvider);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('todoScannerView', viewProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('todoScanner.showTodos', async () => {
      await viewProvider?.refresh();
    })
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { language: '*' }, 
      new TodoCompletionProvider(),
      '[', ' ' 
    )
  );
  

  const todos = await findTodos();
  treeProvider.refresh(groupByFile(todos));

  vscode.workspace.onDidSaveTextDocument(async () => {
    const todos = await findTodos();
    const grouped = groupByFile(todos);
    treeProvider?.refresh(grouped); 
    await viewProvider?.refresh(); 
  });
}

export function deactivate() {}




class TodoCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] | undefined {
    const line = document.lineAt(position).text;
    if (!line.trim().match(/\/\/\s*(TODO|FIXME|HACK|IDEA)/i))
      { return;
      }
    const existingTag = line.match(/\[(HIGH|MEDIUM|LOW)\]/i);
    if (existingTag) { return;  }
    const levels = ['[HIGH]', '[MEDIUM]', '[LOW]'];
    return levels.map(level => {
      const item = new vscode.CompletionItem(level, vscode.CompletionItemKind.Keyword);
      item.insertText = `${level} `;
      item.sortText = 'a';
      return item;
    });
  }
}




class TodoViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;
  private _state: vscode.Memento;
  private doneKeys = new Set<string>();

  

  constructor(extensionUri: vscode.Uri, globalState: vscode.Memento) {
    this._extensionUri = extensionUri;
    this._state = globalState;
    this.loadDone();
  }


  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
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
        if (this.doneKeys.has(key)) {
          this.doneKeys.delete(key);
        } else {
          this.doneKeys.add(key);
          await deleteTodoBlock(message.file, message.line);
        }
        this.saveDone();
        await this.refresh();
      }
    });
  }

  private loadDone() {
    const saved = this._state.get<string[]>('todoScanner.done') || [];
    this.doneKeys = new Set(saved);
  }

  private saveDone() {
    this._state.update('todoScanner.done', [...this.doneKeys]);
  }

  public async refresh() {
    if (!this._view) { return; } 
    const todos = await findTodos();
    this.cleanupDone(todos);
    this._view.webview.html = getWebviewContent(todos, this.doneKeys);
  }

  private cleanupDone(currentTodos: TodoItem[]) {
    const existingKeys = new Set(currentTodos.map(t => `${t.file}:${t.line}`));
    for (const key of [...this.doneKeys]) {
      if (!existingKeys.has(key)) {
        this.doneKeys.delete(key);
      }
    }
    this.saveDone();
  }
}



async function findTodos(): Promise<TodoItem[]> {
  const config = vscode.workspace.getConfiguration('todoScanner');
  const patterns = config.get<string[]>('includeFileTypes') || ['ts', 'tsx', 'js', 'jsx', 'html', 'scss', 'md', 'py'];
  const files = await vscode.workspace.findFiles(`**/*.{${patterns.join(',')}}`, '**/{node_modules,bower_components,dist,out,build,*.map,*.min.*}/**');

  const todoItems: TodoItem[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file.fsPath, 'utf8');
    const lines = content.split(/\r?\n/);

    let currentTodo: TodoItem | null = null;
    let insideBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const singleLineMatch = line.match(/(\/\/|\/\*)\s*(TODO|FIXME|HACK|IDEA)\b[:\s]?(.*)/i);
      const blockStartMatch = line.match(/\/\*\s*(TODO|FIXME|HACK|IDEA)\b[:\s]?(.*)/i);
      const blockEndMatch = line.match(/\*\//);

      if (singleLineMatch) {
      
        if (currentTodo) {
          todoItems.push(currentTodo);
        }
        currentTodo = {
          file: file.fsPath,
          line: i + 1,
          tag: singleLineMatch[2].toUpperCase(),
          text: singleLineMatch[3]?.trim() || ''
        };
      } else if (blockStartMatch) {

        if (currentTodo) {
          todoItems.push(currentTodo);
        }
        currentTodo = {
          file: file.fsPath,
          line: i + 1,
          tag: blockStartMatch[1].toUpperCase(),
          text: blockStartMatch[2]?.trim() || ''
        };
        insideBlock = true;
      } else if (insideBlock) {

        if (blockEndMatch) {
          insideBlock = false;
          if (currentTodo) {
            currentTodo.text += ' ' + line.replace('*/', '').trim();
            todoItems.push(currentTodo);
            currentTodo = null;
          }
        } else {
          if (currentTodo) {
            currentTodo.text += ' ' + line.replace('*', '').trim();
          }
        }
      } else if (currentTodo && line.trim().startsWith('//')) {

        currentTodo.text += ' ' + line.replace('//', '').trim();
      } else {
        if (currentTodo) {
          todoItems.push(currentTodo);
          currentTodo = null;
        }
      }
    }

    if (currentTodo) {
      todoItems.push(currentTodo);
    }
  }

  return todoItems;
}

async function deleteTodoBlock(filePath: string, lineNumber: number) {
  const fileUri = vscode.Uri.file(filePath);
  const doc = await vscode.workspace.openTextDocument(fileUri);
  const editor = await vscode.window.showTextDocument(doc, { preview: false });

  await editor.edit(editBuilder => {
    const startLine = lineNumber - 1;
    let endLine = startLine;

    const firstLine = doc.lineAt(startLine).text;


    if (firstLine.match(/\/\*\s*(TODO|FIXME|HACK|IDEA)\b/i)) {
      for (let i = startLine; i < doc.lineCount; i++) {
        const line = doc.lineAt(i).text;
        if (line.match(/\*\//)) {
          endLine = i;
          break;
        }
      }
    }

    else if (firstLine.match(/\/\/\s*(TODO|FIXME|HACK|IDEA)\b/i)) {
      for (let i = startLine; i < doc.lineCount; i++) {
        const line = doc.lineAt(i).text;
        if (i > startLine && !line.trim().startsWith('//')) {
          endLine = i - 1;
          break;
        }
        endLine = i;
      }
    }


    if (endLine < doc.lineCount - 1) {
      endLine += 1; 
    } else if (endLine === doc.lineCount - 1) {

      const range = new vscode.Range(startLine, 0, endLine + 1, 0);
      if (range.isEmpty) {
        return;
      } 
      editBuilder.delete(range);
      return;
    }

    const range = new vscode.Range(startLine, 0, endLine, doc.lineAt(endLine).text.length);
    editBuilder.delete(range);
  });

  await doc.save();
}
function getWebviewContent(todos: TodoItem[], doneKeys: Set<string>): string {
  const grouped = groupByFile(todos);
  const tags = ['TODO', 'FIXME', 'HACK', 'IDEA'];

  const fileBlocks = Object.entries(grouped).map(([file, todos]) => `
    <details open>
      <summary style="color:#4FC3F7;">${path.basename(file)}</summary>
      <ul>
        ${todos.map(todo => {
          const key = `${todo.file}:${todo.line}`;
          const doneClass = doneKeys.has(key) ? 'done' : '';
          const tagClass = todo.tag.toLowerCase();
          return `
            <li class="todo-item ${doneClass} ${tagClass}">
              <input type="checkbox" id="todo-${key}" ${doneClass ? 'checked' : ''} onchange="toggleDone('${todo.file.replace(/\\/g, '/').replace(/'/g, "\\'")}', ${todo.line})">
              <label for="todo-${key}">
                <strong>[${todo.tag}]</strong> ${todo.text} <em>(línea ${todo.line})</em>
              </label>
              <button class="open-btn" onclick="openTodo('${todo.file.replace(/\\/g, '/').replace(/'/g, "\\'")}', ${todo.line})">🔎</button>
            </li>
          `;
        }).join('')}
      </ul>
    </details>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: sans-serif; padding: 10px; background-color: #1e1e1e; color: #ccc; }
        ul { padding-left: 1em; }
        li { margin-bottom: 0.5em; list-style: none; }
        .todo strong { color: #4CAF50; }
        .fixme strong { color: #FF9800; }
        .hack strong { color: #F44336; }
        .idea strong { color: #2196F3; }
        .done { text-decoration: line-through; opacity: 0.6; }
        em { color: #888; font-size: 0.85em; }
        .open-btn { margin-left: 8px; background: none; border: none; color: #4FC3F7; cursor: pointer; }
      </style>
    </head>
    <body>
      <h2>TODO Scanner (${todos.length})</h2>
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



function groupByFile(todos: TodoItem[]): Record<string, TodoItem[]> {
  const grouped: Record<string, TodoItem[]> = {};
  for (const todo of todos) {
    if (!grouped[todo.file]) {
      grouped[todo.file] = [];
    }
    grouped[todo.file].push(todo);
  }
  return grouped;
}








