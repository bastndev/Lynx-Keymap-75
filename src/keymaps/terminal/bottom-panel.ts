import * as vscode from 'vscode';
import {
  STORAGE_KEYS,
  LOG_PREFIX,
  PANEL_POSITIONS,
  saveOriginalSettings,
  restoreOriginalSettings,
  applyTerminalSettings,
  BaseTerminalManager,
} from './shared';

export class BottomTerminalManager extends BaseTerminalManager {

  public registerCommands(context: vscode.ExtensionContext): void {
    const toggleCmd = vscode.commands.registerCommand(
      'lynx-keymap.toggleTerminalBottom',
      async () => {
        try {
          const current = context.workspaceState.get<string>(STORAGE_KEYS.PANEL_POSITION);

          if (current === PANEL_POSITIONS.BOTTOM) {
            await restoreOriginalSettings(context);
            await vscode.commands.executeCommand('workbench.action.closePanel');
            await context.workspaceState.update(STORAGE_KEYS.PANEL_POSITION, undefined);
          } else {
            if (current !== undefined) {
              await vscode.commands.executeCommand('workbench.action.closePanel');
              if (current === PANEL_POSITIONS.LEFT) {
                await restoreOriginalSettings(context);
                await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
              }
            }

            await saveOriginalSettings(context);
            await applyTerminalSettings(true, true);
            await vscode.commands.executeCommand('workbench.action.positionPanelBottom');
            await vscode.commands.executeCommand('workbench.action.terminal.focus');
            await context.workspaceState.update(STORAGE_KEYS.PANEL_POSITION, PANEL_POSITIONS.BOTTOM);
          }
        } catch (error) {
          console.error(`${LOG_PREFIX} Terminal bottom toggle failed:`, error);
          vscode.window.showErrorMessage(`Terminal toggle failed: ${error}`);
        }
      }
    );

    this.register(context, toggleCmd);
  }
}
