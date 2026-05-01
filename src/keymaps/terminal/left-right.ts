import * as vscode from 'vscode';
import { STORAGE_KEYS } from '../../utils/constants';

const TERMINAL_CONFIG = 'terminal.integrated';

export class TerminalManager {
  private context!: vscode.ExtensionContext;

  public registerCommands(context: vscode.ExtensionContext) {
    this.context = context;

    const toggleTerminalDisposable = vscode.commands.registerCommand(
      'lynx-keymap.toggleTerminalLeft',
      async () => {
        try {
          const current = context.workspaceState.get<string>(STORAGE_KEYS.PANEL_POSITION);

          if (current === 'left') {
            await this.restoreTabsConfig();
            await vscode.commands.executeCommand('workbench.action.closePanel');
            await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
            await context.workspaceState.update(STORAGE_KEYS.PANEL_POSITION, undefined);
          } else {
            await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
            await this.openTerminal();
            await context.workspaceState.update(STORAGE_KEYS.PANEL_POSITION, 'left');
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Terminal toggle failed: ${error}`);
        }
      }
    );

    context.subscriptions.push(toggleTerminalDisposable);
  }

  private async openTerminal() {
    const terminalConfig = vscode.workspace.getConfiguration(TERMINAL_CONFIG);
    const workbenchConfig = vscode.workspace.getConfiguration('workbench');

    const originalTabsEnabled = terminalConfig.inspect<boolean>('tabs.enabled')?.globalValue;
    const originalPanelShowLabels = workbenchConfig.inspect<boolean>('panel.showLabels')?.globalValue;

    await this.context.globalState.update(STORAGE_KEYS.ORIGINAL_TABS_ENABLED, originalTabsEnabled ?? true);
    await this.context.globalState.update(STORAGE_KEYS.ORIGINAL_PANEL_SHOW_LABELS, originalPanelShowLabels ?? true);

    await terminalConfig.update('tabs.enabled', false, vscode.ConfigurationTarget.Global);
    await workbenchConfig.update('panel.showLabels', false, vscode.ConfigurationTarget.Global);

    const sideBarLocation = workbenchConfig.get<string>('sideBar.location', 'left');
    if (sideBarLocation === 'left') {
      await vscode.commands.executeCommand('workbench.action.positionPanelRight');
    } else {
      await vscode.commands.executeCommand('workbench.action.positionPanelLeft');
    }
    await vscode.commands.executeCommand('workbench.action.terminal.focus');
  }

  private async restoreTabsConfig() {
    const originalTabs = this.context.globalState.get<boolean>(STORAGE_KEYS.ORIGINAL_TABS_ENABLED, true);
    const originalLabels = this.context.globalState.get<boolean>(STORAGE_KEYS.ORIGINAL_PANEL_SHOW_LABELS, true);

    const terminalConfig = vscode.workspace.getConfiguration(TERMINAL_CONFIG);
    const workbenchConfig = vscode.workspace.getConfiguration('workbench');

    await terminalConfig.update('tabs.enabled', originalTabs, vscode.ConfigurationTarget.Global);
    await workbenchConfig.update('panel.showLabels', originalLabels, vscode.ConfigurationTarget.Global);
  }
}
