import * as vscode from 'vscode';

const NEW_EXTENSION_ID = 'bastndev.lynx-keymap';

export async function activate(_context: vscode.ExtensionContext) {
    if (!vscode.extensions.getExtension(NEW_EXTENSION_ID)) {
        try {
            await vscode.commands.executeCommand(
                'workbench.extensions.installExtension',
                NEW_EXTENSION_ID
            );
        } catch {
            // ignore — the notification button still lets the user open the page
        }
    }

    const selection = await vscode.window.showWarningMessage(
        '⚠️ Lynx Keymap 75 is deprecated and has merged into Lynx Keymap Pro. Please uninstall this extension. Inside Pro, press Alt+0 to switch to 75% mode.',
        'View Lynx Keymap Pro'
    );

    if (selection === 'View Lynx Keymap Pro') {
        await vscode.env.openExternal(
            vscode.Uri.parse(`vscode:extension/${NEW_EXTENSION_ID}`)
        );
    }
}
