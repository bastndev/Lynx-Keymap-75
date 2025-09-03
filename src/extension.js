const vscode = require('vscode');
const ColorManager = require('./editor-ui/icons/icon-painter');
const MacroManager = require('./editor-ui/icons/macros');
const StatusBarManager = require('./editor-ui/status-bar');
const AICommandsManager = require('./keymaps/ai-keymap-handler');
const ExtensionChecker = require('./notifications/extension-checker');
const TabMessageManager = require('./notifications/tab-messages');

// Global instances
let statusBarManagerInstance;
let aiCommandsManagerInstance;
let extensionCheckerInstance;

function activate(context) {
  try {
    // CRITICAL: Register AI commands FIRST and ONLY - ultra lightweight activation
    aiCommandsManagerInstance = new AICommandsManager();
    aiCommandsManagerInstance.registerCommands(context);

    // Lazy load other managers only when needed
    lazyLoadOtherManagers(context);

    TabMessageManager.logSuccess('Lynx Keymap activated (lightweight mode)');
  } catch (error) {
    TabMessageManager.logError('Failed to activate extension', error);
  }
}

// Lazy load other managers after a short delay
function lazyLoadOtherManagers(context) {
  setTimeout(() => {
    try {
      // Initialize other managers
      const colorManager = new ColorManager();
      const macroManager = new MacroManager();
      statusBarManagerInstance = new StatusBarManager(context);
      extensionCheckerInstance = new ExtensionChecker();

      // Register extension checker commands
      extensionCheckerInstance.registerCheckCommands(context);

      // Status bar - [ctrl+alt+pagedown]
      let toggleStatusBarColorDisposable = vscode.commands.registerCommand(
        'lynx-keymap.toggleStatusBarColor',
        () => statusBarManagerInstance.toggleStatusBarColor()
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

      // Command with extension check - F1 QuickSwitch [ctrl+4]
      let checkF1QuickSwitchDisposable = vscode.commands.registerCommand(
        'lynx-keymap.checkF1QuickSwitch',
        () =>
          extensionCheckerInstance.checkAndExecuteCommand(
            'f1-toggles.focus',
            context
          )
      );

      // Command with extension check - GitLens Graph [alt+e]
      let checkGitLensDisposable = vscode.commands.registerCommand(
        'lynx-keymap.checkGitLens',
        () =>
          extensionCheckerInstance.checkAndExecuteCommand(
            'gitlens.showGraph',
            context
          )
      );

      // Register commands with VSCode
      context.subscriptions.push(
        toggleStatusBarColorDisposable,
        cycleIconColorDisposable,
        colorAndAgentMacroDisposable,
        checkF1QuickSwitchDisposable,
        checkGitLensDisposable
      );

      TabMessageManager.logSuccess('Full extension features loaded');
    } catch (error) {
      TabMessageManager.logError('Failed to load additional features', error);
    }
  }, 100); // Solo 100ms de delay para cargar el resto
}

async function deactivate() {
  try {
    TabMessageManager.logInfo('Deactivating Lynx Keymap extension...');
    
    // Clear any active status messages
    TabMessageManager.clearStatusMessage();
    
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
    
    TabMessageManager.logSuccess('Extension deactivated successfully');
  } catch (error) {
    TabMessageManager.logError('Error during deactivation', error);
  }
}

module.exports = {
  activate,
  deactivate,
};
