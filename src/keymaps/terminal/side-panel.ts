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

export class TerminalManager extends BaseTerminalManager {

  public registerCommands(context: vscode.ExtensionContext): void {
    const toggleCmd = vscode.commands.registerCommand(
      'lynx-keymap.toggleTerminalLeft',
      async () => {
        try {
          const current = context.workspaceState.get<string>(STORAGE_KEYS.PANEL_POSITION);

          if (current === PANEL_POSITIONS.LEFT) {
            await restoreOriginalSettings(context);
            await vscode.commands.executeCommand('workbench.action.closePanel');
            await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat'); // re-open AI when closing terminal
            await context.workspaceState.update(STORAGE_KEYS.PANEL_POSITION, undefined);
          } else {
            if (current !== undefined) {
              await vscode.commands.executeCommand('workbench.action.closePanel');
              if (current === PANEL_POSITIONS.BOTTOM) {
                await restoreOriginalSettings(context);
              }
            }

            // Explicit close — safe even if AI is already closed (no toggle side-effects)
            await vscode.commands.executeCommand('workbench.action.closeAuxiliaryBar');
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

    // ─── Smart Close: Terminal lateral OR AI Chat ──────────────────────────────
    // ctrl+capslock — if terminal is occupying the side panel, close it;
    // otherwise fall through to the normal AI Chat toggle.
    const smartCloseCmd = vscode.commands.registerCommand(
      'lynx-keymap.openAndCloseAIChatAndTerminal',
      async () => {
        try {
          const current = context.workspaceState.get<string>(STORAGE_KEYS.PANEL_POSITION);

          if (current === PANEL_POSITIONS.LEFT) {
            // Terminal is in the side → close it and restore settings
            await restoreOriginalSettings(context);
            await vscode.commands.executeCommand('workbench.action.closePanel');
            await context.workspaceState.update(STORAGE_KEYS.PANEL_POSITION, undefined);
          } else {
            // AI Chat is showing (or nothing is open) → delegate to AI Chat toggle
            await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
          }
        } catch (error) {
          console.error(`${LOG_PREFIX} Smart close failed:`, error);
          vscode.window.showErrorMessage(`Smart close failed: ${error}`);
        }
      }
    );

    this.register(context, toggleCmd, smartCloseCmd);
  }
}
