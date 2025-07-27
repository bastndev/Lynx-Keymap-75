const vscode = require('vscode');
const ColorManager = require('./editor-ui/icons/icon-painter');
const MacroManager = require('./editor-ui/icons/macros');
const StatusBarManager = require('./editor-ui/status-bar');
const AICommandsManager = require('./keymaps/ai-commands-manager');

// Global instances
let statusBarManagerInstance;
let aiCommandsManagerInstance;

function activate(context) {
  // Initialize managers
  const colorManager = new ColorManager();
  const macroManager = new MacroManager();
  statusBarManagerInstance = new StatusBarManager(context);
  aiCommandsManagerInstance = new AICommandsManager();

  // Register AI commands
  aiCommandsManagerInstance.registerCommands(context);

  // Status bar - [alt+insert]
  let toggleGreenModeDisposable = vscode.commands.registerCommand(
    'lynx-keymap.toggleGreenMode',
    () => statusBarManagerInstance.toggleGreenMode()
  );

  // Icon painter [Alt+z]
  let cycleIconColorDisposable = vscode.commands.registerCommand(
    'lynx-keymap.cycleIconColor',
    () => colorManager.cycleIconColor()
  );

  // Icon painter (Macros)
  let colorAndAgentMacroDisposable = vscode.commands.registerCommand(
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

async function deactivate() {
  if (statusBarManagerInstance) {
    await statusBarManagerInstance.deactivateGreenMode();
  }
  if (aiCommandsManagerInstance) {
    aiCommandsManagerInstance.dispose();
  }
}

module.exports = {
  activate,
  deactivate,
};
