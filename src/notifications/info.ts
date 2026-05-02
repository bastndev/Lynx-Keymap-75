import * as vscode from 'vscode';

/**
 * Shows a simple informational toggle notification.
 * Used by AIToggleManager after toggling AI suggestions.
 */

// ─── AI Disable and enable notifications ─────────────────────────────────────────────
export function notifyToggle(editor: string, enabled: boolean): void {
  const icon  = enabled ? '✅' : '❌';
  const label = enabled ? 'ENABLED' : 'DISABLED';
  const name  = editor.charAt(0).toUpperCase() + editor.slice(1);
  vscode.window.showInformationMessage(`(${name}) AI Suggestions: ${label} ${icon}`);
}

// ─── TODO: Add more notifications ────────────────────────────────────────────────────