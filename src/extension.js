const vscode = require('vscode');
const ColorManager = require('./editor-ui/icons/icon-painter');
const MacroManager = require('./editor-ui/icons/macros');
const PeacockManager = require('./editor-ui/status-bars');
const AICommandsManager = require('./keymaps/ai-command-mapper');

// Global instance for peacock manager to handle deactivation
let peacockManagerInstance;
let aiCommandsManagerInstance;

function activate(context) {
  console.log('Congratulations, your extension "lynx-keymap" is now active!');

  // Initialize managers
  const colorManager = new ColorManager();
  const macroManager = new MacroManager();
  peacockManagerInstance = new PeacockManager(context);
  aiCommandsManagerInstance = new AICommandsManager();

  // Register AI commands
  aiCommandsManagerInstance.registerCommands(context);

  // [ctrl+shift+alt+11] - Color and appearance management
  // =========================================================
  let cycleIconColorDisposable = vscode.commands.registerCommand(
    'lynx-keymap.cycleIconColor',
    async () => {
      await colorManager.cycleIconColor();
    }
  );

  // Command to toggle green mode [alt+insert]
  let toggleGreenModeDisposable = vscode.commands.registerCommand(
    'lynx-keymap.toggleGreenMode',
    async () => {
      await peacockManagerInstance.toggleGreenMode();
    }
  );

  // [alt+z] - Complex multi-action commands
  // ==============================================
  let colorAndAgentMacroDisposable = vscode.commands.registerCommand(
    'lynx-keymap.executeColorAndAgentMacro',
    async () => {
      await macroManager.executeColorAndAgentMacro();
    }
  );

  // SUBSCRIPTION MANAGEMENT - Register all commands with VSCode
  // ===========================================================
  context.subscriptions.push(
    cycleIconColorDisposable,
    colorAndAgentMacroDisposable,
    toggleGreenModeDisposable
  );
}

// EXTENSION LIFECYCLE
// ===================
async function deactivate() {
  if (peacockManagerInstance) {
    console.log('Deactivating Lynx Green Mode on exit...');
    await peacockManagerInstance.deactivateGreenMode();
  }
    
  if (aiCommandsManagerInstance) {
    console.log('Disposing AI commands manager...');
    aiCommandsManagerInstance.dispose();
  }
}

module.exports = {
  activate,
  deactivate,
};