import * as vscode from 'vscode';

export class TerminalManager {
  private isTerminalMode = false;
  private originalTabsEnabled: boolean | undefined;
  private originalPanelShowLabels: boolean | undefined;

  public registerCommands(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('workbench');
    const terminalConfig = vscode.workspace.getConfiguration('terminal.integrated');

    const toggleTerminalDisposable = vscode.commands.registerCommand(
      'lynx-keymap.toggleTerminalLeft',
      async () => {
        try {
          if (!this.isTerminalMode) {
            this.originalTabsEnabled = terminalConfig.get<boolean>('tabs.enabled');
            this.originalPanelShowLabels = config.get<boolean>('panel.showLabels');

            await vscode.commands.executeCommand('workbench.action.terminal.focus');

            const sideBarLocation = config.get<string>('sideBar.location', 'left');

            if (sideBarLocation === 'left') {
              await vscode.commands.executeCommand('workbench.action.positionPanelRight');
            } else {
              await vscode.commands.executeCommand('workbench.action.positionPanelLeft');
            }

            await terminalConfig.update('tabs.enabled', false, vscode.ConfigurationTarget.Global);
            await config.update('panel.showLabels', false, vscode.ConfigurationTarget.Global);

            await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');

            this.isTerminalMode = true;
          } else {
            await vscode.commands.executeCommand('workbench.action.closePanel');

            await terminalConfig.update('tabs.enabled', this.originalTabsEnabled, vscode.ConfigurationTarget.Global);
            await config.update('panel.showLabels', this.originalPanelShowLabels, vscode.ConfigurationTarget.Global);

            await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');

            this.isTerminalMode = false;
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Terminal toggle failed: ${error}`);
        }
      }
    );

    context.subscriptions.push(toggleTerminalDisposable);
  }
}