const vscode = require('vscode');

class ExtensionChecker {
  constructor() {
    this.extensionDependencies = {
      'f1-toggles.focus': {
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
    this.currentNotificationTimeout = null;
  }

  checkAndExecuteCommand(commandId, context) {
    const dependency = this.extensionDependencies[commandId];
    if (!dependency) {
      return vscode.commands.executeCommand(commandId);
    }

    const extension = vscode.extensions.getExtension(dependency.extensionId);
    if (!extension) {
      this.showExtensionRequiredNotification(dependency, commandId);
    } else if (!extension.isActive) {
      extension
        .activate()
        .then(() => {
          vscode.commands.executeCommand(commandId);
        })
        .catch(() => {
          this.showExtensionActivationError(dependency, commandId);
        });
    } else {
      vscode.commands.executeCommand(commandId);
    }
  }

  showExtensionRequiredNotification(dependency, commandId) {
    const message = `📥 The extension "${dependency.displayName}" is required for this command`;
    vscode.window
      .showInformationMessage(message, 'Install Extension', 'Cancel')
      .then((selection) => {
        if (selection === 'Install Extension') {
          this.installExtension(dependency, commandId);
        }
      });
  }

  clearCurrentNotificationTimeout() {
    if (this.currentNotificationTimeout) {
      clearTimeout(this.currentNotificationTimeout);
      this.currentNotificationTimeout = null;
    }
  }

  showTemporaryNotification(message, duration = 2000) {
    this.clearCurrentNotificationTimeout();
    const notification = vscode.window.showInformationMessage(message);
    this.currentNotificationTimeout = setTimeout(() => {
      // Notification will disappear naturally
    }, duration);
    return notification;
  }

  async installExtension(dependency, commandId) {
    try {
        vscode.window.showInformationMessage(
            `📥 Downloading ${dependency.displayName}...`
        );
        await new Promise(resolve => setTimeout(resolve, 4000));
        await vscode.commands.executeCommand('workbench.extensions.installExtension', dependency.extensionId);
        await new Promise(resolve => setTimeout(resolve, 2000));
        vscode.window.showInformationMessage(
            `✅ ${dependency.displayName} installed successfully`
        );
        setTimeout(() => {
            this.checkAndExecuteCommand(commandId);
        }, 1500);
    } catch (error) {
        vscode.window.showErrorMessage(
            `❌ Error installing ${dependency.displayName}: ${error.message}`,
            'Open Marketplace'
        ).then(selection => {
            if (selection === 'Open Marketplace') {
                vscode.commands.executeCommand('workbench.extensions.search', dependency.marketplaceSearch);
            }
        });
    }
  }

  showExtensionActivationError(dependency, commandId) {
    vscode.window
      .showErrorMessage(
        `$(error) Error activating "${dependency.displayName}"`,
        'Retry'
      )
      .then((selection) => {
        if (selection === 'Retry') {
          setTimeout(() => {
            this.checkAndExecuteCommand(commandId);
          }, 1000);
        }
      });
  }

  registerCheckCommands(context) {
    Object.keys(this.extensionDependencies).forEach((commandId) => {
      const checkCommandId = `lynx-keymap.check-${commandId.replace(
        /\./g,
        '-'
      )}`;
      const disposable = vscode.commands.registerCommand(checkCommandId, () => {
        this.checkAndExecuteCommand(commandId, context);
      });
      context.subscriptions.push(disposable);
    });
  }

  dispose() {
    this.clearCurrentNotificationTimeout();
  }
}

module.exports = ExtensionChecker;
