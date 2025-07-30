const vscode = require('vscode');
const { AI_COMMANDS_CONFIG, KEYMAP_CONFIG } = require('./ai-commands-config');

class AICommandsManager {
  constructor() {
    this.disposables = [];
  }

  // Register all AI-related commands
  registerCommands(context) {
    // Register commands dynamically from configuration
    const disposables = KEYMAP_CONFIG.map(config => {
      return vscode.commands.registerCommand(
        config.commandId,
        async () => {
          const commands = AI_COMMANDS_CONFIG[config.commandsKey];
          await this.executeFirstAvailableCommand(commands, config.errorMessage);
        }
      );
    });

    // Store all disposables
    this.disposables = disposables;

    // Add to context subscriptions
    context.subscriptions.push(...this.disposables);

    return this.disposables;
  }

  // Helper function to execute the first available command from a list
  async executeFirstAvailableCommand(commands, errorMessage) {
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

  // Cleanup method
  dispose() {
    this.disposables.forEach((disposable) => {
      if (disposable && typeof disposable.dispose === 'function') {
        disposable.dispose();
      }
    });
    this.disposables = [];
  }
}

module.exports = AICommandsManager;