import * as vscode from 'vscode';
import { STORAGE_KEYS, PANEL_POSITIONS, LOG_PREFIX } from '../../shared/constants';

export async function recoverSidePanelState(context: vscode.ExtensionContext): Promise<void> {
  const prevPosition = context.workspaceState.get<string>(STORAGE_KEYS.PANEL_POSITION);

  await context.workspaceState.update(STORAGE_KEYS.PANEL_POSITION,           undefined);
  await context.globalState.update(STORAGE_KEYS.ORIGINAL_TABS_ENABLED,       undefined);
  await context.globalState.update(STORAGE_KEYS.ORIGINAL_PANEL_SHOW_LABELS,  undefined);
  await context.globalState.update(STORAGE_KEYS.ORIGINAL_TABS_LOCATION,      undefined);

  // If the terminal was left in side-panel mode, close the auxiliary bar on startup.
  // Some editors restore it aggressively, so we retry at staggered intervals.
  // closeAuxiliaryBar is idempotent — safe to call even when already closed.
  if (prevPosition === PANEL_POSITIONS.LEFT) {
    const closeAuxBar = async () => {
      try {
        await vscode.commands.executeCommand('workbench.action.closeAuxiliaryBar');
      } catch (error) {
        console.debug(`${LOG_PREFIX} Auxiliary bar cleanup skipped:`, error);
      }
    };

    setTimeout(closeAuxBar, 300);
    setTimeout(closeAuxBar, 800);
    setTimeout(closeAuxBar, 1600);
    setTimeout(async () => {
      try {
        await closeAuxBar();
      } catch (error) {
        console.debug(`${LOG_PREFIX} Final auxiliary bar cleanup skipped:`, error);
      }
    }, 3000);
  }
}
