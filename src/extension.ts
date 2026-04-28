import * as vscode from 'vscode';
import { AICommandsManager } from './keymaps/ai-keymap-handler';
import { ExtensionChecker } from './notifications/extension-checker';
import { SmartWebviewExtension } from './notifications/smart-checker-webview';
import { SwapManager } from './keymaps/swap';

let aiCommandsManagerInstance: AICommandsManager | undefined;
let extensionCheckerInstance: ExtensionChecker | undefined;
let smartWebviewExtensionInstance: SmartWebviewExtension | undefined;
let swapManagerInstance: SwapManager | undefined;

export function activate(context: vscode.ExtensionContext) {
  aiCommandsManagerInstance = new AICommandsManager();
  extensionCheckerInstance = new ExtensionChecker();
  smartWebviewExtensionInstance = new SmartWebviewExtension();
  swapManagerInstance = new SwapManager(aiCommandsManagerInstance);

  aiCommandsManagerInstance.registerCommands(context);
  extensionCheckerInstance.registerCheckCommands(context);
  smartWebviewExtensionInstance.registerWebviewCommands(context);
  swapManagerInstance.initializeContexts();

  const checkF1QuickSwitchDisposable = vscode.commands.registerCommand(
    'lynx-keymap.checkF1QuickSwitch',
    () =>
      extensionCheckerInstance?.checkAndExecuteCommand(
        'workbench.view.extension.f1-functions',
        context
      )
  );

  const checkGitLensDisposable = vscode.commands.registerCommand(
    'lynx-keymap.checkGitLens',
    () =>
      extensionCheckerInstance?.checkAndExecuteCommand(
        'gitlens.showGraph',
        context
      )
  );

  context.subscriptions.push(
    checkF1QuickSwitchDisposable,
    checkGitLensDisposable
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
