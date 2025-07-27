import * as vscode from 'vscode';
import ColorManager from './editor-ui/icons/icon-painter';
import MacroManager from './editor-ui/icons/macros';
import StatusBarManager from './editor-ui/status-bar';
import AICommandsManager from './keymaps/ai-commands-manager';

// Global instances
let statusBarManagerInstance: StatusBarManager | undefined;
let aiCommandsManagerInstance: AICommandsManager | undefined;

export function activate(context: vscode.ExtensionContext): void {
  // Initialize managers
  const colorManager = new ColorManager();
  const macroManager = new MacroManager();
  statusBarManagerInstance = new StatusBarManager(context);
  aiCommandsManagerInstance = new AICommandsManager();

  // Register AI commands
  aiCommandsManagerInstance.registerCommands(context);

  // Status bar - [alt+
  const toggleGreenModeDisposable = vscode.commands.registerCommand(
    'lynx-keymap.toggleGreenMode',
    () => statusBarManagerInstance?.toggleGreenMode()
  );

  // Icon painter [Alt+z]
  const cycleIconColorDisposable = vscode.commands.registerCommand(
    'lynx-keymap.cycleIconColor',
    () => colorManager.cycleIconColor()
  );

  // Icon painter (Macros)
  const colorAndAgentMacroDisposable = vscode.commands.registerCommand(
    'lynx-keymap.executeColorAndAgentMacro',
    () => macroManager.executeColorAndAgentMacro()
  );

  // Register commands with VSCode
  context.subscriptions.push(
    toggleGreenModeDisposable,
    cycleIconColorDisposable,
    colorAndAgentMacroDisposable
  );
}

export async function deactivate(): Promise<void> {
  if (statusBarManagerInstance) {
    await statusBarManagerInstance.deactivateGreenMode();
  }
  if (aiCommandsManagerInstance) {
    aiCommandsManagerInstance.dispose();
  }
}
