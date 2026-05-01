import * as vscode from 'vscode';
import { STORAGE_KEYS, LOG_PREFIX } from '../../utils/constants';
import {
  saveOriginalSettings,
  restoreOriginalSettings,
  applyTerminalSettings,
  PANEL_POSITIONS,
} from './shared';

export class TerminalManager {
  private disposables: vscode.Disposable[] = [];

  public registerCommands(context: vscode.ExtensionContext): void {
    const toggleCmd = vscode.commands.registerCommand(
      'lynx-keymap.toggleTerminalLeft',
      async () => {
        try {
          const current = context.workspaceState.get<string>(STORAGE_KEYS.PANEL_POSITION);

          if (current === PANEL_POSITIONS.LEFT) {
            await restoreOriginalSettings(context);
            await vscode.commands.executeCommand('workbench.action.closePanel');
            await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
            await context.workspaceState.update(STORAGE_KEYS.PANEL_POSITION, undefined);
          } else {
            if (current !== undefined) {
              await vscode.commands.executeCommand('workbench.action.closePanel');
              if (current === PANEL_POSITIONS.BOTTOM) {
                await restoreOriginalSettings(context);
              }
            }

            await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
            await saveOriginalSettings(context);
            await applyTerminalSettings(false, false);

            const sideBarLocation = vscode.workspace
              .getConfiguration('workbench')
              .get<string>('sideBar.location', PANEL_POSITIONS.LEFT);

            if (sideBarLocation === PANEL_POSITIONS.LEFT) {
              await vscode.commands.executeCommand('workbench.action.positionPanelRight');
            } else {
              await vscode.commands.executeCommand('workbench.action.positionPanelLeft');
            }

            await vscode.commands.executeCommand('workbench.action.terminal.focus');
            await context.workspaceState.update(STORAGE_KEYS.PANEL_POSITION, PANEL_POSITIONS.LEFT);
          }
        } catch (error) {
          console.error(`${LOG_PREFIX} Terminal left toggle failed:`, error);
          vscode.window.showErrorMessage(`Terminal toggle failed: ${error}`);
        }
      }
    );

    this.disposables.push(toggleCmd);
    context.subscriptions.push(toggleCmd);
  }

  public dispose(): void {
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
  }
}
