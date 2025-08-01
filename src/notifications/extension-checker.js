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
        // Variable para controlar la notificación actual
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

    // Método para limpiar timeout anterior y crear uno nuevo
    clearCurrentNotificationTimeout() {
        if (this.currentNotificationTimeout) {
            clearTimeout(this.currentNotificationTimeout);
            this.currentNotificationTimeout = null;
        }
    }

    // Método para mostrar notificación temporal que se oculta automáticamente
    showTemporaryNotification(message, duration = 2000) {
        this.clearCurrentNotificationTimeout();
        
        const notification = vscode.window.showInformationMessage(message);
        
        // Programar que se oculte después del tiempo especificado
        this.currentNotificationTimeout = setTimeout(() => {
            // La notificación se ocultará automáticamente cuando aparezca la siguiente
            // o cuando VS Code maneje su ciclo de vida
        }, duration);
        
        return notification;
    }

    async installExtension(dependency, commandId) {
        try {
            // 1. Primera notificación: Downloading
            vscode.window.showInformationMessage(
                `📥 Downloading ${dependency.displayName}...`
            );
            
            // Wait longer to allow "Downloading" notification to disappear naturally
            // before VS Code shows "Installing" notification
            await new Promise(resolve => setTimeout(resolve, 4000));
            
            // Install the extension using VS Code command
            // La notificación "Installing..." aparece automáticamente por VS Code
            // y debería reemplazar naturalmente la notificación anterior
            await vscode.commands.executeCommand('workbench.extensions.installExtension', dependency.extensionId);
            
            // Wait to complete installation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 2. Notificación de éxito (aparece después de la instalación)
            const successNotification = vscode.window.showInformationMessage(
                `✅ ${dependency.displayName} installed successfully`
            );
            
            // Execute command automatically after brief delay
            setTimeout(() => {
                this.checkAndExecuteCommand(commandId);
            }, 1500); // Reduced to 1.5 seconds since success notification disappears quickly

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

    // Método para limpiar recursos cuando se desactive la extensión
    dispose() {
        this.clearCurrentNotificationTimeout();
    }
}

module.exports = ExtensionChecker;