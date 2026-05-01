import * as vscode from 'vscode';
import { STORAGE_KEYS } from '../../utils/constants';

export const TERMINAL_CONFIG = 'terminal.integrated';
export const WORKBENCH_CONFIG = 'workbench';

export type PanelPosition = 'left' | 'bottom';

export const PANEL_POSITIONS = {
  LEFT: 'left',
  BOTTOM: 'bottom',
} as const;

export async function saveOriginalSettings(context: vscode.ExtensionContext): Promise<void> {
  const terminalConfig = vscode.workspace.getConfiguration(TERMINAL_CONFIG);
  const workbenchConfig = vscode.workspace.getConfiguration(WORKBENCH_CONFIG);

  const tabsEnabled = terminalConfig.inspect<boolean>('tabs.enabled')?.globalValue ?? true;
  const panelShowLabels = workbenchConfig.inspect<boolean>('panel.showLabels')?.globalValue ?? true;

  await context.globalState.update(STORAGE_KEYS.ORIGINAL_TABS_ENABLED, tabsEnabled);
  await context.globalState.update(STORAGE_KEYS.ORIGINAL_PANEL_SHOW_LABELS, panelShowLabels);
}

export async function applyTerminalSettings(
  tabsEnabled: boolean,
  panelShowLabels: boolean,
): Promise<void> {
  const terminalConfig = vscode.workspace.getConfiguration(TERMINAL_CONFIG);
  const workbenchConfig = vscode.workspace.getConfiguration(WORKBENCH_CONFIG);

  await terminalConfig.update('tabs.enabled', tabsEnabled, vscode.ConfigurationTarget.Global);
  await workbenchConfig.update('panel.showLabels', panelShowLabels, vscode.ConfigurationTarget.Global);
}

export async function restoreOriginalSettings(context: vscode.ExtensionContext): Promise<void> {
  const tabsEnabled = context.globalState.get<boolean>(STORAGE_KEYS.ORIGINAL_TABS_ENABLED, true);
  const panelShowLabels = context.globalState.get<boolean>(STORAGE_KEYS.ORIGINAL_PANEL_SHOW_LABELS, true);

  await applyTerminalSettings(tabsEnabled, panelShowLabels);
}
