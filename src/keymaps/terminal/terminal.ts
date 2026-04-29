import * as vscode from 'vscode';

export class TerminalManager {
  private isTerminalMode = false;

  public registerCommands(context: vscode.ExtensionContext) {
    const toggleTerminalDisposable = vscode.commands.registerCommand(
      'lynx-keymap.toggleTerminalLeft',
      async () => {
        if (!this.isTerminalMode) {
          // 1. Ensure the terminal opens and gets focused
          await vscode.commands.executeCommand('workbench.action.terminal.focus');
          
          // 2. Intelligently position the panel opposite to the sidebar
          const config = vscode.workspace.getConfiguration('workbench');
          const sideBarLocation = config.get<string>('sideBar.location', 'left');
          const terminalConfig = vscode.workspace.getConfiguration('terminal.integrated');
          
          if (sideBarLocation === 'left') {
            await vscode.commands.executeCommand('workbench.action.positionPanelRight');
          } else {
            await vscode.commands.executeCommand('workbench.action.positionPanelLeft');
          }

          // Hide tabs and panel labels for a cleaner lateral terminal
          await terminalConfig.update('tabs.enabled', false, vscode.ConfigurationTarget.Global);
          await config.update('panel.showLabels', false, vscode.ConfigurationTarget.Global);
          
          // 3. Close the AI chat
          await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
          
          this.isTerminalMode = true;
        } else {
          // 1. Close the panel (where the terminal is)
          await vscode.commands.executeCommand('workbench.action.closePanel');
          
          // Restore tabs and panel labels to default
          const config = vscode.workspace.getConfiguration('workbench');
          const terminalConfig = vscode.workspace.getConfiguration('terminal.integrated');
          await terminalConfig.update('tabs.enabled', undefined, vscode.ConfigurationTarget.Global);
          await config.update('panel.showLabels', undefined, vscode.ConfigurationTarget.Global);
          
          // 2. Open the AI chat
          await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
          
          this.isTerminalMode = false;
        }
      }
    );

    context.subscriptions.push(toggleTerminalDisposable);
  }
}