import * as vscode from 'vscode';
import { WEBVIEW_EXTENSIONS, WebviewExtension } from '../utils/constants';
import { TimeoutManager } from '../utils/timeout-manager';

export class SmartWebviewExtension {
  private timeoutManager = new TimeoutManager();
  private installationInProgress: Set<string> = new Set();
  private webviewInstances: Map<string, number> = new Map();

  async checkAndOpenWebview(commandId: string, context: vscode.ExtensionContext): Promise<void> {
    const dependency = WEBVIEW_EXTENSIONS[commandId];
    if (!dependency) {
      console.error(`Unknown webview command: ${commandId}`);
      return;
    }

    const extension = vscode.extensions.getExtension(dependency.extensionId);
    if (!extension) {
      this.showExtensionRequiredNotification(dependency, commandId);
      return;
    }

    if (extension.isActive) {
      try {
        await vscode.commands.executeCommand(dependency.webviewCommand);
        return;
      } catch (error) {
        console.warn(`Fast path failed, falling back to full logic: ${(error as Error).message}`);
      }
    }

    try {
      if (!extension.isActive) {
        await extension.activate();
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (this.isWebviewAlreadyOpen(dependency.extensionId)) {
        return;
      }

      await this.executeWebviewCommand(dependency, commandId);
    } catch (error) {
      console.error(`Error executing webview command:`, error);
      this.showWebviewActivationError(dependency, commandId, error as Error);
    }
  }

  async executeWebviewCommand(dependency: WebviewExtension, _commandId: string): Promise<void> {
    try {
      this.webviewInstances.set(dependency.extensionId, Date.now());

      await vscode.commands.executeCommand(dependency.webviewCommand);

      this.timeoutManager.create(() => {
        this.webviewInstances.delete(dependency.extensionId);
      }, 500);
    } catch (error) {
      this.webviewInstances.delete(dependency.extensionId);
      throw error;
    }
  }

  isWebviewAlreadyOpen(extensionId: string): boolean {
    const lastOpened = this.webviewInstances.get(extensionId);
    if (!lastOpened) { return false; }

    const timeDiff = Date.now() - lastOpened;
    return timeDiff < 500;
  }

  showExtensionRequiredNotification(dependency: WebviewExtension, commandId: string): void {
    const message = `The extension "${dependency.displayName}" is required to open this webview`;

    vscode.window
      .showInformationMessage(message, 'Install Extension', 'Cancel')
      .then((selection) => {
        if (selection === 'Install Extension') {
          this.installExtension(dependency, commandId);
        }
      });
  }

  async installExtension(dependency: WebviewExtension, commandId: string): Promise<void> {
    if (this.installationInProgress.has(dependency.extensionId)) {
      return;
    }

    this.installationInProgress.add(dependency.extensionId);

    try {
      vscode.window.showInformationMessage(`Downloading ${dependency.displayName}...`);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      await vscode.commands.executeCommand(
        'workbench.extensions.installExtension',
        dependency.extensionId
      );

      let attempts = 0;
      const maxAttempts = 15;

      while (attempts < maxAttempts) {
        const extension = vscode.extensions.getExtension(dependency.extensionId);
        if (extension) { break; }

        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }

      vscode.window.showInformationMessage(`${dependency.displayName} installed successfully! Opening webview...`);

      this.timeoutManager.create(() => {
        this.checkAndOpenWebview(commandId, undefined as unknown as vscode.ExtensionContext);
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

  async showWebviewActivationError(dependency: WebviewExtension, commandId: string, error: Error): Promise<void> {
    const selection = await vscode.window.showErrorMessage(
      `Failed to open "${dependency.displayName}" webview: ${error?.message || 'Unknown error'}`,
      'Retry',
      'Open Marketplace',
      'Check Extension'
    );

    if (selection === 'Retry') {
      this.timeoutManager.create(() => {
        this.checkAndOpenWebview(commandId, undefined as unknown as vscode.ExtensionContext);
      }, 1000);
    } else if (selection === 'Open Marketplace') {
      vscode.commands.executeCommand('workbench.extensions.search', dependency.marketplaceSearch);
    } else if (selection === 'Check Extension') {
      vscode.commands.executeCommand('workbench.view.extensions');
    }
  }

  registerWebviewCommands(context: vscode.ExtensionContext): vscode.Disposable[] {
    const commandMappings: Record<string, string> = {
      'compare-code.openWebview': 'lynx-keymap.checkCompareCode',
    };

    const disposables = Object.keys(WEBVIEW_EXTENSIONS).map((commandId) => {
      const checkCommandId =
        commandMappings[commandId] ||
        `lynx-keymap.check-${commandId.replace(/\./g, '-')}`;

      const disposable = vscode.commands.registerCommand(checkCommandId, () => {
        this.checkAndOpenWebview(commandId, context);
      });

      return disposable;
    });

    context.subscriptions.push(...disposables);
    return disposables;
  }

  dispose(): void {
    this.timeoutManager.dispose();
    this.installationInProgress.clear();
    this.webviewInstances.clear();
  }
}
