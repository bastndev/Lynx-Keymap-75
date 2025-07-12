const vscode = require('vscode');
const ColorManager = require('./managers/icon-colors');
const MacroManager = require('./managers/macros');
const PeacockManager = require('./managers/peacock');
const AICommandsManager = require('./managers/ai-commands');

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

  // [alt+escape] - VSCode editor behavior modifications
  // ======================================================
  let toggleSuggestDisposable = vscode.commands.registerCommand(
    'lynx-keymap.toggleInlineSuggest',
    async () => {
      const config = vscode.workspace.getConfiguration();
      const currentValue = config.get('editor.inlineSuggest.enabled', true);
      const newValue = !currentValue;

      try {
        await config.update(
          'editor.inlineSuggest.enabled',
          newValue,
          vscode.ConfigurationTarget.Global
        );
        vscode.window.showInformationMessage(
          `Inline Suggestions ${newValue ? 'Enabled' : 'Disabled'}.`
        );
      } catch (error) {
        console.error("Error updating 'editor.inlineSuggest.enabled':", error);
        vscode.window.showErrorMessage(
          'Failed to toggle Inline Suggestions setting.'
        );
      }
    }
  );

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
    toggleSuggestDisposable,
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
