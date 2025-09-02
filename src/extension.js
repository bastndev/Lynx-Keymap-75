const vscode = require('vscode');
const ColorManager = require('./editor-ui/icons/icon-painter');
const MacroManager = require('./editor-ui/icons/macros');
const StatusBarManager = require('./editor-ui/status-bar');
const AICommandsManager = require('./keymaps/ai-keymap-handler');
const ExtensionChecker = require('./notifications/extension-checker');

// Global instances - lazy initialization
let statusBarManagerInstance;
let aiCommandsManagerInstance;
let extensionCheckerInstance;
let colorManagerInstance;
let macroManagerInstance;

// Lazy getters
function getStatusBarManager(context) {
  if (!statusBarManagerInstance) {
    statusBarManagerInstance = new StatusBarManager(context);
  }
  return statusBarManagerInstance;
}

function getAICommandsManager(context) {
  if (!aiCommandsManagerInstance) {
    aiCommandsManagerInstance = new AICommandsManager();
    aiCommandsManagerInstance.registerCommands(context);
  }
  return aiCommandsManagerInstance;
}

function getExtensionChecker(context) {
  if (!extensionCheckerInstance) {
    extensionCheckerInstance = new ExtensionChecker();
    extensionCheckerInstance.registerCheckCommands(context);
  }
  return extensionCheckerInstance;
}

function getColorManager() {
  if (!colorManagerInstance) {
    colorManagerInstance = new ColorManager();
  }
  return colorManagerInstance;
}

function getMacroManager() {
  if (!macroManagerInstance) {
    macroManagerInstance = new MacroManager();
  }
  return macroManagerInstance;
}

function activate(context) {
  // Register commands with lazy initialization

  // Status bar - [ctrl+alt+pagedown]
  let toggleStatusBarColorDisposable = vscode.commands.registerCommand(
    'lynx-keymap.toggleStatusBarColor',
    () => getStatusBarManager(context).toggleStatusBarColor()
  );

  // Icon painter [Alt+z]
  let cycleIconColorDisposable = vscode.commands.registerCommand(
    'lynx-keymap.cycleIconColor',
    () => getColorManager().cycleIconColor()
  );

  // Icon painter (Macros)
  let colorAndAgentMacroDisposable = vscode.commands.registerCommand(
    'lynx-keymap.executeColorAndAgentMacro',
    () => getMacroManager().executeColorAndAgentMacro()
  );

  // Command with extension check - F1 QuickSwitch [ctrl+4]
  let checkF1QuickSwitchDisposable = vscode.commands.registerCommand(
    'lynx-keymap.checkF1QuickSwitch',
    () =>
      getExtensionChecker(context).checkAndExecuteCommand(
        'f1-toggles.focus',
        context
      )
  );

  // Command with extension check - GitLens Graph [alt+e]
  let checkGitLensDisposable = vscode.commands.registerCommand(
    'lynx-keymap.checkGitLens',
    () =>
      getExtensionChecker(context).checkAndExecuteCommand(
        'gitlens.showGraph',
        context
      )
  );

  // Initialize AI commands manager (needed for keybindings to work)
  getAICommandsManager(context);

  // Register commands with VSCode
  context.subscriptions.push(
    toggleStatusBarColorDisposable,
    cycleIconColorDisposable,
    colorAndAgentMacroDisposable,
    checkF1QuickSwitchDisposable,
    checkGitLensDisposable
  );
}

async function deactivate() {
  // Clean up only initialized instances
  if (statusBarManagerInstance) {
    await statusBarManagerInstance.deactivateColorMode();
  }
  if (aiCommandsManagerInstance) {
    aiCommandsManagerInstance.dispose();
  }
  if (extensionCheckerInstance) {
    extensionCheckerInstance.dispose();
  }
}

module.exports = {
  activate,
  deactivate,
};
