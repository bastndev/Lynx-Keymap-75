import * as vscode from 'vscode';

interface ExtensionDependency {
  extensionId: string;
  displayName: string;
  marketplaceSearch: string;
}

export class ExtensionChecker {
  private extensionDependencies: Record<string, ExtensionDependency> = {
    'workbench.view.extension.f1-functions': {
      extensionId: 'bastndev.f1',
      displayName: 'F1-Quick Switch',
      marketplaceSearch: 'bastndev.f1',
    },
    'gitlens.showGraph': {
      extensionId: 'eamodio.gitlens',
      displayName: 'GitLens',
      marketplaceSearch: 'eamodio.gitlens',
    },
  };
  private activeTimeouts: Set<ReturnType<typeof setTimeout>> = new Set();
  private installationInProgress: Set<string> = new Set();
  private maxTimeouts: number = 10;
  private timeoutCleanupInterval: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.startTimeoutCleanup();
  }

  async checkAndExecuteCommand(commandId: string, context: vscode.ExtensionContext): Promise<void> {
    const dependency = this.extensionDependencies[commandId];
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
    const message = `📥 The extension "${dependency.displayName}" is required for this command`;
    vscode.window
      .showInformationMessage(message, 'Install Extension', 'Cancel')
      .then((selection) => {
        if (selection === 'Install Extension') {
          this.installExtension(dependency, commandId);
        }
      });
  }

  clearAllTimeouts(): void {
    this.activeTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.activeTimeouts.clear();
  }

  createTimeout(callback: () => void, delay: number): ReturnType<typeof setTimeout> {
    if (this.activeTimeouts.size >= this.maxTimeouts) {
      console.warn('Maximum timeouts reached, clearing oldest ones');
      this.clearOldestTimeouts(Math.floor(this.maxTimeouts / 2));
    }

    const timeout = setTimeout(() => {
      this.activeTimeouts.delete(timeout);
      if (typeof callback === 'function') {
        try {
          callback();
        } catch (error) {
          console.error('Timeout callback error:', error);
        }
      }
    }, delay);
    
    this.activeTimeouts.add(timeout);
    return timeout;
  }

  clearOldestTimeouts(count: number): void {
    const timeoutsArray = Array.from(this.activeTimeouts);
    for (let i = 0; i < Math.min(count, timeoutsArray.length); i++) {
      clearTimeout(timeoutsArray[i]);
      this.activeTimeouts.delete(timeoutsArray[i]);
    }
  }

  startTimeoutCleanup(): void {
    this.timeoutCleanupInterval = setInterval(() => {
      if (this.activeTimeouts.size > this.maxTimeouts) {
        console.log(`Cleaning up excess timeouts: ${this.activeTimeouts.size}`);
        this.clearOldestTimeouts(this.activeTimeouts.size - this.maxTimeouts);
      }
    }, 30000);
  }

  showTemporaryNotification(message: string, duration: number = 2000): void {
    this.clearAllTimeouts();
    vscode.window.showInformationMessage(message);
    this.createTimeout(() => {
    }, duration);
  }

  async installExtension(dependency: ExtensionDependency, commandId: string): Promise<void> {
    if (this.installationInProgress.has(dependency.extensionId)) {
      return;
    }

    this.installationInProgress.add(dependency.extensionId);

    try {
      vscode.window.showInformationMessage(
        `📥 Downloading ${dependency.displayName}...`
      );

      await new Promise((resolve) => setTimeout(resolve, 4000));

      await vscode.commands.executeCommand(
        'workbench.extensions.installExtension',
        dependency.extensionId
      );

      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        const extension = vscode.extensions.getExtension(
          dependency.extensionId
        );
        if (extension) break;

        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }

      vscode.window.showInformationMessage(
        `✅ ${dependency.displayName} installed successfully`
      );

      this.createTimeout(() => {
        this.checkAndExecuteCommand(commandId, null as any);
      }, 1500);
    } catch (error) {
      const selection = await vscode.window.showErrorMessage(
        `❌ Failed to install ${dependency.displayName}: ${(error as Error).message}`,
        'Open Marketplace',
        'Retry'
      );

      if (selection === 'Open Marketplace') {
        vscode.commands.executeCommand(
          'workbench.extensions.search',
          dependency.marketplaceSearch
        );
      } else if (selection === 'Retry') {
        this.createTimeout(() => {
          this.installExtension(dependency, commandId);
        }, 1000);
      }
    } finally {
      this.installationInProgress.delete(dependency.extensionId);
    }
  }

  async showExtensionActivationError(dependency: ExtensionDependency, commandId: string, error: Error): Promise<void> {
    const selection = await vscode.window.showErrorMessage(
      `❌ Failed to activate "${dependency.displayName}": ${
        error?.message || 'Unknown error'
      }`,
      'Retry',
      'Open Marketplace'
    );

    if (selection === 'Retry') {
      this.createTimeout(() => {
        this.checkAndExecuteCommand(commandId, null as any);
      }, 1000);
    } else if (selection === 'Open Marketplace') {
      vscode.commands.executeCommand(
        'workbench.extensions.search',
        dependency.marketplaceSearch
      );
    }
  }

  registerCheckCommands(context: vscode.ExtensionContext): void {
    Object.keys(this.extensionDependencies).forEach((commandId) => {
      const checkCommandId = `lynx-keymap.check-${commandId.replace(/\./g,'-')}`;
      const disposable = vscode.commands.registerCommand(checkCommandId, () => {
        this.checkAndExecuteCommand(commandId, context);
      });
      context.subscriptions.push(disposable);
    });
  }

  dispose(): void {
    this.clearAllTimeouts();
    this.installationInProgress.clear();
    
    if (this.timeoutCleanupInterval) {
      clearInterval(this.timeoutCleanupInterval);
      this.timeoutCleanupInterval = null;
    }
  }
}
