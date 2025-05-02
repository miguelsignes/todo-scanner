import * as vscode from 'vscode';
import * as path from 'path';
import { TodoItemTree, TodoItem } from './interfaces/todo-intefaces';

export class TodoTreeProvider implements vscode.TreeDataProvider<TodoItemTree> {
    private todosByFile: Record<string, TodoItem[]> = {};
    private _onDidChangeTreeData: vscode.EventEmitter<TodoItemTree | undefined | void> = new vscode.EventEmitter();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  
    refresh(grouped: Record<string, TodoItem[]>) {
      this.todosByFile = grouped;
      this._onDidChangeTreeData.fire();
    }
  getTreeItem(element: TodoItemTree): vscode.TreeItem {
    return element;
  }


  getChildren(element?: TodoItemTree): Thenable<TodoItemTree[]> {
    if (!element) {
      const files = Object.keys(this.todosByFile);
      return Promise.resolve(
        files.map(file => new TodoItemTree(
          vscode.workspace.asRelativePath(file),
          vscode.TreeItemCollapsibleState.Collapsed,
          vscode.Uri.file(file)
        ))
      );
    } else {
      const todos = Object.entries(this.todosByFile)
        .find(([key]) => path.resolve(key) === path.resolve(element.resourceUri?.fsPath || ''))?.[1] || [];
  
        return Promise.resolve(
          todos.map(todo => new TodoItemTree(
            `[${todo.tag}] ${todo.text}`,
            vscode.TreeItemCollapsibleState.None,
            vscode.Uri.file(todo.file),
            todo.line,
            `File: ${path.basename(todo.file)}\nLine: ${todo.line}\n${todo.text}`
          ))
        );
    }
  }
  
}