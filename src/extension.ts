import * as vscode from 'vscode';
import { AICommandsManager, TerminalManager } from './keymaps';
import { ExtensionChecker } from './notifications/extension-checker';
import { SmartWebviewExtension } from './notifications/smart-checker-webview';

let aiManager: AICommandsManager | undefined;
let checkerManager: ExtensionChecker | undefined;
let webviewManager: SmartWebviewExtension | undefined;

export async function activate(context: vscode.ExtensionContext) {
  aiManager = new AICommandsManager();
  checkerManager = new ExtensionChecker();
  webviewManager = new SmartWebviewExtension();
  const terminalManager = new TerminalManager();

  aiManager.registerCommands(context);
  checkerManager.registerCheckCommands(context);
  webviewManager.registerWebviewCommands(context);
  terminalManager.registerCommands(context);
}

export async function deactivate() {
  aiManager?.dispose();
  checkerManager?.dispose();
  webviewManager?.dispose();
}
