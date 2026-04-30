import * as vscode from 'vscode';

const STATE_KEY_MODE = 'lynx-keymap:lastActiveMode';
const STATE_KEY_TABS = 'lynx-keymap:originalTabsEnabled';
const STATE_KEY_LABELS = 'lynx-keymap:originalPanelShowLabels';

type ActiveMode = 'terminal' | 'ai-chat' | 'none';

export class TerminalManager {
  private isTerminalMode = false;
  private originalTabsEnabled: boolean | undefined;
  private originalPanelShowLabels: boolean | undefined;

  public async restoreState(context: vscode.ExtensionContext) {
    const lastMode = context.workspaceState.get<ActiveMode>(STATE_KEY_MODE, 'none');

    if (lastMode === 'terminal') {
      this.originalTabsEnabled = context.workspaceState.get(STATE_KEY_TABS);
      this.originalPanelShowLabels = context.workspaceState.get(STATE_KEY_LABELS);
      await this.activateTerminalModeOnlyTerminal(context);
    }
  }

  private async saveState(context: vscode.ExtensionContext, mode: ActiveMode) {
    await context.workspaceState.update(STATE_KEY_MODE, mode);
    if (mode === 'terminal') {
      await context.workspaceState.update(STATE_KEY_TABS, this.originalTabsEnabled);
      await context.workspaceState.update(STATE_KEY_LABELS, this.originalPanelShowLabels);
    }
  }

  private async setupTerminalPanel(context: vscode.ExtensionContext) {
    const terminalConfig = vscode.workspace.getConfiguration('terminal.integrated');
    const config = vscode.workspace.getConfiguration('workbench');

    await vscode.commands.executeCommand('workbench.action.terminal.focus');

    const sideBarLocation = config.get<string>('sideBar.location', 'left');
    if (sideBarLocation === 'left') {
      await vscode.commands.executeCommand('workbench.action.positionPanelRight');
    } else {
      await vscode.commands.executeCommand('workbench.action.positionPanelLeft');
    }

    await terminalConfig.update('tabs.enabled', false, vscode.ConfigurationTarget.Global);
    await config.update('panel.showLabels', false, vscode.ConfigurationTarget.Global);

    this.isTerminalMode = true;
    await this.saveState(context, 'terminal');
  }

  private async activateTerminalMode(context: vscode.ExtensionContext) {
    await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
    await this.setupTerminalPanel(context);
  }

  private async activateTerminalModeOnlyTerminal(context: vscode.ExtensionContext) {
    await this.setupTerminalPanel(context);
  }

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

            await this.activateTerminalMode(context);
          } else {
            await vscode.commands.executeCommand('workbench.action.closePanel');

            await terminalConfig.update('tabs.enabled', this.originalTabsEnabled, vscode.ConfigurationTarget.Global);
            await config.update('panel.showLabels', this.originalPanelShowLabels, vscode.ConfigurationTarget.Global);

            await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');

            this.isTerminalMode = false;
            await this.saveState(context, 'ai-chat');
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Terminal toggle failed: ${error}`);
        }
      }
    );

    context.subscriptions.push(toggleTerminalDisposable);
  }
}