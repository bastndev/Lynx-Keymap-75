const vscode = require('vscode');
const ColorManager = require('./managers/icon-colors');
const MacroManager = require('./managers/macros');
const PeacockManager = require('./managers/peacock');

let peacockManagerInstance;

function activate(context) {
  console.log('Congratulations, your extension "lynx-keymap" is now active!');

  const colorManager = new ColorManager();
  const macroManager = new MacroManager();
  peacockManagerInstance = new PeacockManager(context);

  // Command for AI commit generation [alt+2]
  let commitDisposable = vscode.commands.registerCommand(
    'lynx-keymap.generateAICommit',
    async function () {
      const commitCommands = [
        'windsurf.generateCommitMessage',
        'github.copilot.git.generateCommitMessage',
        'cursor.generateGitCommitMessage',
        'icube.gitGenerateCommitMessage',
      ];
      await executeFirstAvailableCommand(
        commitCommands,
        'No AI commit generators available'
      );
    }
  );

  // Command for AI Popup [ctrl+`]
  let popupDisposable = vscode.commands.registerCommand(
    'lynx-keymap.executeAIPopup',
    async function () {
      const popupCommands = [
        'windsurf.prioritized.command.open',
        'inlineChat.start',
        'aipopup.action.modal.generate',
        'icube.inlineChat.start',
        'workbench.action.terminal.chat.start',
      ];
      await executeFirstAvailableCommand(
        popupCommands,
        'No AI chat providers available'
      );
    }
  );

  // Command to open AI chat [ctrl+tab]
  let chatDisposable = vscode.commands.registerCommand(
    'lynx-keymap.openAIChat',
    async function () {
      const chatCommands = [
        'windsurf.prioritized.chat.open',
        'workbench.panel.chat',
        'aichat.newchataction',
        'workbench.action.chat.icube.open',
        'aichat.prompt',
      ];
      await executeFirstAvailableCommand(
        chatCommands,
        'No AI chat providers available'
      );
    }
  );

  // Command to create a new AI session [alt+a]
  let newSessionDisposable = vscode.commands.registerCommand(
    'lynx-keymap.createNewAISession',
    async function () {
      const newSessionCommands = [
        'windsurf.prioritized.chat.openNewConversation',
        'workbench.action.chat.newEditSession',
        'composer.createNew',
        'workbench.action.icube.aiChatSidebar.createNewSession',
      ];
      await executeFirstAvailableCommand(
        newSessionCommands,
        'No AI providers available to create a new session'
      );
    }
  );

  // Command to show AI history [alt+s]
  let historyDisposable = vscode.commands.registerCommand(
    'lynx-keymap.showAIHistory',
    async function () {
      const historyCommands = [
        'composer.showComposerHistory',
        'workbench.action.chat.history',
        'workbench.action.icube.aiChatSidebar.showHistory',
      ];
      await executeFirstAvailableCommand(
        historyCommands,
        'No AI history available'
      );
    }
  );

  // Command for AI attach context [alt+d]
  let attachContextDisposable = vscode.commands.registerCommand(
    'lynx-keymap.attachAIContext',
    async function () {
      const attachContextCommands = [
        'composer.openAddContextMenu',
        'workbench.action.chat.attachContext',
      ];
      await executeFirstAvailableCommand(
        attachContextCommands,
        'No AI context attachment available'
      );
    }
  );

  // Command to toggle inline suggestions [ctrl + Ecs]
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

  // Command to cycle icon colors [ctrl+shift+alt+11]
  let cycleIconColorDisposable = vscode.commands.registerCommand(
    'lynx-keymap.cycleIconColor',
    async () => {
      await colorManager.cycleIconColor();
    }
  );

  // Macro command to execute color change + agent mode toggle [alt+z]
  let colorAndAgentMacroDisposable = vscode.commands.registerCommand(
    'lynx-keymap.executeColorAndAgentMacro',
    async () => {
      await macroManager.executeColorAndAgentMacro();
    }
  );

  // Command to toggle green mode [alt+n]
  let toggleGreenModeDisposable = vscode.commands.registerCommand(
    'lynx-keymap.toggleGreenMode',
    async () => {
      await peacockManagerInstance.toggleGreenMode();
    }
  );

  context.subscriptions.push(
    commitDisposable,
    popupDisposable,
    chatDisposable,
    newSessionDisposable,
    historyDisposable,
    attachContextDisposable,
    toggleSuggestDisposable,
    cycleIconColorDisposable,
    colorAndAgentMacroDisposable,
    toggleGreenModeDisposable
  );
}

async function executeFirstAvailableCommand(commands, errorMessage) {
  const allCommands = await vscode.commands.getCommands(true);
  for (const cmd of commands) {
    if (allCommands.includes(cmd)) {
      try {
        await vscode.commands.executeCommand(cmd);
        console.log(`Executed command: ${cmd}`);
        return;
      } catch (error) {
        console.error(`Error executing command ${cmd}:`, error);
      }
    } else {
      console.log(`Command not available: ${cmd}`);
    }
  }
  vscode.window.showWarningMessage(errorMessage);
}

// Clean up colors when extension is deactivated
async function deactivate() {
  if (peacockManagerInstance) {
    console.log('Deactivating Lynx Green Mode on exit...');
    await peacockManagerInstance.deactivateGreenMode();
  }
}

module.exports = {
  activate,
  deactivate,
};
