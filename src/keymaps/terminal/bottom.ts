import * as vscode from 'vscode';
import { STORAGE_KEYS } from '../../utils/constants';

export class BottomTerminalManager {
  public registerCommands(context: vscode.ExtensionContext) {
    const toggleTerminalBottomDisposable = vscode.commands.registerCommand(
      'lynx-keymap.toggleTerminalBottom',
      async () => {
        try {
          const current = context.workspaceState.get<string>(STORAGE_KEYS.PANEL_POSITION);

          if (current === 'bottom') {
            await vscode.commands.executeCommand('workbench.action.closePanel');
            await context.workspaceState.update(STORAGE_KEYS.PANEL_POSITION, undefined);
          } else {
            const terminalConfig = vscode.workspace.getConfiguration('terminal.integrated');
            const workbenchConfig = vscode.workspace.getConfiguration('workbench');

            await terminalConfig.update('tabs.enabled', true, vscode.ConfigurationTarget.Global);
            await workbenchConfig.update('panel.showLabels', true, vscode.ConfigurationTarget.Global);

            await vscode.commands.executeCommand('workbench.action.positionPanelBottom');
            await vscode.commands.executeCommand('workbench.action.terminal.focus');
            await context.workspaceState.update(STORAGE_KEYS.PANEL_POSITION, 'bottom');
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Terminal toggle failed: ${error}`);
        }
      }
    );

    context.subscriptions.push(toggleTerminalBottomDisposable);
  }
}
