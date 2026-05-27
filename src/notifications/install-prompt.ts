import * as vscode from 'vscode';
import { getTranslation } from './i18n';

export async function promptInstallExtension(
  extensionId: string,
  messageKey:  string,
  actionKey:   string,
): Promise<void> {
  const installAction = await getTranslation(actionKey);
  const selection = await vscode.window.showInformationMessage(
    await getTranslation(messageKey),
    installAction
  );

  if (selection === installAction) {
    void vscode.commands.executeCommand('workbench.extensions.installExtension', extensionId);
  }
}
