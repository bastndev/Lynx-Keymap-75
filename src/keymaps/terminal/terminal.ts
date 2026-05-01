import * as vscode from 'vscode';

const STATE_KEY = 'lynx-keymap:isTerminalMode';

export class TerminalManager {
  private isTerminalMode = false;

  public registerCommands(context: vscode.ExtensionContext) {
    this.isTerminalMode = context.workspaceState.get<boolean>(STATE_KEY, false);

    const toggleTerminalDisposable = vscode.commands.registerCommand(
      'lynx-keymap.toggleTerminalLeft',
      async () => {
        try {
          if (!this.isTerminalMode) {
            await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
            await this.openTerminal();
            this.isTerminalMode = true;
          } else {
            await vscode.commands.executeCommand('workbench.action.closePanel');
            await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
            this.isTerminalMode = false;
          }
          await context.workspaceState.update(STATE_KEY, this.isTerminalMode);
        } catch (error) {
          vscode.window.showErrorMessage(`Terminal toggle failed: ${error}`);
        }
      }
    );

    context.subscriptions.push(toggleTerminalDisposable);
  }

  private async openTerminal() {
    const config = vscode.workspace.getConfiguration('workbench');
    const sideBarLocation = config.get<string>('sideBar.location', 'left');
    if (sideBarLocation === 'left') {
      await vscode.commands.executeCommand('workbench.action.positionPanelRight');
    } else {
      await vscode.commands.executeCommand('workbench.action.positionPanelLeft');
    }
    await vscode.commands.executeCommand('workbench.action.terminal.focus');
  }
}
