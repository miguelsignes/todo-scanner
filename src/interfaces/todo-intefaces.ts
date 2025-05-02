import * as vscode from 'vscode';
import * as path from 'path';

export class TodoItemTree extends vscode.TreeItem {
  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly resourceUri?: vscode.Uri,
    public readonly line?: number,
    tooltipText?: string
  ) {
    super(label, collapsibleState);
    this.tooltip = tooltipText || label; // Aquí va el texto del tooltip
    this.command = line !== undefined ? {
      command: 'vscode.open',
      title: 'Open TODO',
      arguments: [resourceUri, { selection: new vscode.Range(line - 1, 0, line - 1, 0) }]
    } : undefined;
  }
}


export interface TodoItem {
  file: string;
  line: number;
  tag: string;
  text: string;
}

