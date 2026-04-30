import * as vscode from 'vscode';
import { AICommandsManager } from './keymaps/ai/ai-handler';
import { ExtensionChecker } from './notifications/extension-checker';
import { SmartWebviewExtension } from './notifications/smart-checker-webview';
import { TerminalManager } from './keymaps/terminal/terminal';
// import { SwapManager } from './keymaps/swap';

let aiCommandsManagerInstance: AICommandsManager | undefined;
let extensionCheckerInstance: ExtensionChecker | undefined;
let smartWebviewExtensionInstance: SmartWebviewExtension | undefined;
let terminalManagerInstance: TerminalManager | undefined;

export function activate(context: vscode.ExtensionContext) {
  aiCommandsManagerInstance = new AICommandsManager();
  extensionCheckerInstance = new ExtensionChecker();
  smartWebviewExtensionInstance = new SmartWebviewExtension();
  terminalManagerInstance = new TerminalManager();

  aiCommandsManagerInstance.registerCommands(context);
  extensionCheckerInstance.registerCheckCommands(context);
  smartWebviewExtensionInstance.registerWebviewCommands(context);
  terminalManagerInstance.registerCommands(context);

  const checkF1QuickSwitchDisposable = vscode.commands.registerCommand(
    'lynx-keymap.checkF1QuickSwitch',
    () =>
      extensionCheckerInstance?.checkAndExecuteCommand(
        'workbench.view.extension.f1-functions',
        context
      )
  );

  const checkGitLabDisposable = vscode.commands.registerCommand(
    'lynx-keymap.checkGitLab',
    () =>
      extensionCheckerInstance?.checkAndExecuteCommand(
        'gitlab.graphView.focus',
        context
      )
  );

  context.subscriptions.push(
    checkF1QuickSwitchDisposable,
    checkGitLabDisposable
  );
}

export async function deactivate() {
  if (aiCommandsManagerInstance) {
    aiCommandsManagerInstance.dispose();
  }
  if (smartWebviewExtensionInstance) {
    smartWebviewExtensionInstance.dispose();
  }
}
