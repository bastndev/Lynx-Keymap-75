import * as vscode from 'vscode';
import { ColorManager } from './editor-ui/icons/icon-painter';
import { MacroManager } from './editor-ui/icons/macros';
import { StatusBarManager } from './editor-ui/status-bar';
import { AICommandsManager } from './keymaps/ai-keymap-handler';
import { ExtensionChecker } from './notifications/extension-checker';
import { SmartWebviewExtension } from './notifications/smart-checker-webview';

let statusBarManagerInstance: StatusBarManager | undefined;
let aiCommandsManagerInstance: AICommandsManager | undefined;
let extensionCheckerInstance: ExtensionChecker | undefined;
let smartWebviewExtensionInstance: SmartWebviewExtension | undefined;

export function activate(context: vscode.ExtensionContext) {
  const colorManager = new ColorManager();
  const macroManager = new MacroManager();
  statusBarManagerInstance = new StatusBarManager(context);
  aiCommandsManagerInstance = new AICommandsManager();
  extensionCheckerInstance = new ExtensionChecker();
  smartWebviewExtensionInstance = new SmartWebviewExtension();

  aiCommandsManagerInstance.registerCommands(context);
  extensionCheckerInstance.registerCheckCommands(context);
  smartWebviewExtensionInstance.registerWebviewCommands(context);

  const toggleStatusBarColorDisposable = vscode.commands.registerCommand(
    'lynx-keymap.toggleStatusBarColor',
    () => statusBarManagerInstance?.toggleStatusBarColor()
  );

  const cycleIconColorDisposable = vscode.commands.registerCommand(
    'lynx-keymap.cycleIconColor',
    () => colorManager.cycleIconColor()
  );

  const colorAndAgentMacroDisposable = vscode.commands.registerCommand(
    'lynx-keymap.executeColorAndAgentMacro',
    () => macroManager.executeColorAndAgentMacro()
  );

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
    toggleStatusBarColorDisposable,
    cycleIconColorDisposable,
    colorAndAgentMacroDisposable,
    checkF1QuickSwitchDisposable,
    checkGitLensDisposable
  );
}

export async function deactivate() {
  if (statusBarManagerInstance) {
    await statusBarManagerInstance.deactivateColorMode();
  }
  if (aiCommandsManagerInstance) {
    aiCommandsManagerInstance.dispose();
  }
  if (smartWebviewExtensionInstance) {
    smartWebviewExtensionInstance.dispose();
  }
}
