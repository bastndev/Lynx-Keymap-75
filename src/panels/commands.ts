import * as vscode from 'vscode';
import { BaseManager } from '../shared/base-manager';
import { promptInstallExtension } from '../notifications/install-prompt';

interface PanelConfig {
  commandId: string;
  extensionId: string;
  focusCommand: string;
  messageKey: string;
  actionKey: string;
}

const PANEL_CONFIGS: PanelConfig[] = [
  {
    commandId:    'lynx-keymap.openGitlabPanel',
    extensionId:  'bastndev.atm',
    focusCommand: 'workbench.view.extension.gitlab-panel',
    messageKey:   'ATM.notification.install.required',
    actionKey:    'ATM.notification.install.action',
  },
  {
    commandId:    'lynx-keymap.openMySkillsPanel',
    extensionId:  'bastndev.my-skills',
    focusCommand: 'myskills-panel.focus',
    messageKey:   'MySkills.notification.install.required',
    actionKey:    'MySkills.notification.install.action',
  },
];

export class PanelCommandsManager extends BaseManager {

  public registerCommands(context: vscode.ExtensionContext): void {
    for (const panel of PANEL_CONFIGS) {
      const disposable = vscode.commands.registerCommand(panel.commandId, async () => {
        const ext = vscode.extensions.getExtension(panel.extensionId);
        if (ext) {
          if (!ext.isActive) { await ext.activate(); }
          void vscode.commands.executeCommand(panel.focusCommand);
        } else {
          void promptInstallExtension(panel.extensionId, panel.messageKey, panel.actionKey);
        }
      });
      this.register(context, disposable);
    }
  }
}
