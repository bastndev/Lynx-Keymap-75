import * as vscode from 'vscode';

export class TerminalManager {
  private isTerminalLeftMode = false;

  public registerCommands(context: vscode.ExtensionContext) {
    const toggleTerminalLeftDisposable = vscode.commands.registerCommand(
      'lynx-keymap.toggleTerminalLeft',
      async () => {
        if (!this.isTerminalLeftMode) {
          // 1. Ensure the terminal opens and gets focused
          await vscode.commands.executeCommand('workbench.action.terminal.focus');
          
          // 2. Move the panel to the left side
          await vscode.commands.executeCommand('workbench.action.positionPanelLeft');
          
          // 3. Close the AI chat
          await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
          
          this.isTerminalLeftMode = true;
        } else {
          // 1. Close the panel (where the terminal is)
          await vscode.commands.executeCommand('workbench.action.closePanel');
          
          // 2. Open the AI chat
          await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
          
          this.isTerminalLeftMode = false;
        }
      }
    );

    context.subscriptions.push(toggleTerminalLeftDisposable);
  }
}