import * as vscode from 'vscode';

export async function activate(context: vscode.ExtensionContext) {
    const newExtensionId = 'bastndev.lynx-keymap';
    const oldExtensionId = 'bastndev.lynx-keymap-75';

    const checkAndPromptUninstall = async () => {
        const selection = await vscode.window.showWarningMessage(
            '✅ Lynx Keymap Pro is now installed. Please uninstall this old version (Lynx Keymap 75) to avoid shortcut conflicts.',
            'Uninstall Lynx Keymap 75'
        );

        if (selection === 'Uninstall Lynx Keymap 75') {
            await vscode.commands.executeCommand('workbench.extensions.uninstallExtension', oldExtensionId);
        }
    };

    if (!vscode.extensions.getExtension(newExtensionId)) {
        // The new extension is not installed.
        // Ask the user to install it manually.
        void vscode.window.showInformationMessage(
            '⚠️ Lynx Keymap 75 has moved! Please install the new "Lynx Keymap Pro" extension to continue getting updates.',
            'Install Lynx Keymap Pro'
        ).then(selection => {
            if (selection === 'Install Lynx Keymap Pro') {
                void vscode.env.openExternal(vscode.Uri.parse(`vscode:extension/${newExtensionId}`));
            }
        });

        // Listen for when they actually install it
        const disposable = vscode.extensions.onDidChange(() => {
            if (vscode.extensions.getExtension(newExtensionId)) {
                disposable.dispose(); // Stop listening
                void checkAndPromptUninstall();
            }
        });

        context.subscriptions.push(disposable);
    } else {
        // The new extension is already installed, just prompt to uninstall the old one
        await checkAndPromptUninstall();
    }
}