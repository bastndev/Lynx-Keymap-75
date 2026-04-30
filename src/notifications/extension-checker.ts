import * as vscode from 'vscode';
import { EXTENSION_DEPENDENCIES, ExtensionDependency, COMMAND_IDS } from '../utils/constants';
import { TimeoutManager } from '../utils/timeout-manager';

export class ExtensionChecker {
  private timeoutManager = new TimeoutManager();
  private installationInProgress: Set<string> = new Set();

  async checkAndExecuteCommand(commandId: string, context: vscode.ExtensionContext): Promise<void> {
    const dependency = EXTENSION_DEPENDENCIES[commandId];
    if (!dependency) {
      return vscode.commands.executeCommand(commandId);
    }

    const extension = vscode.extensions.getExtension(dependency.extensionId);
    if (!extension) {
      this.showExtensionRequiredNotification(dependency, commandId);
      return;
    }

    try {
      if (!extension.isActive) {
        await extension.activate();
      }
      await vscode.commands.executeCommand(commandId);
    } catch (error) {
      this.showExtensionActivationError(dependency, commandId, error as Error);
    }
  }

  showExtensionRequiredNotification(dependency: ExtensionDependency, commandId: string): void {
    const message = `The extension "${dependency.displayName}" is required for this command`;
    vscode.window
      .showInformationMessage(message, 'Install Extension', 'Cancel')
      .then((selection) => {
        if (selection === 'Install Extension') {
          this.installExtension(dependency, commandId);
        }
      });
  }

  showTemporaryNotification(message: string, duration = 2000): void {
    vscode.window.showInformationMessage(message);
    this.timeoutManager.create(() => {}, duration);
  }

  async installExtension(dependency: ExtensionDependency, commandId: string): Promise<void> {
    if (this.installationInProgress.has(dependency.extensionId)) {
      return;
    }

    this.installationInProgress.add(dependency.extensionId);

    try {
      vscode.window.showInformationMessage(`Downloading ${dependency.displayName}...`);

      await new Promise((resolve) => setTimeout(resolve, 4000));

      await vscode.commands.executeCommand(
        'workbench.extensions.installExtension',
        dependency.extensionId
      );

      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        const extension = vscode.extensions.getExtension(dependency.extensionId);
        if (extension) { break; }

        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }

      vscode.window.showInformationMessage(`${dependency.displayName} installed successfully`);

      this.timeoutManager.create(() => {
        this.checkAndExecuteCommand(commandId, undefined as unknown as vscode.ExtensionContext);
      }, 1500);
    } catch (error) {
      const selection = await vscode.window.showErrorMessage(
        `Failed to install ${dependency.displayName}: ${(error as Error).message}`,
        'Open Marketplace',
        'Retry'
      );

      if (selection === 'Open Marketplace') {
        vscode.commands.executeCommand('workbench.extensions.search', dependency.marketplaceSearch);
      } else if (selection === 'Retry') {
        this.timeoutManager.create(() => {
          this.installExtension(dependency, commandId);
        }, 1000);
      }
    } finally {
      this.installationInProgress.delete(dependency.extensionId);
    }
  }

  async showExtensionActivationError(dependency: ExtensionDependency, commandId: string, error: Error): Promise<void> {
    const selection = await vscode.window.showErrorMessage(
      `Failed to activate "${dependency.displayName}": ${error?.message || 'Unknown error'}`,
      'Retry',
      'Open Marketplace'
    );

    if (selection === 'Retry') {
      this.timeoutManager.create(() => {
        this.checkAndExecuteCommand(commandId, undefined as unknown as vscode.ExtensionContext);
      }, 1000);
    } else if (selection === 'Open Marketplace') {
      vscode.commands.executeCommand('workbench.extensions.search', dependency.marketplaceSearch);
    }
  }

  registerCheckCommands(context: vscode.ExtensionContext): void {
    Object.keys(EXTENSION_DEPENDENCIES).forEach((commandId) => {
      const checkCommandId = `lynx-keymap.check-${commandId.replace(/\./g, '-')}`;
      const disposable = vscode.commands.registerCommand(checkCommandId, () => {
        this.checkAndExecuteCommand(commandId, context);
      });
      context.subscriptions.push(disposable);
    });

    const checkF1Disposable = vscode.commands.registerCommand(
      COMMAND_IDS.EXTENSION_CHECK.F1_QUICK_SWITCH,
      () => this.checkAndExecuteCommand('workbench.view.extension.f1-functions', context)
    );

    const checkGitLabDisposable = vscode.commands.registerCommand(
      COMMAND_IDS.EXTENSION_CHECK.GITLAB,
      () => this.checkAndExecuteCommand('gitlab.graphView.focus', context)
    );

    context.subscriptions.push(checkF1Disposable, checkGitLabDisposable);
  }

  dispose(): void {
    this.timeoutManager.dispose();
    this.installationInProgress.clear();
  }
}
