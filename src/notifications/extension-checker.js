const vscode = require('vscode');

class ExtensionChecker {
  constructor() {
    this.extensionDependencies = {
      'f1-toggles.focus': {
        extensionId: 'bastndev.f1',
        displayName: 'F1-Toggles',
        marketplaceSearch: 'bastndev.f1'
      },
      'gitlens.showGraph': {
        extensionId: 'eamodio.gitlens',
        displayName: 'GitLens',
        marketplaceSearch: 'eamodio.gitlens'
      }
    };
  }

  checkAndExecuteCommand(commandId, context) {
    const dependency = this.extensionDependencies[commandId];
        
    if (!dependency) {
      return vscode.commands.executeCommand(commandId);
    }

    const extension = vscode.extensions.getExtension(dependency.extensionId);
        
    if (!extension) {
      this.showExtensionRequiredNotification(dependency);
    } else if (!extension.isActive) {
      extension.activate().then(() => {
        vscode.commands.executeCommand(commandId);
      }).catch(() => {
        this.showExtensionActivationError(dependency);
      });
    } else {
      vscode.commands.executeCommand(commandId);
    }
  }

  showExtensionRequiredNotification(dependency) {
    const message = `$(download) Download the "${dependency.displayName}" extension before using this shortcut`;
        
    vscode.window.showInformationMessage(
      message,
      'Download Extension',
      'Cancel'
    ).then(selection => {
      if (selection === 'Download Extension') {
        vscode.commands.executeCommand('workbench.extensions.search', dependency.marketplaceSearch);
      }
    });
  }

  showExtensionActivationError(dependency) {
    vscode.window.showErrorMessage(
      `$(error) Error activating the "${dependency.displayName}" extension`,
      'Retry'
    ).then(selection => {
      if (selection === 'Retry') {
        setTimeout(() => {
          this.checkAndExecuteCommand(dependency.commandId);
        }, 1000);
      }
    });
  }

  registerCheckCommands(context) {
    Object.keys(this.extensionDependencies).forEach(commandId => {
      const checkCommandId = `lynx-keymap.check-${commandId.replace(/\./g, '-')}`;
            
      const disposable = vscode.commands.registerCommand(checkCommandId, () => {
        this.checkAndExecuteCommand(commandId, context);
      });
            
      context.subscriptions.push(disposable);
    });
  }

  // REMOVED: createGenericChecker method (no longer needed)

  /**
   * Check status of F1-Toggles extension on startup
   */
  async checkF1TogglesStatus() {
    const dependency = this.extensionDependencies['f1-toggles.focus'];
    const extension = vscode.extensions.getExtension(dependency.extensionId);
        
    if (!extension) {
      vscode.window.showInformationMessage(
        '$(info) Lynx Keymap: F1-Toggles extension not detected (optional)',
        'Download F1-Toggles',
        'Ignore'
      ).then(selection => {
        if (selection === 'Download F1-Toggles') {
          vscode.commands.executeCommand('workbench.extensions.search', dependency.marketplaceSearch);
        }
      });
    }
  }

  /**
   * Check status of GitLens extension on startup
   */
  async checkGitLensStatus() {
    const dependency = this.extensionDependencies['gitlens.showGraph'];
    const extension = vscode.extensions.getExtension(dependency.extensionId);
        
    if (!extension) {
      vscode.window.showInformationMessage(
        '$(info) Lynx Keymap: GitLens extension not detected (optional)',
        'Download GitLens',
        'Ignore'
      ).then(selection => {
        if (selection === 'Download GitLens') {
          vscode.commands.executeCommand('workbench.extensions.search', dependency.marketplaceSearch);
        }
      });
    }
  }
}

module.exports = ExtensionChecker;
