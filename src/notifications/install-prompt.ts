import * as vscode from 'vscode';
import { getTranslation } from './i18n';

export async function promptInstallExtension(extensionId: string): Promise<void> {
  const installAction = await getTranslation('ATM.notification.install.action');
  const selection = await vscode.window.showInformationMessage(
    await getTranslation('ATM.notification.install.required'),
    installAction
  );

  if (selection === installAction) {
    void vscode.commands.executeCommand('workbench.extensions.installExtension', extensionId);
  }
}
