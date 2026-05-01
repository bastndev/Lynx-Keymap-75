import * as vscode from 'vscode';
import { STORAGE_KEYS } from '../../utils/constants';

const STATE_KEY = 'lynx-keymap:isTerminalMode';
const TERMINAL_CONFIG = 'terminal.integrated';

export class TerminalManager {
  private isTerminalMode = false;
  private context!: vscode.ExtensionContext;

  public registerCommands(context: vscode.ExtensionContext) {
    this.context = context;
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
            await this.restoreTabsConfig();
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
    const terminalConfig = vscode.workspace.getConfiguration(TERMINAL_CONFIG);
    const workbenchConfig = vscode.workspace.getConfiguration('workbench');

    // Save original values before overriding
    const originalTabsEnabled = terminalConfig.inspect<boolean>('tabs.enabled')?.globalValue;
    const originalPanelShowLabels = workbenchConfig.inspect<boolean>('panel.showLabels')?.globalValue;

    await this.context.globalState.update(STORAGE_KEYS.ORIGINAL_TABS_ENABLED, originalTabsEnabled ?? true);
    await this.context.globalState.update(STORAGE_KEYS.ORIGINAL_PANEL_SHOW_LABELS, originalPanelShowLabels ?? true);

    // Apply cleaner terminal look
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
