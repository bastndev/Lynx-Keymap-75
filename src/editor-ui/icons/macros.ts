import * as vscode from 'vscode';

interface CommandStep {
  command: string;
  delay?: number;
}

export class MacroManager {
  private isExecuting: boolean = false;

  constructor() {
  }

  async executeSequence(commandSequence: CommandStep[]): Promise<void> {
    if (!Array.isArray(commandSequence) || commandSequence.length === 0) {
      vscode.window.showErrorMessage('Invalid command sequence provided');
      return;
    }

    if (this.isExecuting) {
      vscode.window.showWarningMessage(
        'Macro already executing, please wait...'
      );
      return;
    }

    this.isExecuting = true;

    try {
      for (let i = 0; i < commandSequence.length; i++) {
        const step = commandSequence[i];

        if (!step || typeof step.command !== 'string') {
          console.error('Invalid command step:', step);
          continue;
        }

        try {
          await vscode.commands.executeCommand(step.command);
          console.log(`Executed macro step: ${step.command}`);
        } catch (stepError) {
          console.error(`Failed to execute step ${step.command}:`, stepError);
        }

        if (step.delay && i < commandSequence.length - 1) {
          await this.delay(step.delay);
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Macro execution failed: ${(error as Error).message}`
      );
    } finally {
      this.isExecuting = false;
    }
  }

  async executeColorAndAgentMacro(): Promise<void> {
    const sequence: CommandStep[] = [
      {
        command: 'workbench.action.chat.toggleAgentMode',
        delay: 10,
      },
      {
        command: 'lynx-keymap.cycleIconColor',
      },
    ];

    await this.executeSequence(sequence);
  }

  async executeCustomMacro(): Promise<void> {
    const sequence: CommandStep[] = [
      { command: 'workbench.view.explorer', delay: 10 },
      { command: 'workbench.view.scm', delay: 10 },
      { command: 'workbench.view.extensions' },
    ];

    await this.executeSequence(sequence);
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  cancelExecution(): void {
    if (this.isExecuting) {
      this.isExecuting = false;
      vscode.window.showInformationMessage('Macro execution cancelled');
    }
  }
}
