const vscode = require('vscode');

class ExtensionChecker {
    constructor() {
        this.extensionDependencies = {
            'f1-toggles.focus': {
                extensionId: 'bastndev.f1',
                displayName: 'F1-Quick Switch',
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
        const message = `📥 Download the "${dependency.displayName}" extension before using this shortcut`;
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
                    // Fix: Find the correct commandId for this dependency
                    const commandId = Object.keys(this.extensionDependencies).find(
                        key => this.extensionDependencies[key] === dependency
                    );
                    this.checkAndExecuteCommand(commandId);
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
}

module.exports = ExtensionChecker;
