import * as vscode from 'vscode';

export async function activate(_context: vscode.ExtensionContext) {
    const newExtensionId = 'bastndev.lynx-keymap';
    const oldExtensionId = 'bastndev.lynx-keymap-75';

    const newExtension = vscode.extensions.getExtension(newExtensionId);

    if (!newExtension) {
        // Automatically install the new extension with a progress notification
        void vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Updating to Lynx Keymap Pro...",
            cancellable: false
        }, async () => {
            try {
                // Programmatically install the new extension
                await vscode.commands.executeCommand('workbench.extensions.installExtension', newExtensionId);
                
                // Prompt user to uninstall this old extension
                const selection = await vscode.window.showInformationMessage(
                    '✅ Lynx Keymap Pro has been installed automatically. Please uninstall this old version (Lynx Keymap 75) to avoid conflicts.',
                    'Uninstall old version'
                );
                
                if (selection === 'Uninstall old version') {
                    await vscode.commands.executeCommand('workbench.extensions.uninstallExtension', oldExtensionId);
                }
            } catch {
                // If installation fails, provide a fallback to install manually
                void vscode.window.showErrorMessage('Error automatically installing Lynx Keymap Pro. Please install it manually.', 'View Extension').then(res => {
                    if (res === 'View Extension') {
                        void vscode.env.openExternal(vscode.Uri.parse(`vscode:extension/${newExtensionId}`));
                    }
                });
            }
        });
    } else {
        // New extension is already installed, just prompt to uninstall the old one
        const selection = await vscode.window.showWarningMessage(
            '⚠️ Lynx Keymap Pro is already installed. Please uninstall this old version (Lynx Keymap 75) to avoid shortcut conflicts.',
            'Uninstall Lynx Keymap 75'
        );

        if (selection === 'Uninstall Lynx Keymap 75') {
            await vscode.commands.executeCommand('workbench.extensions.uninstallExtension', oldExtensionId);
        }
    }
}