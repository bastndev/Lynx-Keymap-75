import * as vscode from 'vscode';
import { AI_COMMANDS_CONFIG, KEYMAP_CONFIG } from './ai-keymap-config';

export class AICommandsManager {
  private disposables: vscode.Disposable[] = [];
  private availableCommandsCache: string[] | null = null;
  private cacheTimestamp: number = 0;
  private cacheExpiry: number = 5 * 60 * 1000;

  registerCommands(context: vscode.ExtensionContext): vscode.Disposable[] {
    const disposables = KEYMAP_CONFIG.map((config) => {
      return vscode.commands.registerCommand(config.commandId, async () => {
        const commands = AI_COMMANDS_CONFIG[config.commandsKey];
        await this.executeFirstAvailableCommand(commands, config.errorMessage);
      });
    });

    this.disposables = disposables;
    context.subscriptions.push(...this.disposables);

    return this.disposables;
  }

  async executeFirstAvailableCommand(commands: string[], errorMessage: string): Promise<void> {
    if (!Array.isArray(commands) || commands.length === 0) {
      console.error('Invalid commands array provided:', commands);
      vscode.window.showWarningMessage(errorMessage || 'No commands available');
      return;
    }

    if (!errorMessage || typeof errorMessage !== 'string') {
      errorMessage = 'Command execution failed';
    }

    const allCommands = await this.getAvailableCommands();

    const antigravityCmd = commands.find(cmd => cmd.startsWith('antigravity.'));
    
    if (antigravityCmd && allCommands.includes(antigravityCmd)) {
      try {
        await vscode.commands.executeCommand(antigravityCmd);
        console.log(`Successfully executed prioritized command: ${antigravityCmd}`);
        return;
      } catch (error) {
        console.error(`Failed to execute prioritized command ${antigravityCmd}:`, error);
      }
    }

    for (const cmd of commands) {
      if (cmd === antigravityCmd) continue;

      if (allCommands.includes(cmd)) {
        try {
          await vscode.commands.executeCommand(cmd);
          console.log(`Successfully executed command: ${cmd}`);
          return;
        } catch (error) {
          console.error(`Failed to execute command ${cmd}:`, error);
        }
      } else {
        console.log(`Command not available: ${cmd}`);
      }
    }

    vscode.window.showWarningMessage(errorMessage);
  }

  async getAvailableCommands(): Promise<string[]> {
    const now = Date.now();
    if (
      this.availableCommandsCache &&
      now - this.cacheTimestamp < this.cacheExpiry
    ) {
      return this.availableCommandsCache;
    }

    try {
      this.availableCommandsCache = await vscode.commands.getCommands(true);
      this.cacheTimestamp = now;
      return this.availableCommandsCache;
    } catch (error) {
      console.error('Failed to get available commands:', error);
      return this.availableCommandsCache || [];
    }
  }

  dispose(): void {
    this.disposables.forEach((disposable) => {
      if (disposable && typeof disposable.dispose === 'function') {
        disposable.dispose();
      }
    });
    this.disposables = [];
  }
}
