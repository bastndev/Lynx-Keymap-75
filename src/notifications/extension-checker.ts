import * as vscode from 'vscode';

// ─── Timeout Manager ──────────────────────────────────────────────────────────
const LOG_PREFIX = '[lynx-keymap]';

class TimeoutManager {
  private activeTimeouts: Set<ReturnType<typeof setTimeout>> = new Set();
  private maxTimeouts    = 10;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() { this.startCleanup(); }

  create(callback: () => void, delay: number): ReturnType<typeof setTimeout> {
    if (this.activeTimeouts.size >= this.maxTimeouts) {
      console.warn(`${LOG_PREFIX} Maximum timeouts reached, clearing oldest`);
      this.clearOldest(Math.floor(this.maxTimeouts / 2));
    }

    const timeout = setTimeout(() => {
      this.activeTimeouts.delete(timeout);
      try { callback(); } catch (error) {
        console.error(`${LOG_PREFIX} Timeout callback error:`, error);
      }
    }, delay);

    this.activeTimeouts.add(timeout);
    return timeout;
  }

  clearAll(): void {
    this.activeTimeouts.forEach(t => clearTimeout(t));
    this.activeTimeouts.clear();
  }

  clearOldest(count: number): void {
    const timeouts = Array.from(this.activeTimeouts);
    for (let i = 0; i < Math.min(count, timeouts.length); i++) {
      clearTimeout(timeouts[i]);
      this.activeTimeouts.delete(timeouts[i]);
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      if (this.activeTimeouts.size > this.maxTimeouts) {
        this.clearOldest(this.activeTimeouts.size - this.maxTimeouts);
      }
    }, 30000);
  }

  dispose(): void {
    this.clearAll();
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const COMMAND_IDS = {
  EXTENSION_CHECK: {
    F1_QUICK_SWITCH: 'lynx-keymap.checkF1QuickSwitch',
    GITLAB:          'lynx-keymap.checkGitLab',
  },
} as const;

interface ExtensionDependency {
  extensionId:       string;
  displayName:       string;
  marketplaceSearch: string;
}

const EXTENSION_DEPENDENCIES: Record<string, ExtensionDependency> = {
  'workbench.view.extension.f1-functions': {
    extensionId:       'bastndev.f1',
    displayName:       'F1-Quick Switch',
    marketplaceSearch: 'bastndev.f1',
  },
  'gitlab.graphView.focus': {
    extensionId:       'bastndev.atm',
    displayName:       'GitLab',
    marketplaceSearch: 'bastndev.atm',
  },
} as const;

// ─── Extension Checker ────────────────────────────────────────────────────────
export class ExtensionChecker {
  private timeoutManager          = new TimeoutManager();
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
      if (!extension.isActive) { await extension.activate(); }
      await vscode.commands.executeCommand(commandId);
    } catch (error) {
      this.showExtensionActivationError(dependency, commandId, error as Error);
    }
  }

  showExtensionRequiredNotification(dependency: ExtensionDependency, commandId: string): void {
    const message = `The extension "${dependency.displayName}" is required for this command`;
    vscode.window
      .showInformationMessage(message, 'Install Extension', 'Cancel')
      .then(selection => {
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
    if (this.installationInProgress.has(dependency.extensionId)) { return; }
    this.installationInProgress.add(dependency.extensionId);

    try {
      vscode.window.showInformationMessage(`Downloading ${dependency.displayName}...`);
      await new Promise(resolve => setTimeout(resolve, 4000));

      await vscode.commands.executeCommand(
        'workbench.extensions.installExtension',
        dependency.extensionId
      );

      let attempts = 0;
      while (attempts < 10) {
        if (vscode.extensions.getExtension(dependency.extensionId)) { break; }
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      vscode.window.showInformationMessage(`${dependency.displayName} installed successfully`);

      this.timeoutManager.create(() => {
        this.checkAndExecuteCommand(commandId, undefined as unknown as vscode.ExtensionContext);
      }, 1500);
    } catch (error) {
      const selection = await vscode.window.showErrorMessage(
        `Failed to install ${dependency.displayName}: ${(error as Error).message}`,
        'Open Marketplace', 'Retry'
      );
      if (selection === 'Open Marketplace') {
        vscode.commands.executeCommand('workbench.extensions.search', dependency.marketplaceSearch);
      } else if (selection === 'Retry') {
        this.timeoutManager.create(() => { this.installExtension(dependency, commandId); }, 1000);
      }
    } finally {
      this.installationInProgress.delete(dependency.extensionId);
    }
  }

  async showExtensionActivationError(dependency: ExtensionDependency, commandId: string, error: Error): Promise<void> {
    const selection = await vscode.window.showErrorMessage(
      `Failed to activate "${dependency.displayName}": ${error?.message || 'Unknown error'}`,
      'Retry', 'Open Marketplace'
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
    Object.keys(EXTENSION_DEPENDENCIES).forEach(commandId => {
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
