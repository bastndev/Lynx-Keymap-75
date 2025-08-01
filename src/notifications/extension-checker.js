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
            this.showExtensionRequiredNotification(dependency, commandId);
        } else if (!extension.isActive) {
            extension.activate().then(() => {
                vscode.commands.executeCommand(commandId);
            }).catch(() => {
                this.showExtensionActivationError(dependency, commandId);
            });
        } else {
            vscode.commands.executeCommand(commandId);
        }
    }

    showExtensionRequiredNotification(dependency, commandId) {
        const message = `📥 The extension "${dependency.displayName}" is required for this command`;
        vscode.window.showInformationMessage(
            message,
            'Install Extension',
            'Cancel'
        ).then(selection => {
            if (selection === 'Install Extension') {
                this.installExtension(dependency, commandId);
            }
        });
    }

    async installExtension(dependency, commandId) {
        try {
            // Show progress notification
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Installing ${dependency.displayName}...`,
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: "Downloading..." });
                
                // Install the extension using VS Code command
                await vscode.commands.executeCommand('workbench.extensions.installExtension', dependency.extensionId);
                
                progress.report({ increment: 50, message: "Activating..." });
                
                // Wait a moment for the installation to complete
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                progress.report({ increment: 100, message: "Completed" });
            });

            // Show success message and ask if the command should be executed
            const result = await vscode.window.showInformationMessage(
                `✅ ${dependency.displayName} installed successfully`,
                'Run Command',
                'OK'
            );

            if (result === 'Run Command') {
                // Execute the original command after installation
                setTimeout(() => {
                    this.checkAndExecuteCommand(commandId);
                }, 1000);
            }

        } catch (error) {
            // Handle installation errors
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
        vscode.window.showErrorMessage(
            `$(error) Error activating "${dependency.displayName}"`,
            'Retry'
        ).then(selection => {
            if (selection === 'Retry') {
                setTimeout(() => {
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
