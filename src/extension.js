const vscode = require('vscode');

// Import managers with error handling
let ColorManager, MacroManager, StatusBarManager, AICommandsManager, ExtensionChecker, TabMessageManager;

try {
  ColorManager = require('./editor-ui/icons/icon-painter');
  MacroManager = require('./editor-ui/icons/macros');
  StatusBarManager = require('./editor-ui/status-bar');
  AICommandsManager = require('./keymaps/ai-keymap-handler');
  ExtensionChecker = require('./notifications/extension-checker');
  TabMessageManager = require('./notifications/tab-messages');
} catch (error) {
  console.error('❌ Failed to load required modules:', error);
  vscode.window.showErrorMessage(`Lynx Keymap: Failed to load modules - ${error.message}`);
}

// Global instances
let statusBarManagerInstance;
let aiCommandsManagerInstance;
let extensionCheckerInstance;

/**
 * Extension activation function
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {
  try {
    // ✨ Fast startup animation (2 seconds)
    if (TabMessageManager) {
      TabMessageManager.showStartupNotifications();
    }

    // Initialize managers with error handling
    const colorManager = ColorManager ? new ColorManager() : null;
    const macroManager = MacroManager ? new MacroManager() : null;
    
    if (StatusBarManager) {
      statusBarManagerInstance = new StatusBarManager(context);
    }
    
    if (AICommandsManager) {
      aiCommandsManagerInstance = new AICommandsManager();
      aiCommandsManagerInstance.registerCommands(context);
    }
    
    if (ExtensionChecker) {
      extensionCheckerInstance = new ExtensionChecker();
      extensionCheckerInstance.registerCheckCommands(context);
    }

    // Register commands with error handling
    const commands = [];

    // Status bar - [ctrl+alt+pagedown]
    if (statusBarManagerInstance) {
      commands.push(
        vscode.commands.registerCommand(
          'lynx-keymap.toggleStatusBarColor',
          () => {
            try {
              statusBarManagerInstance.toggleStatusBarColor();
            } catch (error) {
              handleCommandError('toggleStatusBarColor', error);
            }
          }
        )
      );
    }

    // Icon painter [Alt+z]
    if (colorManager) {
      commands.push(
        vscode.commands.registerCommand(
          'lynx-keymap.cycleIconColor',
          () => {
            try {
              colorManager.cycleIconColor();
            } catch (error) {
              handleCommandError('cycleIconColor', error);
            }
          }
        )
      );
    }

    // Icon painter (Macros)
    if (macroManager) {
      commands.push(
        vscode.commands.registerCommand(
          'lynx-keymap.executeColorAndAgentMacro',
          () => {
            try {
              macroManager.executeColorAndAgentMacro();
            } catch (error) {
              handleCommandError('executeColorAndAgentMacro', error);
            }
          }
        )
      );
    }

    // Command with extension check - F1 QuickSwitch [ctrl+4]
    if (extensionCheckerInstance) {
      commands.push(
        vscode.commands.registerCommand(
          'lynx-keymap.checkF1QuickSwitch',
          () => {
            try {
              extensionCheckerInstance.checkAndExecuteCommand(
                'f1-toggles.focus',
                context
              );
            } catch (error) {
              handleCommandError('checkF1QuickSwitch', error);
            }
          }
        )
      );
    }

    // Command with extension check - GitLens Graph [alt+e]
    if (extensionCheckerInstance) {
      commands.push(
        vscode.commands.registerCommand(
          'lynx-keymap.checkGitLens',
          () => {
            try {
              extensionCheckerInstance.checkAndExecuteCommand(
                'gitlens.showGraph',
                context
              );
            } catch (error) {
              handleCommandError('checkGitLens', error);
            }
          }
        )
      );
    }

    // Register all commands with VSCode
    context.subscriptions.push(...commands);

    // Log successful activation
    if (TabMessageManager) {
      TabMessageManager.logSuccess('Extension activated successfully');
    } else {
      console.log('✅ Lynx Keymap: Extension activated successfully');
    }

  } catch (error) {
    console.error('❌ Lynx Keymap: Failed to activate extension:', error);
    vscode.window.showErrorMessage(`Lynx Keymap: Activation failed - ${error.message}`);
    
    // Try to show error via TabMessageManager if available
    if (TabMessageManager) {
      TabMessageManager.showAIErrorMessage('Activation Failed');
    }
  }
}

/**
 * Handle command execution errors
 * @param {string} commandName 
 * @param {Error} error 
 */
function handleCommandError(commandName, error) {
  console.error(`❌ Lynx Keymap: Command '${commandName}' failed:`, error);
  
  if (TabMessageManager) {
    TabMessageManager.showAIErrorMessage(`${commandName} failed`);
  } else {
    vscode.window.showWarningMessage(`Lynx Keymap: ${commandName} failed - ${error.message}`);
  }
}

/**
 * Extension deactivation function
 */
async function deactivate() {
  try {
    // Clear any active status messages when deactivating
    if (TabMessageManager) {
      TabMessageManager.clearStatusMessage();
    }

    // Deactivate managers
    if (statusBarManagerInstance) {
      await statusBarManagerInstance.deactivateColorMode();
    }
    
    if (aiCommandsManagerInstance) {
      aiCommandsManagerInstance.dispose();
    }

    // Log deactivation
    if (TabMessageManager) {
      TabMessageManager.logInfo('Extension deactivated');
    } else {
      console.log('🔵 Lynx Keymap: Extension deactivated');
    }

  } catch (error) {
    console.error('❌ Lynx Keymap: Error during deactivation:', error);
  }
}

module.exports = {
  activate,
  deactivate,
};
