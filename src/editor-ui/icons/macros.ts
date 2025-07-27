import * as vscode from 'vscode';

interface CommandStep {
  command: string;
  delay?: number;
}

export default class MacroManager {
  private isExecuting: boolean = false;

  /**
   * Executes a sequence of commands with delays
   */
  public async executeSequence(commandSequence: CommandStep[]): Promise<void> {
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

        await vscode.commands.executeCommand(step.command);

        if (step.delay && i < commandSequence.length - 1) {
          await this.delay(step.delay);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`Macro execution failed: ${errorMessage}`);
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Toggle Agent Mode + Change icon color macro
   */
  public async executeColorAndAgentMacro(): Promise<void> {
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

  /**
   * Custom macro example
   */
  public async executeCustomMacro(): Promise<void> {
    const sequence: CommandStep[] = [
      { command: 'workbench.view.explorer', delay: 10 },
      { command: 'workbench.view.scm', delay: 10 },
      { command: 'workbench.view.extensions' },
    ];

    await this.executeSequence(sequence);
  }

  /**
   * Creates a delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Cancels macro execution
   */
  public cancelExecution(): void {
    if (this.isExecuting) {
      this.isExecuting = false;
      vscode.window.showInformationMessage('Macro execution cancelled');
    }
  }
}