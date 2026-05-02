import * as vscode from 'vscode';
import { AICommandsManager, BottomTerminalManager, TerminalManager, AIToggleManager } from './keymaps';

let aiManager:             AICommandsManager     | undefined;
let terminalManager:       TerminalManager       | undefined;
let bottomTerminalManager: BottomTerminalManager | undefined;
let aiToggleManager:       AIToggleManager       | undefined;

export async function activate(context: vscode.ExtensionContext) {
  aiManager             = new AICommandsManager();
  terminalManager       = new TerminalManager();
  bottomTerminalManager = new BottomTerminalManager();
  aiToggleManager       = new AIToggleManager();

  aiManager.registerCommands(context);
  terminalManager.registerCommands(context);
  bottomTerminalManager.registerCommands(context);
  aiToggleManager.registerCommands(context);

  await context.workspaceState.update('lynx-keymap:lastActiveMode',          undefined);
  await context.workspaceState.update('lynx-keymap:originalTabsEnabled',     undefined);
  await context.workspaceState.update('lynx-keymap:originalPanelShowLabels', undefined);
}

export async function deactivate() {
  aiManager?.dispose();
  terminalManager?.dispose();
  bottomTerminalManager?.dispose();
  aiToggleManager?.dispose();
}
