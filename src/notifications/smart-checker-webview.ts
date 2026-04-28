import * as vscode from 'vscode';

interface WebviewExtension {
  extensionId: string;
  displayName: string;
  marketplaceSearch: string;
  originalKeybinding: string;
  webviewCommand: string;
  originalCommand: string;
}

export class SmartWebviewExtension {
  private webviewExtensions: Record<string, WebviewExtension> = {
    'compare-code.openWebview': {
      extensionId: 'bastndev.compare-code',
      displayName: 'Compare Code',
      marketplaceSearch: 'bastndev.compare-code',
      originalKeybinding: 'shift+alt+\\',
      webviewCommand: 'compare-code.compareFiles',
      originalCommand: 'Compare Code',
    },
  };

  private activeTimeouts: Set<ReturnType<typeof setTimeout>> = new Set();
  private installationInProgress: Set<string> = new Set();
  private webviewInstances: Map<string, number> = new Map();
  private maxTimeouts: number = 10;
  private timeoutCleanupInterval: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.startTimeoutCleanup();
  }

  async checkAndOpenWebview(commandId: string, context: vscode.ExtensionContext): Promise<void> {
    const dependency = this.webviewExtensions[commandId];
    if (!dependency) {
      console.error(`Unknown webview command: ${commandId}`);
      return;
    }

    const extension = vscode.extensions.getExtension(dependency.extensionId);

    if (!extension) {
      this.showWebviewExtensionRequiredNotification(dependency, commandId);
      return;
    }

    if (extension.isActive) {
      try {
        await vscode.commands.executeCommand(dependency.webviewCommand);
        console.log(
          `Fast path: Successfully opened webview: ${dependency.displayName}`
        );
        return;
      } catch (error) {
        console.log(
          `Fast path failed, falling back to full logic: ${(error as Error).message}`
        );
      }
    }

    try {
      if (!extension.isActive) {
        await extension.activate();
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (this.isWebviewAlreadyOpen(dependency.extensionId)) {
        console.log(`Webview for ${dependency.displayName} is already open`);
        return;
      }

      await this.executeWebviewCommand(dependency, commandId);
    } catch (error) {
      console.error(`Error executing webview command:`, error);
      this.showWebviewActivationError(dependency, commandId, error as Error);
    }
  }

  async executeWebviewCommand(dependency: WebviewExtension, commandId: string): Promise<void> {
    try {
      this.webviewInstances.set(dependency.extensionId, Date.now());

      await vscode.commands.executeCommand(dependency.webviewCommand);
      console.log(`Successfully opened webview: ${dependency.displayName}`);

      this.createTimeout(() => {
        this.webviewInstances.delete(dependency.extensionId);
      }, 500);
    } catch (error) {
      this.webviewInstances.delete(dependency.extensionId);
      throw error;
    }
  }

  isWebviewAlreadyOpen(extensionId: string): boolean {
    const lastOpened = this.webviewInstances.get(extensionId);
    if (!lastOpened) return false;

    const timeDiff = Date.now() - lastOpened;
    return timeDiff < 500;
  }

  showWebviewExtensionRequiredNotification(dependency: WebviewExtension, commandId: string): void {
    const message = `🔍 The extension "${dependency.displayName}" is required to open this webview`;

    vscode.window
      .showInformationMessage(message, 'Install Extension', 'Cancel')
      .then((selection) => {
        if (selection === 'Install Extension') {
          this.installWebviewExtension(dependency, commandId);
        }
      });
  }

  async installWebviewExtension(dependency: WebviewExtension, commandId: string): Promise<void> {
    if (this.installationInProgress.has(dependency.extensionId)) {
      return;
    }

    this.installationInProgress.add(dependency.extensionId);

    try {
      vscode.window.showInformationMessage(
        `📥 Downloading ${dependency.displayName}...`
      );

      await new Promise((resolve) => setTimeout(resolve, 3000));

      await vscode.commands.executeCommand(
        'workbench.extensions.installExtension',
        dependency.extensionId
      );

      let attempts = 0;
      const maxAttempts = 15;

      while (attempts < maxAttempts) {
        const extension = vscode.extensions.getExtension(
          dependency.extensionId
        );
        if (extension) break;

        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }

      vscode.window.showInformationMessage(
        `✅ ${dependency.displayName} installed successfully! Opening webview...`
      );

      this.createTimeout(() => {
        this.checkAndOpenWebview(commandId, null as any);
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
          this.installWebviewExtension(dependency, commandId);
        }, 1000);
      }
    } finally {
      this.installationInProgress.delete(dependency.extensionId);
    }
  }

  async showWebviewActivationError(dependency: WebviewExtension, commandId: string, error: Error): Promise<void> {
    const selection = await vscode.window.showErrorMessage(
      `❌ Failed to open "${dependency.displayName}" webview: ${
        error?.message || 'Unknown error'
      }`,
      'Retry',
      'Open Marketplace',
      'Check Extension'
    );

    if (selection === 'Retry') {
      this.createTimeout(() => {
        this.checkAndOpenWebview(commandId, null as any);
      }, 1000);
    } else if (selection === 'Open Marketplace') {
      vscode.commands.executeCommand(
        'workbench.extensions.search',
        dependency.marketplaceSearch
      );
    } else if (selection === 'Check Extension') {
      vscode.commands.executeCommand('workbench.view.extensions');
    }
  }

  registerWebviewCommands(context: vscode.ExtensionContext): vscode.Disposable[] {
    const commandMappings: Record<string, string> = {
      'compare-code.openWebview': 'lynx-keymap.checkCompareCode',
    };

    const disposables = Object.keys(this.webviewExtensions).map((commandId) => {
      const checkCommandId =
        commandMappings[commandId] ||
        `lynx-keymap.check-${commandId.replace(/\./g, '-')}`;

      const disposable = vscode.commands.registerCommand(checkCommandId, () => {
        this.checkAndOpenWebview(commandId, context);
      });

      console.log(
        `Registered webview command: ${checkCommandId} -> ${commandId}`
      );
      return disposable;
    });

    context.subscriptions.push(...disposables);
    return disposables;
  }

  clearAllTimeouts(): void {
    this.activeTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.activeTimeouts.clear();
  }

  createTimeout(callback: () => void, delay: number): ReturnType<typeof setTimeout> {
    if (this.activeTimeouts.size >= this.maxTimeouts) {
      console.warn('Maximum webview timeouts reached, clearing oldest ones');
      this.clearOldestTimeouts(Math.floor(this.maxTimeouts / 2));
    }

    const timeout = setTimeout(() => {
      this.activeTimeouts.delete(timeout);
      if (typeof callback === 'function') {
        try {
          callback();
        } catch (error) {
          console.error('Webview timeout callback error:', error);
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
        console.log(
          `Cleaning up excess webview timeouts: ${this.activeTimeouts.size}`
        );
        this.clearOldestTimeouts(this.activeTimeouts.size - this.maxTimeouts);
      }
    }, 30000);
  }

  dispose(): void {
    this.clearAllTimeouts();
    this.installationInProgress.clear();
    this.webviewInstances.clear();

    if (this.timeoutCleanupInterval) {
      clearInterval(this.timeoutCleanupInterval);
      this.timeoutCleanupInterval = null;
    }
  }
}
